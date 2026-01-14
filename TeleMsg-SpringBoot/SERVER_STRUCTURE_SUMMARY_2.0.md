# TeleMsg SpringBoot 服务端 - 完整项目结构与功能文档

**最后更新**: 2025年1月14日  
**文档版本**: 2.0  
**维护者**: TeleMsg 开发团队

---

## 📋 目录

1. [项目概述](#项目概述)
2. [核心功能](#核心功能)
3. [项目结构](#项目结构)
4. [技术栈](#技术栈)
5. [数据库设计](#数据库设计)
6. [API 控制器](#api-控制器)
7. [服务层](#服务层)
8. [快速开始](#快速开始)
9. [与客户端的集成](#与客户端的集成)
10. [常见问题](#常见问题)

---

## 项目概述

TeleMsg 是一个**生产级别的即时通讯（IM）系统后端服务**，基于 SpringBoot 3.2 构建。它提供完整的用户管理、群聊、私聊、文件存储、视频通话信令等功能，与原有的 MobileIMSDK 框架完全兼容。

### 关键特性

✅ **完整的用户认证与权限系统**  
✅ **私聊与群聊消息完整持久化**  
✅ **讨论空间支持（群内子分组）**  
✅ **MinIO 对象存储集成（文件、图片、视频）**  
✅ **消息搜索、撤回、删除等完整功能**  
✅ **部门管理与角色权限体系**  
✅ **RESTful API 完全覆盖所有功能**  
✅ **Docker 容器化部署支持**  

---

## 核心功能

### 1. 身份认证与授权

| 功能 | 端点 | 说明 |
|------|------|------|
| 用户登录 | `POST /auth/login` | 获取 JWT Token |
| 用户注册 | `POST /auth/register` | 新用户注册 |
| 用户登出 | `POST /auth/logout` | 登出并更新状态 |

**认证方式**: JWT Token  
**Token 有效期**: 根据配置（通常24小时）

### 2. 用户管理

| 功能 | 端点 | 说明 |
|------|------|------|
| 获取当前用户 | `GET /users/me` | 获取登录用户信息 |
| 获取用户信息 | `GET /users/{userId}` | 获取指定用户信息 |
| 更新用户资料 | `PUT /users/profile` | 更新当前用户资料 |
| 更新用户信息 | `PUT /users/{userId}` | 更新用户信息（管理员） |
| 更新用户角色 | `PUT /users/{userId}/role` | 更新用户角色和权限 |

**用户属性**:
- `userId`: 唯一标识
- `username`: 用户名
- `email`: 邮箱
- `phone`: 电话
- `avatar`: 头像URL
- `signature`: 个人签名
- `status`: 在线状态（ONLINE/OFFLINE/BUSY/AWAY）
- `role`: 角色（DIRECTOR/MANAGER/EMPLOYEE）
- `isAdmin`: 是否是管理员
- `departmentId`: 部门ID

### 3. 群组管理

| 功能 | 端点 | 说明 |
|------|------|------|
| 创建群组 | `POST /groups` | 创建新群组 |
| 获取群组信息 | `GET /groups/{groupId}` | 获取群组详情 |
| 加入群组 | `POST /groups/{groupId}/members` | 成员加入 |
| 离开群组 | `DELETE /groups/{groupId}/members/{userId}` | 成员离开 |
| 获取群成员 | `GET /groups/{groupId}/members` | 获取成员列表 |
| 获取用户群组 | `GET /groups/user/{userId}` | 获取用户所在群组 |
| 踢出成员 | `DELETE /groups/{groupId}/members/{targetUserId}/kick` | 踢出指定成员 |
| 设置管理员 | `PUT /groups/{groupId}/members/{targetUserId}/admin` | 设置/取消管理员 |
| 转让群主 | `PUT /groups/{groupId}/owner` | 转让群主权 |
| 解散群组 | `DELETE /groups/{groupId}` | 群主解散群组 |

**群组属性**:
- `groupId`: 唯一标识
- `groupName`: 群名称
- `description`: 群描述
- `avatar`: 群头像
- `ownerId`: 群主ID
- `type`: 群组类型（NORMAL/NORMAL/等）
- `maxMembers`: 最大成员数
- `parentGroupId`: 父群组ID（仅讨论空间使用）
- `createTime`: 创建时间

### 4. 讨论空间

讨论空间是群组内的子分组，用于进一步细分讨论话题。

| 功能 | 端点 | 说明 |
|------|------|------|
| 创建讨论空间 | `POST /discussion-spaces` | 在群组内创建讨论空间 |
| 获取讨论空间列表 | `GET /discussion-spaces` | 获取讨论空间列表 |
| 获取讨论空间详情 | `GET /discussion-spaces/{spaceId}` | 获取空间详情 |
| 添加空间成员 | `POST /discussion-spaces/{spaceId}/members` | 添加成员 |
| 移除空间成员 | `DELETE /discussion-spaces/{spaceId}/members/{memberId}` | 移除成员 |

**特点**:
- 拥有 `parentGroupId` 指向父群组
- 继承父群组的部分权限
- 支持独立的成员管理

### 5. 私聊消息

| 功能 | 端点 | 说明 |
|------|------|------|
| 发送消息 | `POST /messages` | 发送私聊消息 |
| 发送文件消息 | `POST /messages/send-file` | 发送带附件的消息 |
| 获取消息记录 | `GET /messages/private` | 分页获取聊天记录 |
| 标记已读 | `PUT /messages/private/read` | 标记消息已读 |
| 搜索消息 | `GET /messages/search` | 搜索消息 |
| 删除消息 | `DELETE /messages/{messageId}` | 删除消息 |
| 撤回消息 | `PUT /messages/{messageId}/recall` | 撤回消息 |

**消息属性**:
- `messageId`: 唯一标识
- `senderId`: 发送者ID
- `receiverId`: 接收者ID（私聊）
- `content`: 消息内容
- `messageType`: 消息类型（TEXT/IMAGE/VOICE/VIDEO/FILE/SYSTEM）
- `status`: 消息状态（SENT/DELIVERED/READ/FAILED）
- `fileId`: MinIO 文件ID（对于文件消息）
- `createTime`: 创建时间

### 6. 群聊消息

| 功能 | 端点 | 说明 |
|------|------|------|
| 发送群消息 | `POST /messages/group` | 发送群聊消息 |
| 发送文件消息 | `POST /messages/send-group-file` | 发送带附件的群消息 |
| 获取群消息 | `GET /messages/group/{groupId}` | 分页获取群消息 |
| 最近聊天列表 | `GET /messages/recent/{userId}` | 获取最近聊天 |
| 未读统计 | `GET /messages/unread/{userId}` | 获取未读数量 |

### 7. 文件管理（MinIO 对象存储）

| 功能 | 端点 | 说明 |
|------|------|------|
| 上传文件 | `POST /files/upload` | 上传文件到 MinIO |
| 获取文件信息 | `GET /files/{fileId}/info` | 获取文件元数据 |
| 获取下载链接 | `GET /files/{fileId}/url` | 获取预签名下载链接 |
| 下载文件 | `GET /files/{fileId}` | 直接下载文件 |
| 查看文件 | `GET /files/{fileId}/view` | 浏览器内查看文件 |
| 删除文件 | `DELETE /files/{fileId}` | 删除文件 |

**文件存储特性**:
- 自动生成缩略图（图片类型）
- 按日期自动分类存储（`YYYY/MM/` 路径）
- 支持多种文件类型
- 最大文件大小: 50MB
- 安全的访问控制

**支持的文件类型**:
- 图片: JPG, PNG, GIF, BMP, WebP
- 文档: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV

### 8. 联系人管理

| 功能 | 端点 | 说明 |
|------|------|------|
| 获取联系人列表 | `GET /contacts` | 获取所有联系人 |
| 添加联系人 | `POST /contacts` | 添加新联系人 |
| 删除联系人 | `DELETE /contacts/{contactId}` | 删除联系人 |

### 9. 视频/语音通话（信令）

| 功能 | 端点 | 说明 |
|------|------|------|
| 发起通话 | `POST /calls/initiate` | 发起视频/语音通话 |
| 接听通话 | `POST /calls/answer` | 接听来电 |
| 结束通话 | `POST /calls/end` | 结束通话 |

**说明**: 这些接口仅提供信令传递，实际媒体传输通过 WebRTC 进行。

### 10. 部门管理（仅管理员）

| 功能 | 端点 | 说明 |
|------|------|------|
| 获取部门列表 | `GET /admin/departments` | 获取所有部门 |
| 创建部门 | `POST /admin/departments` | 创建新部门 |
| 获取部门成员 | `GET /admin/departments/{departmentId}/members` | 获取部门成员 |
| 添加部门成员 | `POST /admin/departments/{departmentId}/members` | 添加成员 |
| 移除部门成员 | `DELETE /admin/departments/{departmentId}/members/{userId}` | 移除成员 |

**部门属性**:
- `departmentId`: 唯一标识
- `name`: 部门名称
- `description`: 部门描述
- `managerId`: 部门经理ID
- `parentDepartmentId`: 上级部门ID（支持树状结构）

### 11. 管理员功能

| 功能 | 端点 | 说明 |
|------|------|------|
| 获取所有用户 | `GET /admin/users` | 列表所有用户 |
| 删除用户 | `DELETE /admin/users/{userId}` | 删除指定用户 |
| 更新用户角色 | `PUT /admin/users/{userId}/role` | 修改用户角色 |
| 系统统计 | `GET /admin/stats` | 获取系统统计信息 |
| 获取角色列表 | `GET /admin/roles` | 获取所有角色 |
| 获取角色成员 | `GET /admin/roles/{roleId}/members` | 获取指定角色的成员 |

---

## 项目结构

```
TeleMsg-SpringBoot/
├── 📄 核心配置文件
│   ├── build.gradle                    # Gradle 构建配置
│   ├── settings.gradle                 # Gradle settings
│   ├── docker-compose.yml             # Docker 编排配置
│   └── Dockerfile                     # Docker 镜像构建
│
├── 📚 源代码 (src/main/java/)
│   └── com/telemsg/server/
│       ├── TeleMsgServerApplication.java              # 应用启动类
│       │
│       ├── controller/                               # REST API 控制器层
│       │   ├── AuthController.java                   # 认证接口（登录/注册/登出）
│       │   ├── UserController.java                   # 用户管理接口
│       │   ├── GroupController.java                  # 群组管理接口
│       │   ├── DiscussionSpaceController.java        # 讨论空间接口
│       │   ├── MessageController.java                # 消息管理接口
│       │   ├── FileController.java                   # 文件上传/下载接口
│       │   ├── ContactController.java                # 联系人管理接口
│       │   ├── CallController.java                   # 视频通话接口
│       │   ├── AdminController.java                  # 管理员接口
│       │   └── ApiResponse.java                      # 统一响应格式
│       │
│       ├── service/                                  # 业务逻辑层
│       │   ├── UserService.java                      # 用户业务逻辑
│       │   ├── GroupService.java                     # 群组业务逻辑
│       │   ├── MessageService.java                   # 消息业务逻辑
│       │   ├── MinIOService.java                     # MinIO 文件操作
│       │   ├── DepartmentService.java                # 部门管理逻辑
│       │   └── JwtService.java                       # JWT Token 处理
│       │
│       ├── repository/                               # 数据访问层（JPA）
│       │   ├── UserRepository.java                   # 用户数据访问
│       │   ├── GroupRepository.java                  # 群组数据访问
│       │   ├── GroupMemberRepository.java            # 群成员数据访问
│       │   ├── MessageRepository.java                # 消息数据访问
│       │   ├── FileInfoRepository.java               # 文件信息数据访问
│       │   └── DepartmentRepository.java             # 部门数据访问
│       │
│       ├── entity/                                   # JPA 实体类
│       │   ├── User.java                             # 用户实体
│       │   ├── Group.java                            # 群组实体
│       │   ├── GroupMember.java                      # 群成员实体
│       │   ├── Message.java                          # 消息实体
│       │   ├── FileInfo.java                         # 文件信息实体
│       │   └── Department.java                       # 部门实体
│       │
│       ├── dto/                                      # 数据传输对象
│       │   └── FileUploadResponse.java               # 文件上传响应
│       │
│       ├── config/                                   # 配置类
│       │   └── SecurityConfig.java                   # Spring Security 配置
│       │
│       ├── im/                                       # IM 集成层
│       │   ├── TeleMsgServerLauncher.java           # IM 服务启动器
│       │   ├── TeleMsgServerEventListener.java      # IM 事件监听
│       │   ├── IMSessionManager.java                # IM 会话管理
│       │   └── TeleMsgQoSEventListener.java         # QoS 事件处理
│       │
│       └── websocket/                                # WebSocket 支持（如有）
│           └── [WebSocket 相关类]
│
├── ⚙️ 配置文件 (src/main/resources/)
│   ├── application.properties               # 主配置文件
│   ├── application-dev.properties          # 开发环境配置
│   └── application-prod.properties         # 生产环境配置
│
├── 🐳 Docker 支持
│   ├── docker/
│   │   ├── mysql/
│   │   │   └── init.sql                   # MySQL 初始化脚本
│   │   └── minio/
│   │       └── [MinIO 配置]
│   └── docker-compose.yml                 # Docker Compose 编排
│
└── 📚 文档
    ├── API_DOCUMENTATION_2.0.md           # API 接口文档（完整）
    ├── README.md                          # 项目说明
    ├── QUICK_START.md                     # 快速开始
    └── SERVER_STRUCTURE_SUMMARY.md        # 项目结构总结
```

---

## 技术栈

### 后端框架
- **Spring Boot**: 3.2（最新 LTS）
- **Java**: 21
- **Spring Data JPA**: 数据访问
- **Spring Security**: 安全认证
- **Lombok**: 代码生成

### 数据库
- **MySQL 8.0+**: 主数据库
- **H2**: 内存数据库（测试用）
- **Redis**: 缓存（可选）

### 对象存储
- **MinIO**: 分布式对象存储，支持文件、图片、视频存储

### IM 框架
- **MobileIMSDK 4.x**: 集成原有 IM 协议支持
- **Netty**: TCP/UDP 通信支持

### 构建工具
- **Gradle**: 项目构建
- **Docker**: 容器化部署

### 开发工具
- **IntelliJ IDEA**: 推荐 IDE
- **Git**: 版本控制
- **Postman**: API 测试

---

## 数据库设计

### 核心数据表

#### 1. tm_users（用户表）
```sql
CREATE TABLE tm_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    avatar VARCHAR(200),
    signature VARCHAR(500),
    status ENUM('ONLINE', 'OFFLINE', 'BUSY', 'AWAY') DEFAULT 'OFFLINE',
    is_admin BOOLEAN DEFAULT FALSE,
    role ENUM('DIRECTOR', 'MANAGER', 'EMPLOYEE') DEFAULT 'EMPLOYEE',
    department_id VARCHAR(50),
    deleted BOOLEAN DEFAULT FALSE,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_time TIMESTAMP,
    last_login_ip VARCHAR(50)
);
```

#### 2. tm_groups（群组表）
```sql
CREATE TABLE tm_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id VARCHAR(50) UNIQUE NOT NULL,
    group_name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    avatar VARCHAR(200),
    owner_id VARCHAR(50) NOT NULL,
    parent_group_id VARCHAR(50),  -- 讨论空间的父群组ID
    type VARCHAR(50) DEFAULT 'NORMAL',
    max_members INT DEFAULT 200,
    deleted BOOLEAN DEFAULT FALSE,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 3. tm_group_members（群成员表）
```sql
CREATE TABLE tm_group_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    role ENUM('OWNER', 'ADMIN', 'MEMBER') DEFAULT 'MEMBER',
    nickname VARCHAR(100),
    muted BOOLEAN DEFAULT FALSE,
    muted_until TIMESTAMP,
    join_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_group_user (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES tm_groups(group_id),
    FOREIGN KEY (user_id) REFERENCES tm_users(user_id)
);
```

#### 4. tm_messages（消息表）
```sql
CREATE TABLE tm_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id VARCHAR(100) UNIQUE NOT NULL,
    sender_id VARCHAR(50) NOT NULL,
    receiver_id VARCHAR(50),          -- 私聊接收者
    group_id VARCHAR(50),              -- 群聊ID
    message_type ENUM('TEXT', 'IMAGE', 'VOICE', 'VIDEO', 'FILE', 'SYSTEM'),
    content LONGTEXT,
    media_url VARCHAR(500),
    file_name VARCHAR(200),
    file_size BIGINT,
    file_id VARCHAR(100),              -- MinIO 文件ID
    thumbnail_url VARCHAR(500),        -- 图片缩略图
    status ENUM('SENT', 'DELIVERED', 'READ', 'FAILED') DEFAULT 'SENT',
    deleted BOOLEAN DEFAULT FALSE,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_sender (sender_id),
    KEY idx_receiver (receiver_id),
    KEY idx_group (group_id),
    KEY idx_create_time (create_time)
);
```

#### 5. tm_file_info（文件信息表）
```sql
CREATE TABLE tm_file_info (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_id VARCHAR(100) UNIQUE NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    file_size BIGINT,
    uploaded_by VARCHAR(50) NOT NULL,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    minio_path VARCHAR(255)            -- MinIO 存储路径
);
```

#### 6. tm_departments（部门表）
```sql
CREATE TABLE tm_departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    manager_id VARCHAR(50),
    parent_department_id VARCHAR(50),  -- 支持树状结构
    deleted BOOLEAN DEFAULT FALSE,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 索引设计

已在关键表上创建索引以优化查询性能：
- `tm_messages`: `idx_sender`, `idx_receiver`, `idx_group`, `idx_create_time`
- `tm_group_members`: `unique_group_user` (复合主键)
- `tm_users`: `user_id` (唯一索引)
- `tm_groups`: `group_id` (唯一索引)

---

## API 控制器

### 1. AuthController（认证）
- **路径**: `/auth`
- **用途**: 处理用户登录、注册、登出

**主要接口**:
- `POST /auth/login`: 用户登录
- `POST /auth/register`: 用户注册
- `POST /auth/logout`: 用户登出

### 2. UserController（用户管理）
- **路径**: `/users`
- **用途**: 用户个人信息管理

**主要接口**:
- `GET /users/me`: 获取当前用户
- `GET /users/{userId}`: 获取用户信息
- `PUT /users/profile`: 更新用户资料
- `PUT /users/{userId}`: 更新用户信息
- `PUT /users/{userId}/role`: 更新用户角色

### 3. GroupController（群组管理）
- **路径**: `/groups`
- **用途**: 群组及群成员管理

**主要接口**:
- `POST /groups`: 创建群组
- `GET /groups/{groupId}`: 获取群组信息
- `POST /groups/{groupId}/members`: 加入群组
- `DELETE /groups/{groupId}/members/{userId}`: 离开群组
- `GET /groups/{groupId}/members`: 获取成员列表
- `GET /groups/user/{userId}`: 获取用户的群组
- `DELETE /groups/{groupId}/members/{targetUserId}/kick`: 踢出成员
- `PUT /groups/{groupId}/members/{targetUserId}/admin`: 设置管理员
- `PUT /groups/{groupId}/owner`: 转让群主
- `DELETE /groups/{groupId}`: 解散群组

### 4. DiscussionSpaceController（讨论空间）
- **路径**: `/discussion-spaces`
- **用途**: 群组内的讨论空间管理

**主要接口**:
- `POST /discussion-spaces`: 创建讨论空间
- `GET /discussion-spaces`: 获取讨论空间列表
- `GET /discussion-spaces/{spaceId}`: 获取讨论空间详情
- `POST /discussion-spaces/{spaceId}/members`: 添加成员
- `DELETE /discussion-spaces/{spaceId}/members/{memberId}`: 移除成员

### 5. MessageController（消息管理）
- **路径**: `/messages`
- **用途**: 私聊、群聊消息管理

**主要接口**:
- `POST /messages`: 发送私聊消息
- `POST /messages/group`: 发送群聊消息
- `GET /messages/private`: 获取私聊记录
- `GET /messages/group/{groupId}`: 获取群聊记录
- `GET /messages/recent/{userId}`: 获取最近聊天
- `PUT /messages/{messageId}/read`: 标记消息已读
- `PUT /messages/private/read`: 标记私聊已读
- `GET /messages/search`: 搜索消息
- `DELETE /messages/{messageId}`: 删除消息
- `PUT /messages/{messageId}/recall`: 撤回消息
- `GET /messages/unread/{userId}`: 获取未读数统计
- `POST /messages/send-file`: 发送带文件的私聊消息
- `POST /messages/send-group-file`: 发送带文件的群聊消息

### 6. FileController（文件管理）
- **路径**: `/files`
- **用途**: 文件上传、下载、管理（基于 MinIO）

**主要接口**:
- `POST /files/upload`: 上传文件
- `GET /files/{fileId}`: 下载文件
- `GET /files/{fileId}/view`: 查看文件（内联显示）
- `GET /files/{fileId}/url`: 获取下载链接
- `GET /files/{fileId}/info`: 获取文件信息
- `DELETE /files/{fileId}`: 删除文件

### 7. ContactController（联系人）
- **路径**: `/contacts`
- **用途**: 用户联系人管理

**主要接口**:
- `GET /contacts`: 获取联系人列表
- `POST /contacts`: 添加联系人
- `DELETE /contacts/{contactId}`: 删除联系人

### 8. CallController（视频通话）
- **路径**: `/calls`
- **用途**: 视频/语音通话信令

**主要接口**:
- `POST /calls/initiate`: 发起通话
- `POST /calls/answer`: 接听通话
- `POST /calls/end`: 结束通话

### 9. AdminController（管理员）
- **路径**: `/admin`
- **用途**: 管理员权限的系统管理功能

**主要接口**:
- `GET /admin/users`: 获取所有用户
- `DELETE /admin/users/{userId}`: 删除用户
- `PUT /admin/users/{userId}/role`: 更新用户角色
- `GET /admin/stats`: 系统统计
- `GET /admin/departments`: 获取部门列表
- `POST /admin/departments`: 创建部门
- `GET /admin/departments/{departmentId}/members`: 获取部门成员
- `POST /admin/departments/{departmentId}/members`: 添加部门成员
- `DELETE /admin/departments/{departmentId}/members/{userId}`: 移除部门成员
- `GET /admin/roles`: 获取角色列表
- `GET /admin/roles/{roleId}/members`: 获取角色成员

---

## 服务层

### UserService
**职责**: 用户相关的业务逻辑

**核心方法**:
- `authenticateUser(username, password)`: 用户认证
- `registerUserWithDisplayName(name, username, password, email)`: 用户注册
- `findByUserId(userId)`: 根据ID查找用户
- `updateUserProfile(userId, name, username)`: 更新用户资料
- `updateUserInfo(...)`: 更新用户信息
- `updateUserStatus(userId, status)`: 更新用户在线状态
- `deleteUser(userId)`: 删除用户
- `findAllUsers()`: 获取所有用户
- `getUsersByRole(role)`: 按角色查找用户
- `getTotalUserCount()`: 获取用户总数
- `getOnlineUserCount()`: 获取在线用户数

### GroupService
**职责**: 群组及群成员相关的业务逻辑

**核心方法**:
- `createGroup(groupName, description, ownerId)`: 创建群组
- `findByGroupId(groupId)`: 查找群组
- `joinGroup(groupId, userId, nickname)`: 加入群组
- `leaveGroup(groupId, userId)`: 离开群组
- `getGroupMembers(groupId)`: 获取群成员列表
- `getUserGroups(userId)`: 获取用户所在群组
- `kickMember(groupId, operatorId, targetUserId)`: 踢出成员
- `setAdmin(groupId, ownerId, targetUserId, isAdmin)`: 设置管理员
- `transferOwnership(groupId, currentOwnerId, newOwnerId)`: 转让群主
- `dissolveGroup(groupId, ownerId)`: 解散群组
- `createDiscussionSpace(...)`: 创建讨论空间
- `getDiscussionSpacesByParentGroup(groupId)`: 获取群组的讨论空间
- `getUserDiscussionSpaces(userId)`: 获取用户的讨论空间

### MessageService
**职责**: 消息相关的业务逻辑

**核心方法**:
- `sendPrivateMessage(senderId, recipientId, type, content, mediaUrl)`: 发送私聊消息
- `sendGroupMessage(senderId, groupId, type, content, mediaUrl)`: 发送群聊消息
- `getPrivateMessages(user1, user2, limit)`: 获取私聊消息
- `getPrivateMessages(user1, user2, pageable)`: 分页获取私聊消息
- `getGroupMessages(groupId, pageable)`: 分页获取群聊消息
- `getRecentChats(userId)`: 获取最近聊天列表
- `markMessageAsRead(messageId, userId)`: 标记消息已读
- `markPrivateMessagesAsRead(senderId, receiverId)`: 标记私聊已读
- `searchMessages(userId, keyword)`: 搜索消息
- `deleteMessage(messageId, operatorId)`: 删除消息
- `recallMessage(messageId, operatorId)`: 撤回消息
- `countUnreadPrivateMessages(userId)`: 获取未读消息数
- `countUnreadMessagesFromSender(receiverId, senderId)`: 获取来自特定发送者的未读消息数
- `getTotalMessageCount()`: 获取消息总数
- `sendPrivateFileMessage(senderId, recipientId, type, content, fileInfo)`: 发送带文件的私聊消息
- `sendGroupFileMessage(senderId, groupId, type, content, fileInfo)`: 发送带文件的群聊消息

### MinIOService
**职责**: MinIO 对象存储的文件操作

**核心方法**:
- `uploadFile(multipartFile, userId)`: 上传文件
- `getFileInfo(fileId)`: 获取文件信息
- `getFileStream(fileId)`: 获取文件流
- `getDownloadUrl(fileId)`: 获取下载链接
- `deleteFile(fileId)`: 删除文件
- `generateThumbnail(...)`: 生成缩略图

### DepartmentService
**职责**: 部门管理的业务逻辑

**核心方法**:
- `createDepartment(name, description, managerId, parentDepartmentId)`: 创建部门
- `findAllDepartments()`: 获取所有部门
- `findDepartmentMembers(departmentId)`: 获取部门成员
- `addDepartmentMembers(departmentId, userIds)`: 添加部门成员
- `removeDepartmentMember(departmentId, userId)`: 移除部门成员
- `getDepartmentMemberCount(departmentId)`: 获取部门成员数

### JwtService
**职责**: JWT Token 的生成和验证

**核心方法**:
- `generateToken(userId)`: 生成 JWT Token
- `extractUserId(token)`: 从 Token 提取用户ID
- `isTokenValid(token)`: 验证 Token 有效性

---

## 快速开始

### 前置要求
- Java 21+
- MySQL 8.0+
- Gradle 7.0+
- Docker（可选）

### 开发环境配置

#### 1. 克隆项目
```bash
git clone https://github.com/your-repo/TeleMsg.git
cd TeleMsg-SpringBoot
```

#### 2. 配置数据库
编辑 `src/main/resources/application-dev.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/telemsg?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

#### 3. 配置 MinIO
```properties
minio.endpoint=http://localhost:9000
minio.accessKey=minioadmin
minio.secretKey=minioadmin
minio.bucketName=telemsg
```

#### 4. 编译和运行

**Windows**:
```bash
gradlew bootRun --args='--spring.profiles.active=dev'
```

**Linux/Mac**:
```bash
./gradlew bootRun --args='--spring.profiles.active=dev'
```

#### 5. 访问应用
- API 服务: http://localhost:8080
- IM 服务 TCP: localhost:8901
- 原 SDK TCP: localhost:7901

### Docker 部署

#### 1. 使用 docker-compose 启动完整环境
```bash
docker-compose up -d
```

这将启动:
- MySQL 8.0
- MinIO
- TeleMsg SpringBoot 服务
- Nginx（可选反向代理）

#### 2. 查看日志
```bash
docker-compose logs -f telemsg-server
```

#### 3. 停止服务
```bash
docker-compose down
```

---

## 与客户端的集成

### 原有 Client 项目集成

#### 1. 配置服务器地址
修改 `Client/src/.../ConfigEntity.java`:

```java
public class ConfigEntity {
    // IM 服务器地址
    public static String serverIP = "localhost";
    
    // TCP 端口（新服务端）
    public static int serverTCPPort = 8901;
    
    // UDP 端口（新服务端）
    public static int serverUDPPort = 7901;
    
    // WebSocket 端口
    public static int serverWebsocketPort = 8080;
    
    // HTTP API 基地址
    public static String apiBaseUrl = "http://localhost:8080";
}
```

#### 2. 用户认证集成
```java
// 用户登录 - 获取 JWT Token
HttpResponse<String> authResponse = new HttpClient()
    .post("http://localhost:8080/auth/login")
    .body(new LoginRequest("username", "password"))
    .execute();

String token = authResponse.jsonPath("token").asString();

// 后续 API 请求都带上 token
HttpHeaders headers = new HttpHeaders();
headers.put("Authorization", "Bearer " + token);
```

#### 3. IM 连接初始化
```java
// 连接 IM 服务
IMClientManager.getInstance()
    .connectServer(serverIP, serverTCPPort)
    .onConnected(() -> {
        // 上线操作
        Log.d("IM", "Connected");
    })
    .start();
```

---

## 常见问题

### Q1: 如何修改 JWT Token 有效期?
编辑 `JwtService.java`:
```java
private static final long JWT_TOKEN_VALIDITY = 24 * 60 * 60 * 1000; // 24 小时
```

### Q2: 如何扩展支持更多文件类型?
编辑 `MinIOService.java` 的 `validateFileType()` 方法:
```java
private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
    "jpg", "png", "gif", "bmp", "webp",  // 图片
    "pdf", "doc", "docx", "xls", "xlsx", // 文档
    "txt", "csv", "zip", "rar"            // 其他
);
```

### Q3: 如何增加 MinIO 文件大小限制?
编辑 `application.properties`:
```properties
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB
```

### Q4: 如何添加自定义业务逻辑?
参考现有服务实现新的 Service 类：
1. 创建 `*Service.java` 在 `service` 包
2. 使用 `@Service` 注解
3. 注入 `*Repository`
4. 实现业务方法

### Q5: 如何实现权限控制?
现有实现在 `AdminController` 中使用:
```java
private User extractUserAndCheckAdmin(String authHeader) {
    // 验证 admin 权限
}
```

可扩展使用 Spring Security 的 `@PreAuthorize` 注解：
```java
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/admin/users")
public ResponseEntity<?> getAllUsers() { }
```

### Q6: 数据库初始化失败怎么办?
1. 确保 MySQL 已启动
2. 检查 `application.properties` 中的连接字符串
3. 确保用户有创建数据库的权限
4. 查看控制台错误信息

### Q7: MinIO 连接失败怎么办?
1. 确保 MinIO 服务已启动
2. 检查 MinIO 的地址和端口配置
3. 验证访问密钥 (accessKey, secretKey)
4. 查看 MinIO 日志了解具体错误

### Q8: 如何集成 Redis 缓存?
1. 添加 Redis 依赖到 `build.gradle`
2. 配置 Redis 连接信息
3. 使用 `@Cacheable` 注解缓存方法

### Q9: 支持对消息进行加密吗?
当前版本不支持端到端加密。建议在客户端层面实现：
1. 使用 RSA 或 AES 加密消息内容
2. 加密后再通过 API 发送
3. 接收端解密显示

### Q10: 如何处理离线消息?
系统已完全支持离线消息存储：
1. 所有消息都持久化到数据库
2. 用户登录后可获取历史消息
3. 可通过 `GET /messages/unread/{userId}` 获取未读数

---

## 性能优化建议

### 1. 数据库优化
- 已为关键字段添加索引（见数据库设计）
- 定期清理已删除的消息（逻辑删除）
- 考虑分表存储历史消息

### 2. 缓存策略
- 使用 Redis 缓存用户信息和群组数据
- 缓存热门群组的成员列表
- 设置合理的过期时间（TTL）

### 3. API 性能
- 使用分页查询大量数据
- 避免一次性加载所有消息
- 考虑异步处理文件上传

### 4. 连接管理
- 使用数据库连接池（HikariCP）
- 配置合理的线程池大小
- 实施连接超时设置

---

## 监控和日志

### 日志配置
日志由 `log4j2.xml` 配置，默认输出到：
- 控制台
- `logs/` 目录下的文件

### 监控端点
Spring Boot Actuator 提供监控端点：
- `GET /actuator/health`: 健康检查
- `GET /actuator/metrics`: 应用指标

---

## 安全建议

### 1. 生产环境配置
- 更改所有默认密钥和密码
- 使用 HTTPS/SSL
- 启用 CORS 白名单
- 配置防火墙规则

### 2. JWT 安全
- 使用强密钥生成 Token
- 设置合理的有效期
- 实施 Token 刷新机制
- 存储敏感信息时进行加密

### 3. 数据库安全
- 定期备份
- 使用用户权限控制
- 启用 SQL 注入防护（JPA 自动处理）
- 加密敏感列（如密码）

### 4. API 安全
- 实施 API 速率限制
- 验证所有用户输入
- 使用参数化查询
- 定期安全审计

---

## 许可证

MIT License - 详见 LICENSE 文件

---

## 支持

遇到问题或有建议，请：
1. 查看相关文档
2. 检查日志输出
3. 提交 Issue
4. 联系开发团队

---

**最后更新**: 2025年1月14日  
**维护者**: TeleMsg 开发团队  
**文档版本**: 2.0

