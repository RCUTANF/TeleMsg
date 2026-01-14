# TeleMsg API 接口文档 v2.0

## 📋 文档说明

本文档详细记录了 TeleMsg SpringBoot 服务端的完整 REST API 接口。

**最后更新**: 2025年1月14日  
**文档版本**: 2.0  
**服务器地址**: `http://localhost:8080`  
**认证方式**: Bearer Token (JWT)  
**维护者**: TeleMsg 开发团队

---

## 目录

1. [通用说明](#通用说明)
2. [认证相关 API](#认证相关-api)
3. [用户管理 API](#用户管理-api)
4. [群组管理 API](#群组管理-api)
5. [讨论空间 API](#讨论空间-api)
6. [消息管理 API](#消息管理-api)
7. [文件管理 API](#文件管理-api)
8. [联系人管理 API](#联系人管理-api)
9. [视频通话 API](#视频通话-api)
10. [管理员 API](#管理员-api)

---

## 通用说明

### 响应格式

#### 成功响应（ApiResponse 格式）
```json
{
  "success": true,
  "message": "操作成功",
  "data": { }
}
```

#### 简化成功响应（Map 格式）
```json
{
  "token": "jwt_token_here",
  "user": { }
}
```

#### 错误响应
```json
{
  "success": false,
  "message": "错误信息",
  "data": null
}
```

### 认证方式

所有需要认证的接口都需要在请求头中包含 JWT token：

```
Authorization: Bearer <jwt_token>
```

---

## 认证相关 API

### 用户登录
- **URL**: `POST /auth/login`
- **认证**: 否
- **描述**: 用户登录并获取 JWT 访问令牌

**请求体**:
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**成功响应 (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_001",
    "name": "张三",
    "username": "testuser",
    "avatar": "http://...",
    "role": "employee",
    "isAdmin": false
  }
}
```

**错误响应 (400)**:
```json
{
  "error": "用户名或密码错误"
}
```

### 用户注册
- **URL**: `POST /auth/register`
- **认证**: 否
- **描述**: 新用户注册

**请求体**:
```json
{
  "name": "李四",
  "username": "newuser",
  "password": "password123"
}
```

**成功响应 (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_002",
    "name": "李四",
    "username": "newuser",
    "avatar": "",
    "role": "employee",
    "isAdmin": false
  }
}
```

### 用户登出
- **URL**: `POST /auth/logout`
- **认证**: 是
- **描述**: 用户登出

**请求头**:
```
Authorization: Bearer <token>
```

**成功响应 (200)**:
```json
{
  "message": "登出成功"
}
```

---

## 用户管理 API

### 获取当前用户信息
- **URL**: `GET /users/me`
- **认证**: 是
- **描述**: 获取当前登录用户的详细信息

**请求头**:
```
Authorization: Bearer <token>
```

**成功响应 (200)**:
```json
{
  "id": "user_001",
  "name": "张三",
  "username": "testuser",
  "avatar": "http://...",
  "email": "test@example.com",
  "phone": "13800138000",
  "role": "employee",
  "status": "online"
}
```

### 更新用户资料
- **URL**: `PUT /users/profile`
- **认证**: 是
- **描述**: 更新当前用户的个人资料

**请求头**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "name": "张三（已更新）",
  "username": "testuser_new"
}
```

**成功响应 (200)**:
```json
{
  "id": "user_001",
  "name": "张三（已更新）",
  "username": "testuser_new"
}
```

### 获取用户信息
- **URL**: `GET /users/{userId}`
- **认证**: 否
- **描述**: 通过用户 ID 获取用户信息

**路径参数**:
- `userId`: 用户ID

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": "user_001",
    "name": "张三",
    "username": "testuser",
    "avatar": "http://...",
    "email": "test@example.com"
  }
}
```

### 更新用户信息
- **URL**: `PUT /users/{userId}`
- **认证**: 否
- **描述**: 更新指定用户的信息

**路径参数**:
- `userId`: 用户ID

**请求体**:
```json
{
  "email": "newemail@example.com",
  "phone": "13900139000",
  "avatar": "http://...",
  "signature": "我是签名",
  "isAdmin": false,
  "role": "employee"
}
```

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": "user_001",
    "email": "newemail@example.com",
    "phone": "13900139000"
  }
}
```

### 更新用户角色和权限
- **URL**: `PUT /users/{userId}/role`
- **认证**: 否
- **描述**: 更新用户的角色和权限

**路径参数**:
- `userId`: 用户ID

**请求体**:
```json
{
  "role": "manager",
  "isAdmin": false
}
```

**支持的角色**: `DIRECTOR`、`MANAGER`、`EMPLOYEE`

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "更新成功",
  "data": { }
}
```

---

## 群组管理 API

### 创建群组
- **URL**: `POST /groups`
- **认证**: 否
- **描述**: 创建新的群组

**请求体**:
```json
{
  "groupName": "项目组A",
  "description": "这是项目组A的讨论群",
  "ownerId": "user_001"
}
```

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "群组创建成功",
  "data": {
    "groupId": "group_001",
    "groupName": "项目组A",
    "description": "这是项目组A的讨论群",
    "ownerId": "user_001",
    "type": "NORMAL",
    "maxMembers": 200,
    "createTime": "2025-01-14T10:00:00"
  }
}
```

### 获取群组信息
- **URL**: `GET /groups/{groupId}`
- **认证**: 否
- **描述**: 获取指定群组的详细信息

**路径参数**:
- `groupId`: 群组ID

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "groupId": "group_001",
    "groupName": "项目组A",
    "description": "这是项目组A的讨论群",
    "ownerId": "user_001",
    "memberCount": 5,
    "type": "NORMAL"
  }
}
```

### 加入群组
- **URL**: `POST /groups/{groupId}/members`
- **认证**: 否
- **描述**: 用户加入指定群组

**路径参数**:
- `groupId`: 群组ID

**请求体**:
```json
{
  "userId": "user_002",
  "nickname": "小李"
}
```

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "加入群组成功",
  "data": null
}
```

### 离开群组
- **URL**: `DELETE /groups/{groupId}/members/{userId}`
- **认证**: 否
- **描述**: 用户离开指定群组

**路径参数**:
- `groupId`: 群组ID
- `userId`: 用户ID

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "离开群组成功",
  "data": null
}
```

### 踢出群成员
- **URL**: `DELETE /groups/{groupId}/members/{targetUserId}/kick`
- **认证**: 否
- **描述**: 群主或管理员踢出群成员

**路径参数**:
- `groupId`: 群组ID
- `targetUserId`: 被踢出用户ID

**查询参数**:
- `operatorId`: 操作者（群主或管理员）ID

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "踢出成员成功",
  "data": null
}
```

### 设置管理员
- **URL**: `PUT /groups/{groupId}/members/{targetUserId}/admin`
- **认证**: 否
- **描述**: 群主设置或取消群成员的管理员身份

**路径参数**:
- `groupId`: 群组ID
- `targetUserId`: 目标用户ID

**查询参数**:
- `ownerId`: 群主ID
- `isAdmin`: true 表示设置为管理员，false 表示取消管理员

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "设置管理员成功",
  "data": null
}
```

### 转让群主
- **URL**: `PUT /groups/{groupId}/owner`
- **认证**: 否
- **描述**: 将群主身份转让给其他成员

**路径参数**:
- `groupId`: 群组ID

**请求体**:
```json
{
  "currentOwnerId": "user_001",
  "newOwnerId": "user_002"
}
```

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "群主转让成功",
  "data": null
}
```

### 获取群成员列表
- **URL**: `GET /groups/{groupId}/members`
- **认证**: 否
- **描述**: 获取指定群组的全部成员

**路径参数**:
- `groupId`: 群组ID

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": [
    {
      "groupId": "group_001",
      "userId": "user_001",
      "role": "OWNER",
      "nickname": "张三",
      "muted": false,
      "joinTime": "2025-01-10T10:00:00"
    },
    {
      "groupId": "group_001",
      "userId": "user_002",
      "role": "MEMBER",
      "nickname": "小李",
      "muted": false,
      "joinTime": "2025-01-11T10:00:00"
    }
  ]
}
```

### 获取用户加入的群组
- **URL**: `GET /groups/user/{userId}`
- **认证**: 否
- **描述**: 获取指定用户加入的所有群组

**路径参数**:
- `userId`: 用户ID

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": [
    {
      "groupId": "group_001",
      "groupName": "项目组A",
      "avatar": "http://...",
      "role": "OWNER",
      "joinTime": "2025-01-10T10:00:00"
    }
  ]
}
```

### 解散群组
- **URL**: `DELETE /groups/{groupId}`
- **认证**: 否
- **描述**: 群主解散群组

**路径参数**:
- `groupId`: 群组ID

**查询参数**:
- `ownerId`: 群主ID

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "群组解散成功",
  "data": null
}
```

---

## 讨论空间 API

讨论空间是特殊的群组，拥有父群组ID，用于在群组内部创建子讨论区。

### 创建讨论空间
- **URL**: `POST /discussion-spaces`
- **认证**: 否
- **描述**: 在指定群组内创建讨论空间

**请求体**:
```json
{
  "name": "技术讨论区",
  "groupId": "group_001",
  "creatorId": "user_001",
  "members": ["user_001", "user_002", "user_003"],
  "description": "用于讨论技术问题"
}
```

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "讨论空间创建成功",
  "data": {
    "groupId": "space_001",
    "name": "技术讨论区",
    "parentGroupId": "group_001",
    "description": "用于讨论技术问题",
    "memberCount": 3,
    "createTime": "2025-01-14T10:00:00"
  }
}
```

### 获取讨论空间列表
- **URL**: `GET /discussion-spaces`
- **认证**: 否
- **描述**: 获取讨论空间列表

**查询参数**:
- `groupId`: （可选）指定群组ID，返回该群组的所有讨论空间
- `userId`: （可选）指定用户ID，返回该用户有权访问的所有讨论空间

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": [
    {
      "groupId": "space_001",
      "name": "技术讨论区",
      "parentGroupId": "group_001",
      "memberCount": 3
    }
  ]
}
```

### 获取讨论空间详情
- **URL**: `GET /discussion-spaces/{spaceId}`
- **认证**: 否
- **描述**: 获取指定讨论空间的详细信息

**路径参数**:
- `spaceId`: 讨论空间ID

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "groupId": "space_001",
    "name": "技术讨论区",
    "parentGroupId": "group_001",
    "description": "用于讨论技术问题",
    "memberCount": 3,
    "createTime": "2025-01-14T10:00:00"
  }
}
```

### 添加讨论空间成员
- **URL**: `POST /discussion-spaces/{spaceId}/members`
- **认证**: 否
- **描述**: 向讨论空间添加成员

**路径参数**:
- `spaceId`: 讨论空间ID

**请求体**:
```json
{
  "operatorId": "user_001",
  "memberIds": ["user_004", "user_005"]
}
```

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "添加成员成功",
  "data": { }
}
```

### 从讨论空间移除成员
- **URL**: `DELETE /discussion-spaces/{spaceId}/members/{memberId}`
- **认证**: 否
- **描述**: 从讨论空间移除指定成员

**路径参数**:
- `spaceId`: 讨论空间ID
- `memberId`: 成员ID

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "移除成员成功",
  "data": null
}
```

---

## 消息管理 API

### 发送私聊消息
- **URL**: `POST /messages`
- **认证**: 是
- **描述**: 发送私聊消息

**请求头**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "recipientId": "user_002",
  "content": "你好，今天怎么样？",
  "type": "text"
}
```

**成功响应 (200)**:
```json
{
  "id": "msg_001",
  "senderId": "user_001",
  "receiverId": "user_002",
  "content": "你好，今天怎么样？",
  "timestamp": 1705243200000,
  "type": "text",
  "status": "sent"
}
```

### 发送群聊消息
- **URL**: `POST /messages/group`
- **认证**: 否
- **描述**: 发送群组消息

**请求体**:
```json
{
  "senderId": "user_001",
  "groupId": "group_001",
  "messageType": "text",
  "content": "@all 大家看一下这个消息",
  "mediaUrl": null
}
```

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "群聊消息发送成功",
  "data": {
    "messageId": "msg_002",
    "senderId": "user_001",
    "groupId": "group_001",
    "messageType": "text",
    "content": "@all 大家看一下这个消息",
    "status": "sent",
    "createTime": "2025-01-14T10:00:00"
  }
}
```

### 获取私聊消息记录
- **URL**: `GET /messages/private`
- **认证**: 否
- **描述**: 分页获取两个用户之间的私聊消息记录

**查询参数**:
- `user1`: 用户1 ID
- `user2`: 用户2 ID
- `page`: （可选，默认0）页码
- `size`: （可选，默认20）每页数量

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "content": [
      {
        "messageId": "msg_001",
        "senderId": "user_001",
        "receiverId": "user_002",
        "messageType": "text",
        "content": "你好",
        "status": "read",
        "createTime": "2025-01-14T10:00:00"
      }
    ],
    "totalElements": 100,
    "totalPages": 5,
    "currentPage": 0,
    "size": 20
  }
}
```

### 获取群聊消息记录
- **URL**: `GET /messages/group/{groupId}`
- **认证**: 否
- **描述**: 分页获取群组的消息记录

**路径参数**:
- `groupId`: 群组ID

**查询参数**:
- `page`: （可选，默认0）页码
- `size`: （可选，默认20）每页数量

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "content": [
      {
        "messageId": "msg_002",
        "senderId": "user_001",
        "groupId": "group_001",
        "messageType": "text",
        "content": "大家好",
        "status": "delivered",
        "createTime": "2025-01-14T10:00:00"
      }
    ],
    "totalElements": 200,
    "totalPages": 10,
    "currentPage": 0,
    "size": 20
  }
}
```

### 获取最近聊天列表
- **URL**: `GET /messages/recent/{userId}`
- **认证**: 否
- **描述**: 获取用户最近的聊天记录

**路径参数**:
- `userId`: 用户ID

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": [
    {
      "messageId": "msg_001",
      "senderId": "user_001",
      "receiverId": "user_002",
      "content": "最后一条消息",
      "createTime": "2025-01-14T10:00:00"
    }
  ]
}
```

### 标记消息为已读
- **URL**: `PUT /messages/{messageId}/read`
- **认证**: 是
- **描述**: 标记指定消息为已读

**路径参数**:
- `messageId`: 消息ID

**成功响应 (200)**:
```json
{
  "message": "消息已标记为已读"
}
```

### 标记私聊消息为已读
- **URL**: `PUT /messages/private/read`
- **认证**: 否
- **描述**: 标记两个用户之间的所有消息为已读

**请求体**:
```json
{
  "senderId": "user_002",
  "receiverId": "user_001"
}
```

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "标记已读成功",
  "data": null
}
```

### 搜索消息
- **URL**: `GET /messages/search`
- **认证**: 否
- **描述**: 搜索用户的消息

**查询参数**:
- `userId`: 用户ID
- `keyword`: 搜索关键词

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "搜索成功",
  "data": [
    {
      "messageId": "msg_001",
      "senderId": "user_001",
      "content": "包含关键词的消息",
      "createTime": "2025-01-14T10:00:00"
    }
  ]
}
```

### 删除消息
- **URL**: `DELETE /messages/{messageId}`
- **认证**: 否
- **描述**: 删除指定消息

**路径参数**:
- `messageId`: 消息ID

**查询参数**:
- `operatorId`: 操作者ID

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "消息删除成功",
  "data": null
}
```

### 撤回消息
- **URL**: `PUT /messages/{messageId}/recall`
- **认证**: 否
- **描述**: 撤回指定消息（只能撤回自己发送的消息）

**路径参数**:
- `messageId`: 消息ID

**查询参数**:
- `operatorId`: 操作者ID

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "消息撤回成功",
  "data": null
}
```

### 获取未读消息统计
- **URL**: `GET /messages/unread/{userId}`
- **认证**: 否
- **描述**: 获取指定用户的未读消息总数

**路径参数**:
- `userId`: 用户ID

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "unreadCount": 5
  }
}
```

### 获取来自特定发送者的未读消息数
- **URL**: `GET /messages/unread/{receiverId}/from/{senderId}`
- **认证**: 否
- **描述**: 获取指定接收者来自特定发送者的未读消息数

**路径参数**:
- `receiverId`: 接收者ID
- `senderId`: 发送者ID

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "unreadCount": 3
  }
}
```

### 发送带文件的私聊消息
- **URL**: `POST /messages/send-file`
- **认证**: 是
- **描述**: 发送带附件的私聊消息

**请求头**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**查询参数**:
- `recipientId`: 接收者ID
- `file`: 文件（MultipartFile）
- `content`: （可选）消息内容

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "文件消息发送成功",
  "data": {
    "id": "msg_003",
    "senderId": "user_001",
    "receiverId": "user_002",
    "type": "image",
    "fileUrl": "http://...",
    "fileName": "image.jpg",
    "fileSize": "102400"
  }
}
```

### 发送带文件的群聊消息
- **URL**: `POST /messages/send-group-file`
- **认证**: 是
- **描述**: 发送带附件的群聊消息

**请求头**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**查询参数**:
- `groupId`: 群组ID
- `file`: 文件（MultipartFile）
- `content`: （可选）消息内容

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "群聊文件消息发送成功",
  "data": {
    "messageId": "msg_004",
    "senderId": "user_001",
    "groupId": "group_001",
    "type": "file",
    "fileUrl": "http://...",
    "fileName": "document.pdf"
  }
}
```

---

## 文件管理 API

### 文件上传
- **URL**: `POST /files/upload`
- **认证**: 是
- **描述**: 上传文件到 MinIO 对象存储

**请求头**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求参数**:
- `file`: 要上传的文件（MultipartFile）

**支持的文件类型**:
- 图片: JPG, PNG, GIF, BMP, WebP
- 文档: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV
- 最大文件大小: 50MB

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "文件上传成功",
  "data": {
    "fileId": "file_001",
    "originalFileName": "image.jpg",
    "contentType": "image/jpeg",
    "fileSize": 102400,
    "uploadTime": "2025-01-14T10:00:00",
    "uploadedBy": "user_001"
  }
}
```

### 获取文件下载链接
- **URL**: `GET /files/{fileId}/url`
- **认证**: 是
- **描述**: 获取文件的下载链接

**路径参数**:
- `fileId`: 文件ID

**成功响应 (200)**:
```json
{
  "success": true,
  "data": {
    "downloadUrl": "http://minio:9000/telemsg/2025/01/file_001.jpg"
  }
}
```

### 下载文件
- **URL**: `GET /files/{fileId}`
- **认证**: 否
- **描述**: 直接下载文件（作为附件）

**路径参数**:
- `fileId`: 文件ID

**响应**: 返回文件内容和相应的 Content-Type 头

### 查看文件（内联显示）
- **URL**: `GET /files/{fileId}/view`
- **认证**: 否
- **描述**: 查看文件（主要用于图片预览）

**路径参数**:
- `fileId`: 文件ID

**响应**: 返回文件内容，设置 Content-Disposition 为 inline，用于浏览器内显示

### 获取文件信息
- **URL**: `GET /files/{fileId}/info`
- **认证**: 是
- **描述**: 获取文件的元数据信息

**路径参数**:
- `fileId`: 文件ID

**成功响应 (200)**:
```json
{
  "success": true,
  "data": {
    "fileId": "file_001",
    "originalFilename": "image.jpg",
    "contentType": "image/jpeg",
    "fileSize": 102400,
    "uploadTime": "2025-01-14T10:00:00",
    "uploadedBy": "user_001"
  }
}
```

### 删除文件
- **URL**: `DELETE /files/{fileId}`
- **认证**: 是
- **描述**: 删除指定文件

**路径参数**:
- `fileId`: 文件ID

**成功响应 (200)**:
```json
{
  "success": true,
  "message": "文件删除成功",
  "data": null
}
```

---

## 联系人管理 API

### 获取联系人列表
- **URL**: `GET /contacts`
- **认证**: 是
- **描述**: 获取当前用户的联系人列表

**请求头**:
```
Authorization: Bearer <token>
```

**成功响应 (200)**:
```json
[
  {
    "id": "user_002",
    "name": "李四",
    "avatar": "http://...",
    "status": "online",
    "lastMessage": "好的，明白了",
    "unreadCount": 0,
    "lastSeen": "2025-01-14T10:00:00"
  }
]
```

### 添加联系人
- **URL**: `POST /contacts`
- **认证**: 是
- **描述**: 添加新联系人

**请求头**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "userId": "user_003"
}
```

**成功响应 (200)**:
```json
{
  "id": "user_003",
  "name": "王五",
  "avatar": "http://...",
  "status": "offline"
}
```

### 删除联系人
- **URL**: `DELETE /contacts/{contactId}`
- **认证**: 是
- **描述**: 删除指定联系人

**路径参数**:
- `contactId`: 联系人ID

**成功响应 (200)**:
```json
{
  "message": "联系人删除成功"
}
```

---

## 视频通话 API

### 发起通话
- **URL**: `POST /calls/initiate`
- **认证**: 是
- **描述**: 发起视频或语音通话

**请求头**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "contactId": "user_002",
  "isVoiceOnly": false
}
```

**成功响应 (200)**:
```json
{
  "callId": "call_001",
  "signalData": {
    "type": "offer",
    "callerId": "user_001",
    "contactId": "user_002",
    "isVoiceOnly": false
  }
}
```

### 接听通话
- **URL**: `POST /calls/answer`
- **认证**: 是
- **描述**: 接听来电

**请求头**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "callId": "call_001",
  "signalData": {
    "type": "answer",
    "sdp": "..."
  }
}
```

**成功响应 (200)**:
```json
{
  "message": "通话已接听",
  "callId": "call_001"
}
```

### 结束通话
- **URL**: `POST /calls/end`
- **认证**: 是
- **描述**: 结束通话

**请求头**:
```
Authorization: Bearer <token>
```

**请求体**:
```json
{
  "callId": "call_001"
}
```

**成功响应 (200)**:
```json
{
  "message": "通话已结束",
  "callId": "call_001"
}
```

---

## 管理员 API

> 需要管理员权限（isAdmin=true）才能访问

### 获取所有用户
- **URL**: `GET /admin/users`
- **认证**: 是（管理员）
- **描述**: 获取系统中所有用户列表

**请求头**:
```
Authorization: Bearer <admin_token>
```

**成功响应 (200)**:
```json
[
  {
    "id": "user_001",
    "name": "张三",
    "username": "testuser",
    "avatar": "http://...",
    "role": "director",
    "isAdmin": true
  }
]
```

### 删除用户
- **URL**: `DELETE /admin/users/{userId}`
- **认证**: 是（管理员）
- **描述**: 删除指定用户

**路径参数**:
- `userId`: 用户ID

**成功响应 (200)**:
```json
{
  "message": "用户删除成功"
}
```

### 更新用户角色
- **URL**: `PUT /admin/users/{userId}/role`
- **认证**: 是（管理员）
- **描述**: 更新用户角色

**路径参数**:
- `userId`: 用户ID

**请求体**:
```json
{
  "role": "manager"
}
```

**成功响应 (200)**:
```json
{
  "id": "user_001",
  "name": "张三",
  "role": "manager",
  "isAdmin": false
}
```

### 获取系统统计信息
- **URL**: `GET /admin/stats`
- **认证**: 是（管理员）
- **描述**: 获取系统整体统计信息

**请求头**:
```
Authorization: Bearer <admin_token>
```

**成功响应 (200)**:
```json
{
  "totalUsers": 50,
  "onlineUsers": 15,
  "totalMessages": 5000,
  "storageUsed": 0
}
```

### 获取部门列表
- **URL**: `GET /admin/departments`
- **认证**: 是（管理员）
- **描述**: 获取所有部门

**请求头**:
```
Authorization: Bearer <admin_token>
```

**成功响应 (200)**:
```json
[
  {
    "id": "dept_001",
    "name": "技术部",
    "manager": "user_001",
    "memberCount": 10,
    "parent": null
  }
]
```

### 创建部门
- **URL**: `POST /admin/departments`
- **认证**: 是（管理员）
- **描述**: 创建新部门

**请求头**:
```
Authorization: Bearer <admin_token>
```

**请求体**:
```json
{
  "name": "市场部",
  "manager": "user_002",
  "parent": null
}
```

**成功响应 (200)**:
```json
{
  "id": "dept_002",
  "name": "市场部",
  "manager": "user_002",
  "memberCount": 0
}
```

### 获取部门成员
- **URL**: `GET /admin/departments/{departmentId}/members`
- **认证**: 是（管理员）
- **描述**: 获取指定部门的所有成员

**路径参数**:
- `departmentId`: 部门ID

**成功响应 (200)**:
```json
[
  {
    "id": "user_001",
    "name": "张三",
    "username": "testuser",
    "role": "manager"
  }
]
```

### 添加部门成员
- **URL**: `POST /admin/departments/{departmentId}/members`
- **认证**: 是（管理员）
- **描述**: 向部门添加成员

**路径参数**:
- `departmentId`: 部门ID

**请求体**:
```json
{
  "userIds": ["user_002", "user_003", "user_004"]
}
```

**成功响应 (200)**:
```json
{
  "message": "成功添加 3 名成员"
}
```

### 移除部门成员
- **URL**: `DELETE /admin/departments/{departmentId}/members/{userId}`
- **认证**: 是（管理员）
- **描述**: 从部门移除成员

**路径参数**:
- `departmentId`: 部门ID
- `userId`: 用户ID

**成功响应 (200)**:
```json
{
  "message": "成功移除成员"
}
```

### 获取角色列表
- **URL**: `GET /admin/roles`
- **认证**: 是（管理员）
- **描述**: 获取系统支持的所有角色

**请求头**:
```
Authorization: Bearer <admin_token>
```

**成功响应 (200)**:
```json
[
  {
    "id": "DIRECTOR",
    "name": "系统管理员",
    "description": "全局审批 + 最终决策权",
    "userCount": 2,
    "permissions": ["全系统审批", "最终决策权", "人员管理", "数据管理"]
  },
  {
    "id": "MANAGER",
    "name": "部门主管",
    "description": "本部门审批 + 跨部门申请发起",
    "userCount": 5,
    "permissions": ["本部门审批", "跨部门申请", "群聊创建"]
  },
  {
    "id": "EMPLOYEE",
    "name": "普通员工",
    "description": "基础聊天功能",
    "userCount": 43,
    "permissions": ["发起申请", "查看个人数据"]
  }
]
```

### 获取角色成员
- **URL**: `GET /admin/roles/{roleId}/members`
- **认证**: 是（管理员）
- **描述**: 获取指定角色的所有成员

**路径参数**:
- `roleId`: 角色ID（DIRECTOR、MANAGER、EMPLOYEE）

**成功响应 (200)**:
```json
[
  {
    "id": "user_001",
    "name": "张三",
    "username": "testuser",
    "role": "director"
  }
]
```

---

## 错误码参考

| 状态码 | 说明 |
|-------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误或业务逻辑错误 |
| 401 | 未授权（无有效的 JWT token） |
| 403 | 禁止访问（权限不足） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 常见问题

### 如何获取 JWT Token?
通过调用 `/auth/login` 或 `/auth/register` 接口，成功后会返回 `token` 字段。

### Token 有效期是多久?
根据服务器配置，通常为 24 小时。过期后需要重新登录。

### 文件上传大小限制是多少?
当前限制为 50MB。

### 支持哪些文件类型?
- 图片: JPG, PNG, GIF, BMP, WebP
- 文档: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV

### 如何实现消息加密?
当前版本未实现端到端加密，建议在应用层实现。

---

**文档最后更新时间**: 2025年1月14日  
**维护者**: TeleMsg 开发团队

