# 来电通知功能测试指南

## 快速测试步骤

### 1. 准备环境

```bash
# 终端 1: 启动后端服务
cd D:\Java_workplace\TeleMsg\TeleMsg-SpringBoot
.\gradlew bootRun

# 终端 2: 启动前端
cd D:\Java_workplace\TeleMsg\ui
npm run dev
```

### 2. 测试场景

#### 场景 1: 视频来电测试

1. 打开两个浏览器窗口 (或使用隐身模式)
2. 窗口A: 登录为 `user001` / `password123`
3. 窗口B: 登录为 `user002` / `password123`
4. 窗口A: 选择联系人 `user002`
5. 窗口A: 点击视频通话图标 📹
6. **预期结果**:
   - ✅ 窗口A: 打开视频通话界面
   - ✅ 窗口B: 立即弹出来电通知
   - ✅ 窗口B: 显示 "视频来电" 和 user001 的头像
   - ✅ 窗口B: 看到接听/拒绝按钮

#### 场景 2: 语音来电测试

1. 窗口A: 点击语音通话图标 📞
2. **预期结果**:
   - ✅ 窗口B: 弹出来电通知显示 "语音来电"

#### 场景 3: 接听测试

1. 窗口B: 收到来电后，点击 "接听" 按钮
2. **预期结果**:
   - ✅ 窗口B: 来电通知消失
   - ✅ 窗口B: 打开通话界面
   - ✅ 窗口B: 自动选中来电者为当前联系人

#### 场景 4: 拒绝测试

1. 窗口B: 收到来电后，点击 "拒绝" 按钮
2. **预期结果**:
   - ✅ 窗口B: 来电通知消失

## 调试技巧

### 查看 WebSocket 消息

打开浏览器开发者工具 (F12)，在 Console 中查看日志:

```javascript
// 成功建立连接
✅ WebSocket connected successfully

// 发起通话 (用户A)
📡 Setting up WebSocket connection for user: user001

// 收到来电 (用户B)
📩 WebSocket message received in handler: {type: "call_incoming", call: {...}}
📞 Processing incoming call: {callId: "...", callerId: "user001", isVoiceOnly: false}
📞 Incoming call received: {callId: "...", callerId: "user001", isVoiceOnly: false}
```

### 检查后端日志

查看 Spring Boot 控制台输出:

```
INFO  - WebSocket连接建立: userId=user002, sessionId=...
INFO  - 通话通知已发送: recipientId=user002, callId=..., callerId=user001
```

### 常见问题排查

#### 问题 1: 收不到来电通知

**可能原因**:
- WebSocket 未连接
- 用户ID不正确
- 网络问题

**排查步骤**:
1. 检查控制台是否有 "WebSocket connected successfully"
2. 检查后端日志是否有 "通话通知已发送"
3. 刷新页面重新登录

#### 问题 2: 铃声不播放

**可能原因**:
- 缺少 `public/ringtone.mp3` 文件
- 浏览器自动播放策略限制

**解决方法**:
1. 确保 `ui/public/ringtone.mp3` 存在
2. 用户先与页面交互后再测试来电

#### 问题 3: 来电通知显示"未知用户"

**可能原因**:
- 联系人列表未加载
- callerId 不在联系人列表中

**解决方法**:
1. 确保双方互为联系人
2. 刷新联系人列表

## WebSocket 消息示例

### 服务器发送的来电通知

```json
{
  "type": "call_incoming",
  "call": {
    "callId": "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6",
    "callerId": "user001",
    "isVoiceOnly": false,
    "timestamp": 1705234567890
  }
}
```

## 性能监控

### 关键指标

- **来电延迟**: < 500ms (从发起到收到通知)
- **WebSocket 连接稳定性**: 保持连接
- **内存占用**: 正常范围

### 监控命令

```javascript
// 在浏览器控制台中运行
console.time('call-notification');
// 发起通话后...
// 收到通知时
console.timeEnd('call-notification');
```

## 下一步优化

- [ ] 添加呼叫超时 (30秒)
- [ ] 实现拒绝通知
- [ ] 添加通话状态管理
- [ ] 实现通话记录
- [ ] 添加铃声自定义

---
**最后更新**: 2026-01-14

