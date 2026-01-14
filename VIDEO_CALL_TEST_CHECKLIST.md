# 音视频通话测试清单

## ✅ 测试前准备

- [ ] Mediasoup 服务器已启动 (端口 3001)
- [ ] Spring Boot 后端已启动 (端口 8080)
- [ ] 前端应用已启动 (端口 5173)
- [ ] 两个浏览器窗口/标签页已准备

## 🧪 测试场景

### 场景 1: 视频通话基本流程

#### 步骤
1. [ ] 窗口A: 登录为 user_001
2. [ ] 窗口B: 登录为 user_002
3. [ ] 窗口A: 选择联系人 user_002
4. [ ] 窗口A: 点击视频通话图标 📹
5. [ ] 窗口B: 应立即弹出来电通知
6. [ ] 窗口B: 点击"接听"按钮

#### 预期结果
- [ ] ✅ 窗口A: 能看到自己的本地视频（右上角小窗口）
- [ ] ✅ 窗口A: 能看到 user_002 的视频（主画面）
- [ ] ✅ 窗口B: 能看到自己的本地视频
- [ ] ✅ 窗口B: 能看到 user_001 的视频
- [ ] ✅ 双方都能听到对方的声音

#### 控制台日志验证
**窗口A 控制台应显示:**
```javascript
🎬 Initializing call: roomId=call_U1768272900080722_user_001, userId=user_001, contactId=user_002
✅ Connected to Mediasoup server
✅ Joined room call_U1768272900080722_user_001
✅ Audio producer created
✅ Video producer created
📨 WebSocket parsed message: {type: "new-producer", ...}
✅ Consumer created for producer: xxx (audio)
✅ Consumer created for producer: xxx (video)
```

**窗口B 控制台应显示:**
```javascript
📞 Processing incoming call: {callId: "call_U1768272900080722_user_001", ...}
✅ Answering call: {callId: "...", callerId: "user_001", isVoiceOnly: false}
🎬 Initializing call: roomId=call_U1768272900080722_user_001, userId=user_002, contactId=user_001
✅ Connected to Mediasoup server
✅ Joined room call_U1768272900080722_user_001
✅ Audio producer created
✅ Video producer created
📨 New producer: xxx from user existing-user (audio)
📨 New producer: xxx from user existing-user (video)
✅ Consumer created for producer: xxx (audio)
✅ Consumer created for producer: xxx (video)
```

**Mediasoup 服务器日志应显示:**
```
User user_001 joining room call_U1768272900080722_user_001
Created router for room call_U1768272900080722_user_001
Room call_U1768272900080722_user_001 has 0 existing producers
Created send transport xxx-xxx-xxx for room call_U1768272900080722_user_001
Transport xxx-xxx-xxx connected
Producer aaa-aaa-aaa created (audio) in room call_U1768272900080722_user_001
Producer bbb-bbb-bbb created (video) in room call_U1768272900080722_user_001

User user_002 joining room call_U1768272900080722_user_001
Room call_U1768272900080722_user_001 has 2 existing producers
Notifying new user user_002 about existing producer aaa-aaa-aaa (audio)
Notifying new user user_002 about existing producer bbb-bbb-bbb (video)
Created send transport yyy-yyy-yyy for room call_U1768272900080722_user_001
Created recv transport zzz-zzz-zzz for room call_U1768272900080722_user_001
Transport yyy-yyy-yyy connected
Producer ccc-ccc-ccc created (audio) in room call_U1768272900080722_user_001
Producer ddd-ddd-ddd created (video) in room call_U1768272900080722_user_001
Transport zzz-zzz-zzz connected
Consumer eee-eee-eee created for producer aaa-aaa-aaa
Consumer fff-fff-fff created for producer bbb-bbb-bbb
Consumer eee-eee-eee resumed
Consumer fff-fff-fff resumed
```

---

### 场景 2: 语音通话流程

#### 步骤
1. [ ] 窗口A: 选择联系人 user_002
2. [ ] 窗口A: 点击语音通话图标 🎤
3. [ ] 窗口B: 收到来电通知（显示"语音来电"）
4. [ ] 窗口B: 点击接听

#### 预期结果
- [ ] ✅ 双方都显示语音通话界面（头像+姓名）
- [ ] ✅ 没有视频画面
- [ ] ✅ 能听到对方声音
- [ ] ✅ Mediasoup 只创建 audio producer（没有 video）

---

### 场景 3: 通话控制功能

#### 3.1 静音测试
1. [ ] 通话建立后，窗口A: 点击麦克风按钮
2. [ ] 预期: 麦克风图标变为禁用状态
3. [ ] 预期: 窗口B 听不到 A 的声音
4. [ ] 窗口A: 再次点击麦克风按钮
5. [ ] 预期: 恢复正常

#### 3.2 关闭摄像头测试
1. [ ] 通话建立后，窗口A: 点击摄像头按钮
2. [ ] 预期: 窗口B 看不到 A 的视频
3. [ ] 预期: 显示"摄像头已关闭"提示
4. [ ] 窗口A: 再次点击摄像头按钮
5. [ ] 预期: 视频恢复

#### 3.3 结束通话测试
1. [ ] 窗口A: 点击红色挂断按钮
2. [ ] 预期: 通话界面关闭
3. [ ] 预期: 返回聊天界面
4. [ ] 预期: Mediasoup 清理相关资源

---

### 场景 4: 拒绝来电

#### 步骤
1. [ ] 窗口A: 发起通话
2. [ ] 窗口B: 收到来电通知
3. [ ] 窗口B: 点击"拒绝"按钮

#### 预期结果
- [ ] ✅ 窗口B: 来电通知消失
- [ ] ✅ 窗口A: 通话界面保持打开（待优化：应显示被拒绝提示）

---

### 场景 5: 网络异常测试

#### 5.1 刷新页面
1. [ ] 通话建立后，窗口B: 刷新页面
2. [ ] 预期: Mediasoup 服务器清理 user_002 的资源
3. [ ] 预期: 窗口A 应该收到断连通知（待实现）

#### 5.2 关闭浏览器
1. [ ] 通话建立后，关闭窗口B
2. [ ] 预期: Mediasoup 服务器记录断开连接
3. [ ] 预期: 资源被正确清理

---

## 🐛 常见问题排查

### 问题 1: 看不到对方视频

**检查项:**
- [ ] 浏览器是否授权摄像头和麦克风权限
- [ ] 控制台是否有错误日志
- [ ] Mediasoup 日志是否显示两个用户都加入了同一个房间
- [ ] 检查 roomId 是否一致

**解决方法:**
```javascript
// 在浏览器控制台运行，查看当前 roomId
console.log('Current room ID:', localStorage.getItem('current_call_id'));
```

### 问题 2: 听不到声音

**检查项:**
- [ ] 浏览器音量是否打开
- [ ] 是否误点了静音按钮
- [ ] 检查 audio producer 是否创建成功

### 问题 3: 来电通知不显示

**检查项:**
- [ ] WebSocket 连接是否正常
- [ ] 后端是否发送了 call_incoming 消息
- [ ] 前端 WebSocket handler 是否处理了该消息

**验证方法:**
```javascript
// 在窗口B的控制台查看
// 应该能看到: 📞 Processing incoming call: {...}
```

### 问题 4: Mediasoup 连接失败

**检查项:**
- [ ] Mediasoup 服务器是否启动
- [ ] 端口 3001 是否被占用
- [ ] 防火墙是否阻止连接

**验证方法:**
```bash
# 检查 Mediasoup 服务器状态
curl http://localhost:3001/health
# 应返回: {"status":"ok","service":"mediasoup-server"}
```

---

## 📊 性能指标

### 正常范围
- **连接建立时间**: < 2秒
- **视频延迟**: < 500ms
- **音频延迟**: < 300ms
- **丢包率**: < 5%

### 监控方法
打开 Chrome DevTools → Media → 选择对应的 video/audio element 查看详细统计

---

## ✅ 测试完成标准

所有以下项目都通过才算测试完成:

- [ ] 能成功发起视频通话
- [ ] 能成功发起语音通话
- [ ] 被叫方能收到来电通知
- [ ] 接听后双方都能看到视频
- [ ] 接听后双方都能听到音频
- [ ] 静音功能正常
- [ ] 关闭摄像头功能正常
- [ ] 挂断功能正常
- [ ] 拒绝来电功能正常
- [ ] Mediasoup 日志正常，无错误
- [ ] 资源正确清理，无内存泄漏

---

**测试日期**: __________  
**测试人员**: __________  
**测试结果**: [ ] 通过 / [ ] 未通过  
**备注**: ____________________

