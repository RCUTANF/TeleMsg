# TeleMsg API 接口文档

## 概述

TeleMsg 是一个即时通讯应用的后端 API 系统，提供用户管理、消息传输、群组管理、文件上传、视频通话等功能。

**服务器地址**: `http://localhost:8080`  
**API 版本**: v1.0  
**认证方式**: Bearer Token (JWT)

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": { ... }
}
```

### 错误响应
```json
{
  "success": false,
  "message": "错误信息",
  "data": null
}
```

或简化格式：
```json
{
  "error": "错误信息"
}
```

## 认证相关 API

### 用户登录
- **URL**: `POST /auth/login`
- **描述**: 用户登录获取访问令牌
- **请求体**:
```json
{
  "username": "用户名",
  "password": "密码"
}
```
- **响应**:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "用户ID",
    "name": "用户名",
    "username": "用户名",
    "avatar": "头像URL",
    "role": "user"
  }
}
```

### 用户注册
- **URL**: `POST /auth/register`
- **描述**: 新用户注册
- **请求体**:
```json
{
  "name": "姓名",
  "username": "用户名",
  "password": "密码"
}
```
- **响应**:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "用户ID",
    "name": "用户名",
    "username": "用户名",
    "avatar": "头像URL",
    "role": "user"
  }
}
```

### 用户登出
- **URL**: `POST /auth/logout`
- **描述**: 用户登出
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
```json
{
  "message": "登出成功"
}
```

## 用户管理 API

### 获取当前用户信息
- **URL**: `GET /users/me`
- **描述**: 获取当前登录用户信息
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
```json
{
  "id": "用户ID",
  "name": "用户名",
  "username": "用户名",
  "avatar": "头像URL",
  "role": "user"
}
```

### 更新用户资料
- **URL**: `PUT /users/profile`
- **描述**: 更新用户资料
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
```json
{
  "name": "姓名",
  "username": "用户名"
}
```
- **响应**:
```json
{
  "id": "用户ID",
  "name": "用户名",
  "username": "用户名",
  "avatar": "头像URL",
  "role": "user"
}
```


### 获取用户信息
- **URL**: `GET /users/{userId}`
- **描述**: 获取指定用户信息

### 更新用户信息
- **URL**: `PUT /users/{userId}`
- **描述**: 更新用户信息
- **请求体**:
```json
{
  "email": "邮箱",
  "phone": "手机号",
  "avatar": "头像URL",
  "signature": "个性签名"
}
```

### 修改密码
- **URL**: `PUT /users/{userId}/password`
- **描述**: 修改用户密码
- **请求体**:
```json
{
  "oldPassword": "旧密码",
  "newPassword": "新密码"
}
```

### 删除用户
- **URL**: `DELETE /users/{userId}`
- **描述**: 删除用户

## 消息管理 API

### 获取消息历史
- **URL**: `GET /messages/{contactId}`
- **描述**: 获取与指定联系人的聊天记录
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
```json
[
  {
    "id": "消息ID",
    "senderId": "发送者ID",
    "content": "消息内容",
    "timestamp": 1642123456789,
    "type": "text",
    "fileUrl": "文件URL（如果有）",
    "fileName": "文件名（如果有）",
    "fileSize": "文件大小（如果有）",
    "status": "sent"
  }
]
```

### 发送消息
- **URL**: `POST /messages`
- **描述**: 发送消息给指定用户
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
```json
{
  "recipientId": "接收者ID",
  "content": "消息内容",
  "type": "text"
}
```
- **响应**:
```json
{
  "id": "消息ID",
  "senderId": "发送者ID",
  "content": "消息内容",
  "timestamp": 1642123456789,
  "type": "text",
  "status": "sent"
}
```

### 标记消息已读
- **URL**: `PUT /messages/{messageId}/read`
- **描述**: 标记指定消息为已读
- **请求头**: `Authorization: Bearer <token>`


### 发送群聊消息
- **URL**: `POST /messages/group`
- **描述**: 发送群聊消息
- **请求体**:
```json
{
  "senderId": "发送者ID",
  "groupId": "群组ID",
  "messageType": "TEXT|IMAGE|FILE|VOICE|VIDEO",
  "content": "消息内容",
  "mediaUrl": "媒体文件URL"
}
```

### 获取私聊消息记录
- **URL**: `GET /messages/private`
- **描述**: 获取两个用户之间的私聊记录
- **参数**:
  - `user1`: 用户1 ID
  - `user2`: 用户2 ID
  - `page`: 页码（默认0）
  - `size`: 每页大小（默认20）

### 获取群聊消息记录
- **URL**: `GET /messages/group/{groupId}`
- **描述**: 获取群聊消息记录
- **参数**:
  - `page`: 页码（默认0）
  - `size`: 每页大小（默认20）

### 获取最近聊天
- **URL**: `GET /messages/recent/{userId}`
- **描述**: 获取用户最近聊天列表

### 标记私聊消息已读
- **URL**: `PUT /messages/private/read`
- **描述**: 标记私聊消息为已读
- **请求体**:
```json
{
  "senderId": "发送者ID",
  "receiverId": "接收者ID"
}
```

### 搜索消息
- **URL**: `GET /messages/search`
- **描述**: 搜索消息
- **参数**:
  - `userId`: 用户ID
  - `keyword`: 搜索关键词

### 删除消息
- **URL**: `DELETE /messages/{messageId}`
- **描述**: 删除消息
- **参数**:
  - `operatorId`: 操作者ID

### 撤回消息
- **URL**: `PUT /messages/{messageId}/recall`
- **描述**: 撤回消息
- **参数**:
  - `operatorId`: 操作者ID

### 获取未读消息统计
- **URL**: `GET /messages/unread/{userId}`
- **描述**: 获取用户未读消息统计

## 联系人管理 API

### 获取联系人列表
- **URL**: `GET /api/contacts`
- **描述**: 获取当前用户的联系人列表
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
```json
[
  {
    "id": "联系人ID",
    "name": "联系人姓名",
    "avatar": "头像URL",
    "status": "online|offline",
    "lastMessage": "最后一条消息",
    "unreadCount": 0,
    "lastSeen": "最后上线时间"
  }
]
```

### 添加联系人
- **URL**: `POST /api/contacts`
- **描述**: 添加新联系人
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
```json
{
  "userId": "要添加的用户ID"
}
```

### 删除联系人
- **URL**: `DELETE /api/contacts/{contactId}`
- **描述**: 删除联系人
- **请求头**: `Authorization: Bearer <token>`

## 群组管理 API

### 创建群组
- **URL**: `POST /groups`
- **描述**: 创建新群组
- **请求体**:
```json
{
  "groupName": "群组名称",
  "description": "群组描述",
  "ownerId": "群主ID"
}
```

### 获取群组信息
- **URL**: `GET /groups/{groupId}`
- **描述**: 获取群组详细信息

### 加入群组
- **URL**: `POST /groups/{groupId}/members`
- **描述**: 加入群组
- **请求体**:
```json
{
  "userId": "用户ID",
  "nickname": "群昵称"
}
```

### 离开群组
- **URL**: `DELETE /groups/{groupId}/members/{userId}`
- **描述**: 离开群组

### 踢出群成员
- **URL**: `DELETE /groups/{groupId}/members/{targetUserId}/kick`
- **描述**: 踢出群成员
- **参数**:
  - `operatorId`: 操作者ID

### 设置管理员
- **URL**: `PUT /groups/{groupId}/members/{targetUserId}/admin`
- **描述**: 设置/取消群管理员
- **参数**:
  - `ownerId`: 群主ID
  - `isAdmin`: true/false

### 转让群主
- **URL**: `PUT /groups/{groupId}/owner`
- **描述**: 转让群主权限
- **请求体**:
```json
{
  "currentOwnerId": "当前群主ID",
  "newOwnerId": "新群主ID"
}
```

### 获取群成员列表
- **URL**: `GET /groups/{groupId}/members`
- **描述**: 获取群组成员列表

### 获取用户群组列表
- **URL**: `GET /groups/user/{userId}`
- **描述**: 获取用户加入的群组列表

### 解散群组
- **URL**: `DELETE /groups/{groupId}`
- **描述**: 解散群组
- **参数**:
  - `ownerId`: 群主ID

## 文件管理 API

### 文件上传
- **URL**: `POST /files/upload`
- **描述**: 上传文件
- **请求头**: `Authorization: Bearer <token>`
- **请求体**: `multipart/form-data`
  - `file`: 要上传的文件
  - `contactId`: 联系人ID（可选）
- **响应**:
```json
{
  "id": "文件ID",
  "fileUrl": "文件访问URL",
  "fileName": "原始文件名",
  "fileSize": "文件大小（字节）"
}
```

### 文件访问
- **URL**: `GET /files/{filename}`
- **描述**: 访问/下载文件
- **响应**: 文件二进制数据

## 视频通话 API

### 发起通话
- **URL**: `POST /calls/initiate`
- **描述**: 发起视频或语音通话
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
```json
{
  "contactId": "联系人ID",
  "isVoiceOnly": false
}
```
- **响应**:
```json
{
  "callId": "通话ID",
  "signalData": {
    "type": "offer",
    "callerId": "发起者ID",
    "contactId": "联系人ID",
    "isVoiceOnly": false
  }
}
```

### 接听通话
- **URL**: `POST /calls/answer`
- **描述**: 接听通话
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
```json
{
  "callId": "通话ID",
  "signalData": {}
}
```

### 结束通话
- **URL**: `POST /calls/end`
- **描述**: 结束通话
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
```json
{
  "callId": "通话ID"
}
```

## 管理员 API

### 获取所有用户
- **URL**: `GET /admin/users`
- **描述**: 获取系统中所有用户（管理员权限）
- **请求头**: `Authorization: Bearer <token>`

### 删除用户（管理员）
- **URL**: `DELETE /admin/users/{userId}`
- **描述**: 删除指定用户（管理员权限）
- **请求头**: `Authorization: Bearer <token>`

### 更新用户角色
- **URL**: `PUT /admin/users/{userId}/role`
- **描述**: 更新用户角色（管理员权限）
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
```json
{
  "role": "admin|user"
}
```

### 获取系统统计
- **URL**: `GET /admin/stats`
- **描述**: 获取系统统计信息（管理员权限）
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
```json
{
  "totalUsers": 100,
  "onlineUsers": 25,
  "totalMessages": 5000,
  "storageUsed": 0
}
```

## 错误码说明

| HTTP状态码 | 说明 |
|-----------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 数据类型说明

### 消息类型
- `TEXT`: 文本消息
- `IMAGE`: 图片消息
- `FILE`: 文件消息
- `VOICE`: 语音消息
- `VIDEO`: 视频消息

### 用户状态
- `ONLINE`: 在线
- `OFFLINE`: 离线
- `BUSY`: 忙碌
- `AWAY`: 离开

### 群组角色
- `OWNER`: 群主
- `ADMIN`: 管理员
- `MEMBER`: 普通成员

## 注意事项

1. 所有需要认证的API都需要在请求头中包含 `Authorization: Bearer <token>`
2. 时间戳使用毫秒级Unix时间戳
3. 文件大小单位为字节
4. 分页从0开始计算
5. 群组和私聊消息使用不同的端点
6. 管理员相关API需要特殊权限验证

## 开发建议

1. 建议客户端实现Token自动刷新机制
2. 文件上传建议加入进度回调
3. 消息发送建议实现重试机制
4. 视频通话功能需要配合WebRTC使用
5. 建议实现消息本地缓存机制
