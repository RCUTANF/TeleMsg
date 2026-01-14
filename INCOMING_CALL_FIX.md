# 来电通知功能修复文档

## 问题描述

发起音视频通话时，没有在对方客户端实际拉起对话请求。发起者可以成功发起通话，但被叫方无法收到任何来电通知。

## 根本原因

1. **后端缺少推送机制**: `CallController.java` 的 `/calls/initiate` 接口只返回响应给发起者，但没有通过 WebSocket 推送通知给被叫方
2. **前端缺少处理逻辑**: UI 的 WebSocket 处理器只处理 `message` 和 `contact_status` 类型，没有处理 `call_incoming` 类型的通知
3. **缺少来电界面**: 没有用户界面来显示来电通知和接听/拒绝按钮

## 解决方案

### 1. 后端修改 (Spring Boot)

#### 文件: `CallController.java`

**修改内容:**

1. **添加依赖注入**:
```java
private final TeleMsgWebSocketHandler webSocketHandler;
private final ObjectMapper objectMapper;
```

2. **更新 initiateCall 方法**:
```java
@PostMapping("/initiate")
public ResponseEntity<?> initiateCall(@RequestHeader("Authorization") String authHeader,
                                    @RequestBody @Validated InitiateCallRequest request) {
    try {
        String callerId = extractUserIdFromToken(authHeader);
        String callId = UUID.randomUUID().toString();

        // 构建信令数据
        Map<String, Object> signalData = new HashMap<>();
        signalData.put("type", "offer");
        signalData.put("callerId", callerId);
        signalData.put("contactId", request.getContactId());
        signalData.put("isVoiceOnly", request.getIsVoiceOnly());

        // 🔥 关键: 通过WebSocket向被叫方发送通话请求
        sendCallNotification(request.getContactId(), callId, callerId, request.getIsVoiceOnly());

        Map<String, Object> response = new HashMap<>();
        response.put("callId", callId);
        response.put("signalData", signalData);

        return ResponseEntity.ok(response);
    } catch (Exception e) {
        log.error("发起通话失败", e);
        return ResponseEntity.badRequest().body(Map.of("error", "发起通话失败"));
    }
}
```

3. **新增 sendCallNotification 方法**:
```java
/**
 * 通过WebSocket发送通话通知
 */
private void sendCallNotification(String recipientId, String callId, String callerId, Boolean isVoiceOnly) {
    try {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "call_incoming");
        
        Map<String, Object> callData = new HashMap<>();
        callData.put("callId", callId);
        callData.put("callerId", callerId);
        callData.put("isVoiceOnly", isVoiceOnly != null ? isVoiceOnly : false);
        callData.put("timestamp", System.currentTimeMillis());
        
        notification.put("call", callData);

        String jsonMessage = objectMapper.writeValueAsString(notification);
        webSocketHandler.sendMessageToUser(recipientId, jsonMessage);

        log.info("通话通知已发送: recipientId={}, callId={}, callerId={}", recipientId, callId, callerId);
    } catch (Exception e) {
        log.error("发送通话通知失败: recipientId={}, error={}", recipientId, e.getMessage(), e);
    }
}
```

### 2. 前端修改 (React/TypeScript)

#### 文件: `App.tsx`

**修改内容:**

1. **添加来电状态**:
```typescript
const [incomingCall, setIncomingCall] = useState<{
  callId: string;
  callerId: string;
  isVoiceOnly: boolean;
} | null>(null);
```

2. **更新 WebSocket 消息处理**:
```typescript
const connectWebSocket = useCallback((userId: string) => {
  const handler = (data: any) => {
    switch (data.type) {
      case 'message':
        // 处理消息
        break;
      case 'contact_status':
        // 处理状态更新
        break;
      case 'call_incoming':  // 🔥 新增: 处理来电
        console.log('📞 Processing incoming call:', data);
        handleIncomingCall(data.call);
        break;
      default:
        console.log('❓ Unknown message type:', data.type, data);
    }
  };
  apiService.connectWebSocket(userId, handler);
}, []);
```

3. **添加来电处理函数**:
```typescript
// 处理来电通知
const handleIncomingCall = useCallback((callData: {
  callId: string;
  callerId: string;
  isVoiceOnly: boolean;
}) => {
  console.log('📞 Incoming call received:', callData);
  setIncomingCall(callData);
}, []);

// 接听来电
const handleAnswerCall = useCallback(() => {
  if (!incomingCall) return;
  setIsVoiceCall(incomingCall.isVoiceOnly);
  setSelectedContactId(incomingCall.callerId);
  setVideoCallOpen(true);
  setIncomingCall(null);
}, [incomingCall]);

// 拒绝来电
const handleRejectCall = useCallback(() => {
  if (!incomingCall) return;
  setIncomingCall(null);
}, [incomingCall]);
```

4. **添加来电对话框**:
```typescript
{/* 来电通知 */}
{incomingCall && (
  <IncomingCallDialog
    open={!!incomingCall}
    onAnswer={handleAnswerCall}
    onReject={handleRejectCall}
    callerName={contacts.find(c => c.id === incomingCall.callerId)?.name || '未知用户'}
    callerAvatar={contacts.find(c => c.id === incomingCall.callerId)?.avatar || ''}
    isVoiceOnly={incomingCall.isVoiceOnly}
  />
)}
```

#### 新文件: `IncomingCallDialog.tsx`

创建了一个新的组件来显示来电界面:

**主要特性:**
- ✅ 显示来电者头像和姓名
- ✅ 区分语音/视频通话
- ✅ 来电动画效果 (脉冲动画)
- ✅ 铃声播放 (需要 `/ringtone.mp3` 文件)
- ✅ 接听和拒绝按钮
- ✅ 优雅的渐变背景设计

```typescript
export function IncomingCallDialog({ 
  open, 
  onAnswer,
  onReject,
  callerName, 
  callerAvatar,
  isVoiceOnly 
}: IncomingCallDialogProps) {
  // 播放铃声
  useEffect(() => {
    if (open) {
      const audio = new Audio('/ringtone.mp3');
      audio.loop = true;
      audio.play().catch(err => console.log('Cannot play ringtone:', err));
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [open]);

  return (
    // 美观的来电界面
  );
}
```

## WebSocket 消息格式

### 来电通知消息

**从服务器发送到被叫方:**
```json
{
  "type": "call_incoming",
  "call": {
    "callId": "uuid-string",
    "callerId": "user_001",
    "isVoiceOnly": false,
    "timestamp": 1705234567890
  }
}
```

## 完整调用流程

```
1. 用户A点击"视频通话"按钮
   ↓
2. 前端调用 apiService.initiateVideoCall(contactId, false)
   ↓
3. 后端 CallController.initiateCall() 接收请求
   ↓
4. 生成 callId
   ↓
5. 🔥 调用 sendCallNotification() 通过WebSocket推送给用户B
   ↓
6. 用户B的WebSocket接收到 call_incoming 消息
   ↓
7. 前端 connectWebSocket handler 识别类型并调用 handleIncomingCall()
   ↓
8. 设置 incomingCall 状态
   ↓
9. 渲染 IncomingCallDialog 组件
   ↓
10. 用户B看到来电界面，可以选择接听或拒绝
```

## 测试步骤

### 前置条件
1. 启动 Spring Boot 服务器
2. 启动前端应用
3. 使用两个不同的浏览器或浏览器窗口登录两个不同的用户账号

### 测试流程
1. **用户A** 选择联系人 **用户B**
2. **用户A** 点击视频通话或语音通话图标
3. **验证**: 用户A 应该看到通话界面打开
4. **验证**: 用户B 应该立即看到来电通知弹窗，显示用户A的头像和名称
5. **用户B** 点击"接听"按钮
6. **验证**: 用户B 的来电通知消失，通话界面打开
7. **验证**: 双方都能看到通话界面

### 预期结果
- ✅ 来电通知立即显示
- ✅ 显示正确的来电者信息
- ✅ 铃声播放 (如果浏览器允许)
- ✅ 接听后正确跳转到通话界面
- ✅ 拒绝后通知消失

## 注意事项

### 1. 铃声文件
需要在 `public/ringtone.mp3` 路径下放置铃声文件，否则铃声功能不会生效。

### 2. WebSocket 连接
确保用户已经成功建立 WebSocket 连接，否则无法接收来电通知。可以在浏览器控制台查看连接状态:
```
✅ WebSocket connected successfully
```

### 3. 浏览器自动播放策略
现代浏览器限制自动播放音频，铃声可能不会自动播放。需要用户之前与页面有过交互。

### 4. 后续优化建议

**高优先级:**
- [ ] 实现呼叫超时机制 (30秒无响应自动挂断)
- [ ] 实现拒绝通话的通知 (通知发起者被拒绝)
- [ ] 实现通话中状态管理 (避免重复来电)
- [ ] 添加振动提示 (移动端)

**中优先级:**
- [ ] 维护 callId 到 callerId 的映射表
- [ ] 实现通话记录功能
- [ ] 添加忙线状态检测
- [ ] 支持多人通话邀请

**低优先级:**
- [ ] 来电铃声自定义
- [ ] 来电全屏模式 (移动端)
- [ ] 通话质量监控

## 相关文件清单

### 修改的文件
1. `TeleMsg-SpringBoot/src/main/java/com/telemsg/server/controller/CallController.java`
2. `ui/src/app/App.tsx`

### 新增的文件
1. `ui/src/app/components/IncomingCallDialog.tsx`

## 总结

此次修复实现了完整的来电通知功能:
- ✅ 后端通过 WebSocket 推送来电通知
- ✅ 前端接收并处理来电通知
- ✅ 显示美观的来电界面
- ✅ 支持接听和拒绝操作
- ✅ 区分视频和语音通话

现在用户可以正常收到来电通知并进行响应了！

---
**修复日期**: 2026-01-14  
**修复者**: GitHub Copilot  
**版本**: 1.0

