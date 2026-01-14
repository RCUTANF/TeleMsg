# TeleMsg 音视频通话快速启动指南

## 🚀 快速开始（5分钟）

### 第一步：安装Mediasoup服务器依赖

打开PowerShell，执行：

```powershell
cd D:\Java_workplace\TeleMsg\TeleMsg-SpringBoot\mediasoup-server
npm install
```

等待安装完成（约1-2分钟）。

### 第二步：启动Mediasoup服务器

**方式1：使用启动脚本**（推荐）
```powershell
cd D:\Java_workplace\TeleMsg\TeleMsg-SpringBoot
.\start-mediasoup.bat
```

**方式2：手动启动**
```powershell
cd D:\Java_workplace\TeleMsg\TeleMsg-SpringBoot\mediasoup-server
npm start
```

看到以下输出表示成功：
```
✅ 4 Mediasoup workers initialized
🚀 Mediasoup server running on port 3000
📡 RTC ports: 40000-49999
```

### 第三步：启动前端应用

打开新的PowerShell窗口：

```powershell
cd D:\Java_workplace\TeleMsg\ui
npm run dev
```

### 第四步：测试音视频通话

1. 打开浏览器访问 `http://localhost:5173`
2. 登录两个不同的用户账号（可以用两个浏览器标签页）
3. 在联系人列表选择对方
4. 点击视频或语音通话按钮
5. 允许浏览器访问麦克风和摄像头
6. 开始通话！

## ✅ 验证清单

- [ ] Mediasoup服务器正常启动（端口3000）
- [ ] 前端应用正常运行（端口5173）
- [ ] 浏览器控制台无错误
- [ ] 能看到本地视频预览
- [ ] 能听到/看到对方的音视频

## 🔧 常见问题

### 问题1：端口被占用

**现象**：
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决**：
```powershell
# 查找占用端口的进程
netstat -ano | findstr :3000

# 结束进程（替换<PID>为实际进程ID）
taskkill /PID <PID> /F
```

### 问题2：无法访问摄像头

**现象**：浏览器提示"无法访问摄像头"

**解决**：
1. 确保使用Chrome/Edge浏览器
2. 检查浏览器权限设置
3. 确保摄像头未被其他应用占用

### 问题3：看不到远程视频

**现象**：本地视频正常，但看不到对方

**解决**：
1. 检查Mediasoup服务器日志
2. 打开浏览器控制台查看错误
3. 确认防火墙未阻止WebRTC连接

### 问题4：模块导入错误

**现象**：TypeScript报错"Cannot find module"

**解决**：
```powershell
cd D:\Java_workplace\TeleMsg\ui
npm install
```

然后重启IDE或刷新。

## 📊 架构概览

```
用户A浏览器 ←→ Mediasoup Server (3001) ←→ 用户B浏览器
     ↑                    ↑                       ↑
     └────────────── WebRTC P2P/Relay ───────────┘
```

## 🎯 功能说明

### 已实现功能

✅ 一对一视频通话
✅ 一对一语音通话  
✅ 实时音视频传输
✅ 静音控制
✅ 摄像头开关
✅ 通话计时
✅ 连接状态显示

### 待实现功能

⏳ 多方视频会议
⏳ 屏幕共享
⏳ 通话录制
⏳ 美颜功能
⏳ 虚拟背景
⏳ 通话质量监控

## 📁 关键文件

```
TeleMsg-SpringBoot/
├── mediasoup-server/          # Mediasoup服务器
│   ├── src/
│   │   ├── server.js          # 服务器主文件
│   │   ├── mediasoup-service.js  # WebRTC逻辑
│   │   └── config.js          # 配置
│   ├── .env                   # 环境变量
│   └── package.json           # 依赖配置
└── start-mediasoup.bat        # 快速启动脚本

ui/
├── src/
│   └── app/
│       ├── services/
│       │   └── mediasoup.ts   # 前端WebRTC服务
│       └── components/
│           └── VideoCallDialog.tsx  # 通话界面
└── package.json
```

## 🔐 安全提示

### 开发环境
- 使用 `http://localhost`
- 无需HTTPS

### 生产环境（必须）
- 使用HTTPS
- 配置正确的公网IP
- 开放必要的防火墙端口

## 📝 下一步

1. **测试通话功能**
   - 尝试视频通话
   - 尝试语音通话
   - 测试静音和摄像头开关

2. **查看文档**
   - [完整集成指南](MEDIASOUP_INTEGRATION_GUIDE.md)
   - [Mediasoup服务器README](mediasoup-server/README.md)

3. **配置生产环境**
   - 修改 `.env` 文件
   - 设置公网IP
   - 配置防火墙

## 💡 提示

- 首次通话会请求麦克风/摄像头权限
- 可以在浏览器隐私设置中管理权限
- 使用Chrome或Edge浏览器效果最佳
- 本地视频会自动镜像显示

## 🆘 需要帮助？

遇到问题请检查：
1. 浏览器控制台（F12）
2. Mediasoup服务器日志
3. 网络连接状态

或查阅：
- [故障排查指南](MEDIASOUP_INTEGRATION_GUIDE.md#故障排查)
- [Mediasoup官方文档](https://mediasoup.org/)

---

**准备好了吗？开始你的第一次音视频通话吧！** 🎉

