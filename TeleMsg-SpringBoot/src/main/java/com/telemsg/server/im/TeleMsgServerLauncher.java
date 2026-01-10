package com.telemsg.server.im;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import net.x52im.mobileimsdk.server.ServerLauncher;
import net.x52im.mobileimsdk.server.network.Gateway;
import net.x52im.mobileimsdk.server.network.GatewayTCP;
import net.x52im.mobileimsdk.server.network.GatewayUDP;
import net.x52im.mobileimsdk.server.network.GatewayWebsocket;
import net.x52im.mobileimsdk.server.qos.QoS4ReciveDaemonC2S;
import net.x52im.mobileimsdk.server.qos.QoS4SendDaemonS2C;
import net.x52im.mobileimsdk.server.utils.ServerToolKits;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * TeleMsg服务端启动器
 * 集成MobileIMSDK与SpringBoot
 *
 * @author TeleMsg Team
 */
@Slf4j
@Component
public class TeleMsgServerLauncher extends ServerLauncher implements CommandLineRunner {

    private final TeleMsgServerEventListener serverEventListener;
    @Getter
    private final IMSessionManager sessionManager;
    private final TeleMsgQoSEventListener qoSEventListener;

    @Value("${telemsg.server.tcp.port:8901}")
    private int tcpPort;

    @Value("${telemsg.server.websocket.port:3000}")
    private int websocketPort;

    @Value("${telemsg.server.udp.port:7901}")
    private int udpPort;

    @Value("${telemsg.server.ssl.enabled:false}")
    private boolean sslEnabled;

    public TeleMsgServerLauncher(TeleMsgServerEventListener serverEventListener,
                                 IMSessionManager sessionManager,
                                 TeleMsgQoSEventListener qoSEventListener) throws IOException {
        super();
        this.serverEventListener = serverEventListener;
        this.sessionManager = sessionManager;
        this.qoSEventListener = qoSEventListener;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("正在启动TeleMsg服务端...");

        try {
            // 配置服务端参数
            configureServer();

            // 启动IM服务器
            startup();

            log.info("TeleMsg服务端启动成功!");
            log.info("TCP端口: {}", tcpPort);
            log.info("WebSocket端口: {}", websocketPort);
            log.info("UDP端口: {}", udpPort);
            log.info("SSL加密: {}", sslEnabled ? "启用" : "禁用");

        } catch (Exception e) {
            log.error("TeleMsg服务端启动失败", e);
            throw e;
        }
    }

    /**
     * 配置服务端参数
     */
    private void configureServer() {
        // 设置网络端口
        GatewayUDP.PORT = udpPort;
        GatewayTCP.PORT = tcpPort;
        GatewayWebsocket.PORT = websocketPort;

        // 设置支持的协议（支持所有协议）
        ServerLauncher.supportedGateways = Gateway.SOCKET_TYPE_UDP | Gateway.SOCKET_TYPE_TCP | Gateway.SOCKET_TYPE_WEBSOCKET;

        // 开启QoS调试
        QoS4SendDaemonS2C.getInstance().setDebugable(true);
        QoS4ReciveDaemonC2S.getInstance().setDebugable(true);

        // 设置心跳频率模式
        ServerToolKits.setSenseModeTCP(ServerToolKits.SenseModeTCP.MODE_5S);
        ServerToolKits.setSenseModeWebsocket(ServerToolKits.SenseModeWebsocket.MODE_5S);

        // 关闭跨服桥接器（我们使用SpringBoot的服务发现）
        ServerLauncher.bridgeEnabled = false;

        // TODO: SSL配置
        if (sslEnabled) {
            // 这里可以配置SSL证书
            log.info("SSL加密已启用");
        }

        log.info("TeleMsg服务端参数配置完成");
    }

    @Override
    protected void initListeners() {
        // 设置服务端事件监听器
        this.setServerEventListener(serverEventListener);

        // 设置QoS事件监听器
        this.setServerMessageQoSEventListener(qoSEventListener);

        log.info("TeleMsg事件监听器初始化完成");
    }
}
