package com.telemsg.server.websocket;

import com.telemsg.server.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket处理器
 *
 * @author TeleMsg Team
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TeleMsgWebSocketHandler implements WebSocketHandler {

    private final JwtService jwtService;

    // 存储活跃的WebSocket连接
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userId = getUserIdFromSession(session);
        if (userId != null) {
            userSessions.put(userId, session);
            log.info("WebSocket连接建立: userId={}, sessionId={}", userId, session.getId());
        } else {
            session.close(CloseStatus.POLICY_VIOLATION.withReason("Invalid token"));
        }
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        String userId = getUserIdFromSession(session);
        if (userId != null) {
            log.debug("收到WebSocket消息: userId={}, message={}", userId, message.getPayload());

            // 这里可以处理客户端发送的实时消息
            // 例如：聊天消息、状态更新等
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        String userId = getUserIdFromSession(session);
        log.error("WebSocket传输错误: userId={}, error={}", userId, exception.getMessage());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        String userId = getUserIdFromSession(session);
        if (userId != null) {
            userSessions.remove(userId);
            log.info("WebSocket连接关闭: userId={}, reason={}", userId, closeStatus.getReason());
        }
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    /**
     * 向指定用户发送消息
     */
    public void sendMessageToUser(String userId, String message) {
        WebSocketSession session = userSessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                session.sendMessage(new TextMessage(message));
                log.debug("向用户发送WebSocket消息: userId={}, message={}", userId, message);
            } catch (IOException e) {
                log.error("发送WebSocket消息失败: userId={}, error={}", userId, e.getMessage());
                userSessions.remove(userId);
            }
        }
    }

    /**
     * 广播消息给所有在线用户
     */
    public void broadcastMessage(String message) {
        userSessions.forEach((userId, session) -> {
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(message));
                } catch (IOException e) {
                    log.error("广播消息失败: userId={}, error={}", userId, e.getMessage());
                    userSessions.remove(userId);
                }
            }
        });
    }

    /**
     * 获取在线用户数量
     */
    public int getOnlineUserCount() {
        return userSessions.size();
    }

    /**
     * 检查用户是否在线
     */
    public boolean isUserOnline(String userId) {
        WebSocketSession session = userSessions.get(userId);
        return session != null && session.isOpen();
    }

    /**
     * 从WebSocket会话中提取用户ID
     */
    private String getUserIdFromSession(WebSocketSession session) {
        try {
            String query = session.getUri().getQuery();
            if (query != null) {
                String[] params = query.split("&");
                String token = null;
                String userId = null;

                for (String param : params) {
                    String[] keyValue = param.split("=");
                    if (keyValue.length == 2) {
                        if ("token".equals(keyValue[0])) {
                            token = keyValue[1];
                        } else if ("userId".equals(keyValue[0])) {
                            userId = keyValue[1];
                        }
                    }
                }

                if (token != null && userId != null) {
                    if (jwtService.isTokenValid(token)) {
                        String tokenUserId = jwtService.extractUserId(token);
                        if (userId.equals(tokenUserId)) {
                            return userId;
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("提取用户ID失败", e);
        }
        return null;
    }
}
