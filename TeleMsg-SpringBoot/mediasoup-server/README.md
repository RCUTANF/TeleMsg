# TeleMsg Mediasoup 音视频服务器

基于 Mediasoup 的高性能 WebRTC SFU 服务器，为 TeleMsg 提供音视频通话功能。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

编辑 `.env` 文件：

```env
PORT=3000
RTC_MIN_PORT=40000
RTC_MAX_PORT=49999
ANNOUNCED_IP=127.0.0.1
LOG_LEVEL=debug
```

### 3. 启动服务器

```bash
npm start
```

或使用脚本（Windows）：
```bash
start-mediasoup.bat
```

## 项目结构

```
mediasoup-server/
├── src/
│   ├── server.js              # 主服务器文件
│   ├── mediasoup-service.js   # Mediasoup 服务封装
│   └── config.js              # 配置文件
├── .env                       # 环境变量
├── package.json              # 依赖配置
└── README.md                 # 本文件
```

## 功能特性

- ✅ 一对一音视频通话
- ✅ 多方音视频通话
- ✅ 音频/视频独立控制
- ✅ 动态编解码器选择（VP8/VP9/H264）
- ✅ Opus 音频编解码
- ✅ 自动负载均衡（多 Worker）
- ✅ Socket.IO 实时信令

## API 说明

### Socket.IO 事件

#### 客户端发送事件

- `join-room` - 加入通话房间
  ```javascript
  socket.emit('join-room', { roomId, userId }, (response) => {
    console.log(response);
  });
  ```

- `create-transport` - 创建 WebRTC 传输通道
  ```javascript
  socket.emit('create-transport', { roomId, direction: 'send' }, (response) => {
    console.log(response);
  });
  ```

- `connect-transport` - 连接传输通道
  ```javascript
  socket.emit('connect-transport', { transportId, dtlsParameters }, (response) => {
    console.log(response);
  });
  ```

- `produce` - 发送媒体流
  ```javascript
  socket.emit('produce', { transportId, kind, rtpParameters }, (response) => {
    console.log(response);
  });
  ```

- `consume` - 接收媒体流
  ```javascript
  socket.emit('consume', { transportId, producerId, rtpCapabilities }, (response) => {
    console.log(response);
  });
  ```

- `resume-consumer` - 恢复消费者
  ```javascript
  socket.emit('resume-consumer', { consumerId }, (response) => {
    console.log(response);
  });
  ```

- `close-producer` - 关闭生产者
  ```javascript
  socket.emit('close-producer', { producerId }, (response) => {
    console.log(response);
  });
  ```

#### 服务端推送事件

- `new-producer` - 新的媒体流加入
  ```javascript
  socket.on('new-producer', ({ producerId, userId, kind }) => {
    console.log(`New ${kind} from ${userId}`);
  });
  ```

### REST API

- `GET /health` - 健康检查
- `GET /rtp-capabilities` - 获取 RTP 能力

## 配置说明

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| PORT | 服务器端口 | 3000 |
| RTC_MIN_PORT | RTC 最小端口 | 40000 |
| RTC_MAX_PORT | RTC 最大端口 | 49999 |
| ANNOUNCED_IP | 公网 IP（生产环境） | 127.0.0.1 |
| LOG_LEVEL | 日志级别 | warn |

### 编解码器配置

服务器支持以下编解码器：

**音频：**
- Opus (48kHz, 立体声)

**视频：**
- VP8
- VP9
- H.264 (多种 profile)

客户端会自动选择最优的编解码器。

## 生产环境部署

### 1. 设置公网 IP

编辑 `.env`：
```env
ANNOUNCED_IP=your.server.public.ip
```

### 2. 配置防火墙

开放必要的端口：
```bash
# TCP 端口（信令）
sudo ufw allow 3000/tcp

# UDP 端口范围（媒体）
sudo ufw allow 40000:49999/udp
```

### 3. 使用 PM2 管理进程

安装 PM2：
```bash
npm install -g pm2
```

启动服务：
```bash
pm2 start src/server.js --name mediasoup-server
pm2 save
pm2 startup
```

### 4. 配置 NGINX 反向代理（可选）

```nginx
upstream mediasoup {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://mediasoup;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 性能调优

### Worker 数量

默认使用 CPU 核心数作为 Worker 数量。可在 `src/config.js` 中调整：

```javascript
export const config = {
  mediasoup: {
    numWorkers: 4, // 手动设置 Worker 数量
    // ...
  }
};
```

### 端口范围

根据预期的并发通话数量调整端口范围。每个通话需要多个端口：
- 建议至少 1000 个端口
- 默认配置支持约 5000 个并发连接

### 带宽限制

在 `src/config.js` 中调整：

```javascript
webRtcTransport: {
  initialAvailableOutgoingBitrate: 1000000, // 1 Mbps
  maxIncomingBitrate: 1500000, // 1.5 Mbps
}
```

## 监控和日志

### 日志级别

可用的日志级别：
- `debug` - 详细调试信息
- `warn` - 警告信息（推荐生产环境）
- `error` - 仅错误信息

### 监控指标

服务器会输出以下信息：
- Worker 状态
- Router 创建
- Transport 连接
- Producer/Consumer 状态

## 故障排查

### 服务器无法启动

1. 检查端口是否被占用：
   ```bash
   netstat -ano | findstr :3001
   ```

2. 检查 Node.js 版本（需要 >= 16）：
   ```bash
   node --version
   ```

### 客户端无法连接

1. 检查防火墙设置
2. 确认 ANNOUNCED_IP 配置正确
3. 查看服务器日志

### 视频质量问题

1. 检查网络带宽
2. 调整编解码器参数
3. 减少并发连接数

## 开发说明

### 添加新功能

1. 修改 `src/mediasoup-service.js` 添加业务逻辑
2. 在 `src/server.js` 中添加 Socket.IO 事件处理
3. 更新客户端代码

### 测试

```bash
npm test
```

## 依赖项

- `mediasoup` - WebRTC SFU 核心库
- `express` - HTTP 服务器
- `socket.io` - 实时通信
- `cors` - 跨域支持
- `dotenv` - 环境变量管理

## 许可证

MIT

## 技术支持

如有问题，请查看：
- [完整集成指南](../MEDIASOUP_INTEGRATION_GUIDE.md)
- [Mediasoup 官方文档](https://mediasoup.org/)

---

**TeleMsg Team** - 企业级即时通讯解决方案

