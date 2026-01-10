package com.telemsg.server.im;

import com.google.gson.Gson;
import com.telemsg.server.entity.Message;
import com.telemsg.server.service.GroupService;
import com.telemsg.server.service.MessageService;
import com.telemsg.server.service.UserService;
import io.netty.channel.Channel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.x52im.mobileimsdk.server.event.ServerEventListener;
import net.x52im.mobileimsdk.server.protocal.Protocal;
import org.springframework.stereotype.Component;

/**
 * TeleMsg服务端事件监听器实现
 * 集成SpringBoot服务与MobileIMSDK
 *
 * @author TeleMsg Team
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TeleMsgServerEventListener implements ServerEventListener {

    private final UserService userService;
    private final MessageService messageService;
    private final GroupService groupService;
    private final IMSessionManager sessionManager;
    private final Gson gson = new Gson();

    @Override
    public int onUserLoginVerify(String userId, String token, String extra, Channel session) {
        log.info("用户登录验证: userId={}, extra={}", userId, extra);

        try {
            // 验证用户是否存在
            if (userService.findByUserId(userId).isEmpty()) {
                log.warn("用户登录失败: 用户不存在 userId={}", userId);
                return 1025; // 用户不存在
            }

            // TODO: 这里可以添加更复杂的验证逻辑，比如验证token

            log.info("用户登录验证成功: userId={}", userId);
            return 0; // 验证通过

        } catch (Exception e) {
            log.error("用户登录验证异常: userId={}", userId, e);
            return 1026; // 验证异常
        }
    }

    @Override
    public void onUserLoginSucess(String userId, String extra, Channel session) {
        log.info("用户登录成功: userId={}", userId);

        try {
            // 更新用户在线状态
            userService.updateUserStatus(userId, com.telemsg.server.entity.User.UserStatus.ONLINE);

            // 记录用户会话
            String clientIp = getClientIp(session);
            userService.updateLastLoginInfo(userId, clientIp);

            // 管理用户会话
            sessionManager.addUserSession(userId, session);

            log.info("用户上线处理完成: userId={}, clientIp={}", userId, clientIp);

        } catch (Exception e) {
            log.error("用户上线处理异常: userId={}", userId, e);
        }
    }

    @Override
    public void onUserLogout(String userId, Channel session, int beKickoutCode) {
        log.info("用户下线: userId={}, beKickoutCode={}", userId, beKickoutCode);

        try {
            // 更新用户离线状态
            userService.updateUserStatus(userId, com.telemsg.server.entity.User.UserStatus.OFFLINE);

            // 移除用户会话
            sessionManager.removeUserSession(userId);

            log.info("用户下线处理完成: userId={}", userId);

        } catch (Exception e) {
            log.error("用户下线处理��常: userId={}", userId, e);
        }
    }

    @Override
    public boolean onTransferMessage4C2SBefore(Protocal p, Channel session) {
        // 消息预处理，可以在这里进行消息过滤、敏感词检查等
        log.debug("C2S消息预处理: from={}, content={}", p.getFrom(), p.getDataContent());
        return true; // 允许继续处理
    }

    @Override
    public boolean onTransferMessage4C2CBefore(Protocal p, Channel session) {
        // 消息预处理，可以在这里进行消息过滤、敏感词检查等
        log.debug("C2C消息��处理: from={}, to={}, content={}", p.getFrom(), p.getTo(), p.getDataContent());
        return true; // 允许继续处理
    }

    @Override
    public boolean onTransferMessage4C2S(Protocal p, Channel session) {
        log.debug("收到C2S消息: from={}, content={}", p.getFrom(), p.getDataContent());

        try {
            // 解析消息内容
            MessageData messageData = parseMessageData(p);

            // 处理不同类型的C2S消息
            switch (messageData.getType()) {
                case "heartbeat":
                    handleHeartbeat(p.getFrom());
                    break;
                case "system":
                    handleSystemMessage(messageData);
                    break;
                default:
                    log.warn("未知的C2S消息类型: {}", messageData.getType());
            }

            return true;

        } catch (Exception e) {
            log.error("C2S消息处理异常: from={}", p.getFrom(), e);
            return false;
        }
    }

    @Override
    public void onTransferMessage4C2C(Protocal p) {
        log.debug("收到C2C消息: from={}, to={}, content={}", p.getFrom(), p.getTo(), p.getDataContent());

        try {
            // 解析消息内容
            MessageData messageData = parseMessageData(p);

            // 保存消息到数据库
            Message savedMessage;

            if (messageData.getGroupId() != null) {
                // 群聊消息
                savedMessage = messageService.sendGroupMessage(
                    p.getFrom(),
                    messageData.getGroupId(),
                    Message.MessageType.valueOf(messageData.getMessageType().toUpperCase()),
                    messageData.getContent(),
                    messageData.getMediaUrl()
                );
            } else {
                // 私聊消息
                savedMessage = messageService.sendPrivateMessage(
                    p.getFrom(),
                    p.getTo(),
                    Message.MessageType.valueOf(messageData.getMessageType().toUpperCase()),
                    messageData.getContent(),
                    messageData.getMediaUrl()
                );
            }

            log.info("消息保存成功: messageId={}", savedMessage.getMessageId());

        } catch (Exception e) {
            log.error("C2C消息处理异常: from={}, to={}", p.getFrom(), p.getTo(), e);
        }
    }

    @Override
    public boolean onTransferMessage_RealTimeSendFaild(Protocal p) {
        log.warn("消息实时发送失败，进行离线存储: from={}, to={}, content={}",
                p.getFrom(), p.getTo(), p.getDataContent());

        try {
            // 解析消息内容
            MessageData messageData = parseMessageData(p);

            // 保存为离线消息
            Message savedMessage;

            if (messageData.getGroupId() != null) {
                // 群聊离线消息
                savedMessage = messageService.sendGroupMessage(
                    p.getFrom(),
                    messageData.getGroupId(),
                    Message.MessageType.valueOf(messageData.getMessageType().toUpperCase()),
                    messageData.getContent(),
                    messageData.getMediaUrl()
                );
            } else {
                // 私聊离线消息
                savedMessage = messageService.sendPrivateMessage(
                    p.getFrom(),
                    p.getTo(),
                    Message.MessageType.valueOf(messageData.getMessageType().toUpperCase()),
                    messageData.getContent(),
                    messageData.getMediaUrl()
                );
            }

            log.info("离线消息保存成功: messageId={}", savedMessage.getMessageId());
            return true; // 表示已处理离线消息

        } catch (Exception e) {
            log.error("离线消息处理异常: from={}, to={}", p.getFrom(), p.getTo(), e);
            return false; // 处理失败
        }
    }

    @Override
    public void onTransferMessage4C2C_AfterBridge(Protocal p) {
        // 桥接消息处理，目前不需要特殊处理
        log.debug("桥接消息处理: from={}, to={}", p.getFrom(), p.getTo());
    }

    /**
     * 解析消息数据
     */
    private MessageData parseMessageData(Protocal p) {
        try {
            return gson.fromJson(p.getDataContent(), MessageData.class);
        } catch (Exception e) {
            // 如果解析失败，创建一个默认的消息数据
            MessageData messageData = new MessageData();
            messageData.setType("text");
            messageData.setMessageType("text");
            messageData.setContent(p.getDataContent());
            return messageData;
        }
    }

    /**
     * 处理心跳消息
     */
    private void handleHeartbeat(String userId) {
        log.debug("收到用户心跳: userId={}", userId);
        sessionManager.updateUserHeartbeat(userId);
    }

    /**
     * 处理系统消息
     */
    private void handleSystemMessage(MessageData messageData) {
        log.debug("处理系统消息: {}", messageData);
        // 这里可以处理各种系统消息，比如群组操作等
    }

    /**
     * 获取客户端IP地址
     */
    private String getClientIp(Channel channel) {
        try {
            return channel.remoteAddress().toString();
        } catch (Exception e) {
            return "unknown";
        }
    }

    /**
     * 消息数据结构
     */
    public static class MessageData {
        private String type = "text";
        private String messageType = "text";
        private String content;
        private String mediaUrl;
        private String fileName;
        private String groupId;

        // Getters and Setters
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getMessageType() { return messageType; }
        public void setMessageType(String messageType) { this.messageType = messageType; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public String getMediaUrl() { return mediaUrl; }
        public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }

        public String getGroupId() { return groupId; }
        public void setGroupId(String groupId) { this.groupId = groupId; }
    }
}
