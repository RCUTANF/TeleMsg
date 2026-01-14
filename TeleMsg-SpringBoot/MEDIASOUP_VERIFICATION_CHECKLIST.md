# Mediasoup集成验证清单

## 📋 文件创建清单

### Mediasoup服务器文件
- [x] `mediasoup-server/src/server.js` - 主服务器文件
- [x] `mediasoup-server/src/mediasoup-service.js` - WebRTC服务
- [x] `mediasoup-server/src/config.js` - 配置文件
- [x] `mediasoup-server/.env` - 环境变量
- [x] `mediasoup-server/package.json` - 依赖配置
- [x] `mediasoup-server/README.md` - 服务器文档

### 前端集成文件
- [x] `ui/src/app/services/mediasoup.ts` - MediasoupService
- [x] `ui/src/app/components/VideoCallDialog.tsx` - 通话界面（已更新）
- [x] `ui/src/app/App.tsx` - 主应用（已更新）
- [x] `ui/src/styles/video-call.css` - 视频样式
- [x] `ui/src/styles/index.css` - 样式导入（已更新）
- [x] `ui/package.json` - 依赖配置（已更新）

### 文档文件
- [x] `MEDIASOUP_INTEGRATION_GUIDE.md` - 完整集成指南
- [x] `MEDIASOUP_QUICK_START.md` - 快速启动指南
- [x] `MEDIASOUP_INTEGRATION_SUMMARY.md` - 集成总结
- [x] `start-mediasoup.bat` - Windows启动脚本

## 🔧 依赖安装清单

### 服务器端依赖
```bash
cd TeleMsg-SpringBoot/mediasoup-server
npm install
```

需要安装的包：
- [x] mediasoup@^3.13.0
- [x] express@^4.18.2
- [x] socket.io@^4.6.1
- [x] cors@^2.8.5
- [x] dotenv@^16.0.3

### 前端依赖
```bash
cd ui
npm install
```

新增的包：
- [x] socket.io-client@^4.6.1
- [x] mediasoup-client@^3.7.0
- [x] @types/node (devDependencies)

## ✅ 功能验证清单

### 基础功能
- [ ] Mediasoup服务器能正常启动
- [ ] 前端应用能正常运行
- [ ] 浏览器能访问摄像头和麦克风
- [ ] Socket.IO连接正常建立

### 视频通话功能
- [ ] 能发起视频通话
- [ ] 能看到本地视频预览
- [ ] 能看到远程视频
- [ ] 视频画面流畅
- [ ] 本地视频镜像显示正常

### 语音通话功能
- [ ] 能发起语音通话
- [ ] 能听到对方声音
- [ ] 音质清晰
- [ ] 无明显延迟

### 控制功能
- [ ] 静音按钮工作正常
- [ ] 摄像头开关工作正常
- [ ] 挂断按钮工作正常
- [ ] 通话计时器正常显示
- [ ] 连接状态显示正确

## 🧪 测试步骤

### 1. 启动测试

```powershell
# 终端1：启动Mediasoup服务器
cd D:\Java_workplace\TeleMsg\TeleMsg-SpringBoot
.\start-mediasoup.bat

# 终端2：启动前端
cd D:\Java_workplace\TeleMsg\ui
npm run dev
```

预期结果：
- Mediasoup服务器输出：`🚀 Mediasoup server running on port 3000`
- 前端输出：`Local: http://localhost:5173/`

### 2. 连接测试

1. 打开浏览器访问 `http://localhost:5173`
2. 打开浏览器控制台（F12）
3. 检查是否有错误信息

预期结果：
- 无模块导入错误
- 无网络连接错误

### 3. 权限测试

1. 选择一个联系人
2. 点击视频通话按钮
3. 允许浏览器访问摄像头和麦克风

预期结果：
- 浏览器正常弹出权限请求
- 授权后能看到本地视频

### 4. 通话测试

**单机测试（推荐）：**
1. 打开两个浏览器窗口（或使用隐私模式）
2. 分别登录用户A和用户B
3. 用户A对用户B发起通话
4. 观察双方的音视频

预期结果：
- 双方都能看到对方的视频
- 双方都能听到对方的声音
- 通话计时器正常工作

### 5. 控制功能测试

在通话中测试：
1. 点击静音按钮
2. 点击摄像头开关
3. 点击挂断按钮

预期结果：
- 静音后对方听不到声音
- 关闭摄像头后对方看不到视频
- 挂断后通话正常结束

## 🐛 故障排查清单

### 服务器无法启动

检查项：
- [ ] Node.js版本 >= 16
- [ ] 端口3000是否被占用
- [ ] npm依赖是否安装完整

解决命令：
```powershell
node --version
netstat -ano | findstr :3001
npm install
```

### 前端连接失败

检查项：
- [ ] Mediasoup服务器是否运行
- [ ] 浏览器控制台错误信息
- [ ] 网络连接是否正常

解决方法：
1. 检查Mediasoup服务器日志
2. 刷新浏览器页面
3. 清除浏览器缓存

### 无法访问摄像头

检查项：
- [ ] 浏览器类型（推荐Chrome/Edge）
- [ ] 摄像头权限设置
- [ ] 摄像头是否被其他应用占用

解决方法：
1. 在浏览器设置中检查权限
2. 关闭其他使用摄像头的应用
3. 重启浏览器

### 看不到远程视频

检查项：
- [ ] 双方是否都成功加入房间
- [ ] 网络连接是否稳定
- [ ] 浏览器控制台WebRTC错误

解决方法：
1. 检查Mediasoup服务器日志
2. 查看浏览器控制台的WebRTC错误
3. 重新发起通话

## 📊 性能验证

### 延迟测试
- [ ] 局域网延迟 < 100ms
- [ ] 音视频同步正常
- [ ] 无明显卡顿

### 质量测试
- [ ] 视频分辨率达到720p
- [ ] 帧率稳定在30fps
- [ ] 音质清晰无杂音

### 稳定性测试
- [ ] 连续通话5分钟无断线
- [ ] 多次开关摄像头正常
- [ ] 多次静音/取消静音正常

## 📝 验证报告模板

```
验证时间：____________________
验证人员：____________________

【基础功能】
- Mediasoup服务器启动：[ ] 通过 [ ] 失败
- 前端应用启动：[ ] 通过 [ ] 失败
- Socket.IO连接：[ ] 通过 [ ] 失败

【通话功能】
- 视频通话：[ ] 通过 [ ] 失败
- 语音通话：[ ] 通过 [ ] 失败
- 本地视频：[ ] 通过 [ ] 失败
- 远程视频：[ ] 通过 [ ] 失败

【控制功能】
- 静音控制：[ ] 通过 [ ] 失败
- 摄像头开关：[ ] 通过 [ ] 失败
- 通话计时：[ ] 通过 [ ] 失败
- 挂断功能：[ ] 通过 [ ] 失败

【性能指标】
- 延迟：______ms
- 视频分辨率：______
- 帧率：______fps
- 音质：[ ] 优秀 [ ] 良好 [ ] 一般

【问题记录】
1. ________________________________
2. ________________________________
3. ________________________________

【总体评价】
[ ] 完全满足要求
[ ] 基本满足要求
[ ] 需要改进

【签名】____________
```

## 🎯 下一步行动

完成基础验证后：

### 立即执行
1. [ ] 安装所有依赖
2. [ ] 启动服务进行基础测试
3. [ ] 记录所有问题

### 本周完成
1. [ ] 修复所有发现的问题
2. [ ] 完成完整功能测试
3. [ ] 编写使用文档

### 下周计划
1. [ ] 优化UI交互
2. [ ] 添加通话通知
3. [ ] 实现通话记录

## 📚 参考文档

使用以下文档进行验证：
- `MEDIASOUP_QUICK_START.md` - 快速启动
- `MEDIASOUP_INTEGRATION_GUIDE.md` - 详细指南
- `mediasoup-server/README.md` - 服务器文档

---

**验证完成后请保存此清单作为集成记录**

