# TeleMsg 服务器配置说明

## 概述

TeleMsg 客户端支持灵活的服务器地址配置，**不限于** 127.0.0.1:8080。你可以通过环境变量配置连接到任何可访问的服务器。

## 配置方法

### 1. 环境变量配置

在 `ui/.env` 文件中设置以下变量：

```bash
# HTTP API 服务器地址
VITE_API_URL=http://your-server:port/api

# WebSocket 服务器地址  
VITE_WS_URL=ws://your-server:port/ws
```

### 2. 支持的配置示例

#### 本地开发 (默认)
```bash
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
```

#### 局域网服务器
```bash
VITE_API_URL=http://192.168.1.100:8080/api
VITE_WS_URL=ws://192.168.1.100:8080/ws
```

#### 远程服务器 (HTTP)
```bash
VITE_API_URL=http://your-server.com:8080/api
VITE_WS_URL=ws://your-server.com:8080/ws
```

#### 远程服务器 (HTTPS)
```bash
VITE_API_URL=https://your-server.com/api
VITE_WS_URL=wss://your-server.com/ws
```

#### 自定义端口
```bash
VITE_API_URL=http://192.168.1.50:9090/api
VITE_WS_URL=ws://192.168.1.50:9090/ws
```

### 3. 配置步骤

1. **复制示例配置文件**
   ```bash
   cd ui
   cp .env.example .env
   ```

2. **编辑 .env 文件**
   - 修改 `VITE_API_URL` 为你的 HTTP API 服务器地址
   - 修改 `VITE_WS_URL` 为你的 WebSocket 服务器地址

3. **重启开发服务器** (如果正在运行)
   ```bash
   npm run dev
   ```

### 4. 重要注意事项

- **端口一致性**: 通常 HTTP API 和 WebSocket 使用同一个端口
- **协议匹配**: 
  - HTTP API 使用 `http://` 对应 WebSocket 使用 `ws://`
  - HTTPS API 使用 `https://` 对应 WebSocket 使用 `wss://`
- **路径约定**: 
  - API 端点路径为 `/api`
  - WebSocket 端点路径为 `/ws`
- **防火墙**: 确保目标服务器的端口已开放并可访问
- **CORS**: 跨域请求时服务器需要配置适当的 CORS 策略

### 5. 验证连接

客户端会在浏览器控制台显示连接信息：

```
Connecting to WebSocket: ws://your-server:port/ws?token=...&userId=...
WebSocket connected
```

如果看到连接成功的日志，说明配置正确。

### 6. 常见问题

**Q: 修改配置后不生效怎么办？**
A: 重启开发服务器 `npm run dev`，环境变量只在启动时读取。

**Q: 可以连接到云服务器吗？**
A: 可以，只要服务器可以通过网络访问，配置对应的公网IP或域名即可。

**Q: 支持 HTTPS/WSS 吗？**
A: 完全支持，适用于生产环境的安全连接。

**Q: 如何连接到 Docker 容器中的服务器？**
A: 使用宿主机IP和映射端口，例如 `http://localhost:8080/api`。

## 总结

TeleMsg 客户端的服务器配置非常灵活，支持：
- ✅ localhost (127.0.0.1)
- ✅ 局域网 IP 地址
- ✅ 远程服务器 IP 或域名
- ✅ 自定义端口
- ✅ HTTP/HTTPS 协议
- ✅ WebSocket/WebSocket Secure
- ✅ 开发、测试、生产环境

通过简单的环境变量配置，可以连接到任何位置的 TeleMsg 服务器。
