package com.telemsg.server.im;

import io.netty.channel.Channel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * IM会话管理器
 * 管理用户的网络会话状态
 *
 * @author TeleMsg Team
 */
@Slf4j
@Component
public class IMSessionManager {

    /**
     * 用户会话映射表 userId -> Channel
     */
    private final ConcurrentMap<String, Channel> userSessions = new ConcurrentHashMap<>();

    /**
     * 用户最后活跃时间 userId -> LocalDateTime
     */
    private final ConcurrentMap<String, LocalDateTime> userHeartbeats = new ConcurrentHashMap<>();

    /**
     * Channel到用户ID的映射 Channel -> userId
     */
    private final ConcurrentMap<Channel, String> channelUsers = new ConcurrentHashMap<>();

    /**
     * 添加用户会话
     */
    public void addUserSession(String userId, Channel channel) {
        // 如果用户已经有会话，先移除旧的
        removeUserSession(userId);

        userSessions.put(userId, channel);
        channelUsers.put(channel, userId);
        userHeartbeats.put(userId, LocalDateTime.now());

        log.info("用户会话添加成功: userId={}, channel={}", userId, channel.id().asShortText());
    }

    /**
     * 移除用户会话
     */
    public void removeUserSession(String userId) {
        Channel channel = userSessions.remove(userId);
        if (channel != null) {
            channelUsers.remove(channel);
            userHeartbeats.remove(userId);

            // 如果Channel还活跃，尝试关闭
            if (channel.isActive()) {
                try {
                    channel.close();
                } catch (Exception e) {
                    log.warn("关闭Channel异常: userId={}", userId, e);
                }
            }

            log.info("用户会话移除成功: userId={}, channel={}", userId, channel.id().asShortText());
        }
    }

    /**
     * 通过Channel移除会话
     */
    public void removeSessionByChannel(Channel channel) {
        String userId = channelUsers.remove(channel);
        if (userId != null) {
            userSessions.remove(userId);
            userHeartbeats.remove(userId);

            log.info("通过Channel移除会话成功: userId={}, channel={}", userId, channel.id().asShortText());
        }
    }

    /**
     * 获取用户会话
     */
    public Channel getUserSession(String userId) {
        return userSessions.get(userId);
    }

    /**
     * 检查用户是否在线
     */
    public boolean isUserOnline(String userId) {
        Channel channel = userSessions.get(userId);
        return channel != null && channel.isActive();
    }

    /**
     * 获取在线用户数量
     */
    public int getOnlineUserCount() {
        return userSessions.size();
    }

    /**
     * 获取所有在线用户ID
     */
    public java.util.Set<String> getOnlineUsers() {
        return userSessions.keySet();
    }

    /**
     * 更新用户心跳时间
     */
    public void updateUserHeartbeat(String userId) {
        if (userSessions.containsKey(userId)) {
            userHeartbeats.put(userId, LocalDateTime.now());
            log.debug("用户心跳更新: userId={}", userId);
        }
    }

    /**
     * 获取用户最后活跃时间
     */
    public LocalDateTime getUserLastHeartbeat(String userId) {
        return userHeartbeats.get(userId);
    }

    /**
     * 清理过期会话（用于定时任务）
     */
    public void cleanExpiredSessions() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expireTime = now.minusMinutes(10); // 10分钟无心跳视为过期

        userHeartbeats.entrySet().removeIf(entry -> {
            String userId = entry.getKey();
            LocalDateTime lastHeartbeat = entry.getValue();

            if (lastHeartbeat.isBefore(expireTime)) {
                log.info("清理过期会话: userId={}, lastHeartbeat={}", userId, lastHeartbeat);
                removeUserSession(userId);
                return true;
            }

            return false;
        });
    }

    /**
     * 踢出用户（强制下线）
     */
    public boolean kickUser(String userId, String reason) {
        Channel channel = userSessions.get(userId);
        if (channel != null && channel.isActive()) {
            try {
                // 这里可以发送踢出通知消息
                // TODO: 发送踢出消息给客户端

                channel.close();
                removeUserSession(userId);

                log.info("用户被踢出: userId={}, reason={}", userId, reason);
                return true;

            } catch (Exception e) {
                log.error("踢出用户失败: userId={}, reason={}", userId, reason, e);
                return false;
            }
        }

        return false;
    }

    /**
     * 广播消息给所有在线用户
     */
    public void broadcastToAllUsers(String message) {
        userSessions.forEach((userId, channel) -> {
            if (channel.isActive()) {
                try {
                    // TODO: 这里需要根据MobileIMSDK的协议格式发送消息
                    log.debug("广播消息给用户: userId={}, message={}", userId, message);
                } catch (Exception e) {
                    log.error("广播消息失败: userId={}", userId, e);
                }
            }
        });
    }

    /**
     * 发送消息给指定用户
     */
    public boolean sendMessageToUser(String userId, String message) {
        Channel channel = userSessions.get(userId);
        if (channel != null && channel.isActive()) {
            try {
                // TODO: 这里需要根据MobileIMSDK的协议格式发送消息
                log.debug("发送消息给用户: userId={}, message={}", userId, message);
                return true;

            } catch (Exception e) {
                log.error("发送消息失败: userId={}", userId, e);
                return false;
            }
        }

        return false;
    }

    /**
     * 获取会话统计信息
     */
    public SessionStats getSessionStats() {
        SessionStats stats = new SessionStats();
        stats.setTotalSessions(userSessions.size());
        stats.setActiveSessions((int) userSessions.values().stream().filter(Channel::isActive).count());
        return stats;
    }

    /**
     * 会话统计信息
     */
    public static class SessionStats {
        private int totalSessions;
        private int activeSessions;

        public int getTotalSessions() { return totalSessions; }
        public void setTotalSessions(int totalSessions) { this.totalSessions = totalSessions; }

        public int getActiveSessions() { return activeSessions; }
        public void setActiveSessions(int activeSessions) { this.activeSessions = activeSessions; }
    }
}
