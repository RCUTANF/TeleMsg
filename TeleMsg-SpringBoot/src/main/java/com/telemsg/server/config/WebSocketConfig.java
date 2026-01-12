package com.telemsg.server.config;

import com.telemsg.server.websocket.TeleMsgWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocket配置
 *
 * @author TeleMsg Team
 */
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final TeleMsgWebSocketHandler teleMsgWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(teleMsgWebSocketHandler, "/ws")
                .setAllowedOrigins("*"); // 在生产环境中应该限制具体的域名
    }
}
