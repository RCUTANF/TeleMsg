# TeleMsg 项目总结文档

## 项目概述

TeleMsg 是一个**企业级即时通讯（IM）系统**，采用前后端分离架构，支持私聊、群聊、文件传输、视频通话等完整通讯功能。项目正在集成WebRTC技术以实现P2P语音通话功能。

## 技术架构

### 整体架构
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Electron      │    │   Spring Boot   │    │   MobileIMSDK   │
│   客户端        │◄──►│   后端服务      │◄──►│   核心引擎      │
│  (React+TS)     │    │  (REST+WebSocket)│    │  (Java Netty)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
       │                        │                        │
       └────────────────────────┼────────────────────────┘
                                ▼
                       ┌─────────────────┐
                       │   MySQL + MinIO │
                       │   数据存储      │
                       └─────────────────┘
```

### 技术栈详情

#### 前端 (ui/)
- **框架**: React 18.3.1 + TypeScript
  - 实现：函数式组件 + Hooks + TypeScript类型安全
  - 路由：React Router (未明确，但从项目结构推测)
- **桌面应用**: Electron
  - 实现：主进程(main.js) + 渲染进程(React)
  - 打包：electron-builder支持跨平台构建
- **UI组件**: Radix UI + Tailwind CSS + Material-UI
  - 实现：组合使用，Radix提供无样式组件，Tailwind提供样式
- **构建工具**: Vite
  - 配置：vite.config.ts + TypeScript编译
- **状态管理**: React Hooks + Context
  - 实现：useState/useEffect + React Context API
- **通信**: WebSocket + REST API
  - 实现：services/api.ts封装HTTP请求，WebSocket实时通信

#### 后端 (TeleMsg-SpringBoot/)
- **框架**: Spring Boot 3.2.1
  - 实现：自动配置 + 注解驱动开发
  - 启动类：TeleMsgServerApplication.java
- **Java版本**: Java 21
  - 特性：使用最新LTS版本，支持现代Java特性
- **数据库**: MySQL 8.0 + H2 (测试)
  - 实现：JPA/Hibernate ORM + MyBatis Plus混合使用
  - 连接池：HikariCP (Spring Boot默认)
- **ORM**: MyBatis Plus 3.5.5
  - 实现：BaseMapper接口 + 自定义SQL + 分页插件
- **认证**: JWT Token + Spring Security
  - 实现：JwtService.java生成/验证token，SecurityConfig配置拦截器
- **缓存**: Spring Cache
  - 实现：@Cacheable注解 + Redis/Caffeine可选
- **对象存储**: MinIO
  - 实现：MinIOService.java封装SDK操作
- **日志**: Log4j2
  - 配置：log4j2.xml + Lombok @Slf4j注解

#### 核心引擎
- **MobileIMSDK**: 基于Netty的IM核心引擎
  - 实现：Netty 4.1.100.Final异步网络框架
  - 协议：TCP长连接 + 自定义协议格式
- **网络协议**: TCP/WebSocket双协议支持
  - 实现：TeleMsgWebSocketHandler.java处理WebSocket
- **消息格式**: JSON (Gson)
  - 实现：Gson序列化/反序列化消息对象

#### 其他组件
- **Client**: Java Swing客户端 (传统桌面应用)
  - 实现：Swing GUI + MobileIMSDK集成
- **Client_SDK**: 客户端SDK开发包
  - 实现：JAR包形式，提供API接口
- **Server**: 独立IM服务器
  - 实现：纯Netty服务器，无Spring框架
- **Server_SDK**: 服务端SDK开发包
  - 实现：服务端集成包

## 核心功能

### 1. 用户系统
- ✅ **用户注册/登录/登出**
  - 实现：使用Spring Security + JWT Token认证
  - 登录流程：用户名密码验证 → 生成JWT Token → 更新在线状态
  - 注册流程：创建用户实体 → 密码加密存储 → 返回认证信息
- ✅ **JWT身份认证**
  - 实现：使用io.jsonwebtoken库生成和验证Token
  - Token包含：用户ID、过期时间、签名
  - 拦截器验证：Authorization头Bearer Token解析
- ✅ **用户资料管理**
  - 实体：User.java (JPA实体，包含头像、签名、状态等字段)
  - 数据库表：tm_users (MySQL表，带索引优化)
- ✅ **角色权限体系 (DIRECTOR/MANAGER/EMPLOYEE)**
  - 实现：枚举UserRole + 权限注解@PreAuthorize
  - 权限控制：基于角色的访问控制(RBAC)
- ✅ **部门管理**
  - 实体：Department.java + 层级关系支持
- ✅ **在线状态管理**
  - 实现：WebSocket连接状态 + 数据库状态同步
  - 状态枚举：ONLINE/OFFLINE/BUSY/AWAY

### 2. 通讯功能
- ✅ **私聊消息 (实时/历史)**
  - 实现：WebSocket实时推送 + REST API历史查询
  - 消息实体：Message.java (支持文本/文件/图片等类型)
  - 数据库：tm_messages表，带sender/receiver索引
- ✅ **群组聊天**
  - 实现：Group.java实体 + GroupMember.java关联表
  - 消息路由：根据groupId转发到所有群成员
- ✅ **讨论空间 (群内子分组)**
  - 实现：parentGroupId字段实现层级结构
  - 控制器：DiscussionSpaceController.java
- ✅ **消息搜索、撤回、删除**
  - 实现：软删除(deleted字段) + 索引优化搜索
  - 撤回：权限验证 + 消息状态更新
- ✅ **文件/图片/视频传输**
  - 实现：MinIO对象存储 + FileInfo.java元数据管理
  - 上传流程：前端分片上传 → 后端MinIO存储 → 生成访问URL
- ✅ **MinIO对象存储集成**
  - 服务：MinIOService.java封装上传/下载/删除操作
  - 配置：application.yml中配置endpoint/accessKey等

### 3. 群组管理
- ✅ **创建/解散群组**
  - 实现：GroupController.java + 权限验证(群主权限)
  - 级联操作：删除群组时清理成员和消息
- ✅ **成员管理 (加入/离开/踢出)**
  - 实现：GroupMember.java实体管理成员关系
  - 权限：群主可踢出成员，成员可主动离开
- ✅ **管理员设置**
  - 实现：isAdmin字段标识管理员权限
- ✅ **群主转让**
  - 实现：ownerId字段更新 + 权限验证
- ✅ **群组类型支持**
  - 枚举：NORMAL等类型定义

### 4. WebRTC语音通话 (开发中)
- 🚧 **P2P语音通话**
  - 计划：WebRTC API + Simple-Peer库封装
  - 架构：信令服务器(Spring Boot) + P2P媒体流
- 🚧 **局域网优化方案**
  - 实现：无需TURN服务器，简化ICE配置
  - 目标：15-20人天，2-3周完成
- 🚧 **信令服务器集成**
  - 扩展：TeleMsgWebSocketHandler.java添加WebRTC信令
- 🚧 **音频质量优化**
  - 配置：回音消除、噪声抑制、自动增益控制

## 项目结构

```
TeleMsg/
├── build.gradle                    # 根构建配置
├── gradle.properties              # Gradle属性
├── settings.gradle                # 项目设置
├── 
├── Client/                        # Java Swing客户端
│   ├── build.gradle
│   ├── lib/                       # 第三方库
│   └── src/                       # 源代码
│
├── Client_SDK/                    # 客户端SDK
│   ├── build.gradle
│   ├── lib/
│   └── src/
│
├── Server/                        # 独立IM服务器
│   ├── build.gradle
│   ├── lib/
│   ├── script/                    # 启动脚本
│   └── src/
│
├── Server_SDK/                    # 服务端SDK
│   ├── build.gradle
│   ├── libs/
│   └── src/
│
├── TeleMsg-SpringBoot/            # Spring Boot后端
│   ├── build.gradle
│   ├── settings.gradle
│   ├── docker-compose.yml         # Docker配置
│   ├── Dockerfile
│   ├── scripts/                   # 部署脚本
│   ├── src/main/
│   │   ├── java/                  # Java源代码
│   │   ├── resources/             # 配置文件
│   │   └── webapp/                # Web资源
│   └── docs/                      # API文档
│
├── ui/                            # Electron前端
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── public/                    # 静态资源
│   ├── src/                       # React源代码
│   └── build/                     # 构建输出
│
└── docs/                          # 项目文档
    ├── WEBRTC_P2P_IMPLEMENTATION_PLAN.md
    ├── WEBRTC_P2P_LAN_AGILE_PLAN.md
    └── API_DOCUMENTATION_2.0.md
```

## 数据模型

### 核心实体关系

```
User (用户)
├── id: Long (主键)
├── userId: String (唯一标识)
├── username: String (用户名)
├── password: String (加密密码)
├── email: String (邮箱)
├── phone: String (电话)
├── avatar: String (头像URL)
├── signature: String (个人签名)
├── status: UserStatus (在线状态)
├── role: UserRole (角色)
├── departmentId: String (部门ID)
├── isAdmin: Boolean (是否管理员)
└── timestamps (创建/更新时间)

Message (消息)
├── id: Long (主键)
├── messageId: String (唯一标识)
├── senderId: String (发送者ID)
├── receiverId: String (私聊接收者ID)
├── groupId: String (群聊群组ID)
├── messageType: MessageType (消息类型)
├── content: String (文本内容)
├── mediaUrl: String (媒体文件URL)
├── fileName: String (文件名)
├── fileSize: Long (文件大小)
├── fileId: String (MinIO文件ID)
├── thumbnailUrl: String (缩略图URL)
├── status: MessageStatus (消息状态)
└── timestamps (创建/更新时间)

Group (群组)
├── id: Long (主键)
├── groupId: String (唯一标识)
├── groupName: String (群名称)
├── description: String (群描述)
├── avatar: String (群头像)
├── ownerId: String (群主ID)
├── type: GroupType (群类型)
├── maxMembers: Integer (最大成员数)
├── parentGroupId: String (父群组ID)
└── timestamps (创建/更新时间)

GroupMember (群成员)
├── id: Long (主键)
├── groupId: String (群组ID)
├── userId: String (用户ID)
├── role: MemberRole (成员角色)
├── joinedAt: LocalDateTime (加入时间)
└── isAdmin: Boolean (是否管理员)

FileInfo (文件信息)
├── id: Long (主键)
├── fileId: String (MinIO文件ID)
├── originalName: String (原始文件名)
├── fileName: String (存储文件名)
├── fileSize: Long (文件大小)
├── contentType: String (文件类型)
├── bucket: String (存储桶)
├── url: String (访问URL)
├── thumbnailUrl: String (缩略图URL)
├── uploadedBy: String (上传者ID)
└── timestamps (上传/更新时间)
```

### 数据库设计特点

- **索引优化**: 消息表按发送者、接收者、群组ID建立复合索引
- **软删除**: 所有实体支持软删除(deleted字段)
- **审计字段**: 自动维护创建时间和更新时间
- **外键约束**: 通过逻辑外键保证数据一致性
- **分表策略**: 消息表可按时间分表处理大数据量

## API接口设计

### RESTful API架构

#### 认证接口 (`/auth/*`)
```bash
POST /auth/login          # 用户登录
POST /auth/register       # 用户注册
POST /auth/logout         # 用户登出
```

#### 用户管理 (`/users/*`)
```bash
GET /users/me             # 获取当前用户信息
GET /users/{userId}       # 获取指定用户信息
PUT /users/profile        # 更新个人资料
PUT /users/{userId}       # 更新用户信息(管理员)
PUT /users/{userId}/role  # 更新用户角色
```

#### 消息管理 (`/messages/*`)
```bash
GET /messages             # 获取消息列表(分页)
GET /messages/{messageId} # 获取单条消息
POST /messages            # 发送消息
DELETE /messages/{messageId} # 删除消息
PUT /messages/{messageId}/recall # 撤回消息
GET /messages/search      # 搜索消息
```

#### 群组管理 (`/groups/*`)
```bash
GET /groups               # 获取用户群组列表
POST /groups              # 创建群组
GET /groups/{groupId}     # 获取群组详情
DELETE /groups/{groupId}  # 解散群组
GET /groups/{groupId}/members # 获取群成员
POST /groups/{groupId}/members # 加入群组
DELETE /groups/{groupId}/members/{userId} # 离开群组
DELETE /groups/{groupId}/members/{userId}/kick # 踢出成员
PUT /groups/{groupId}/members/{userId}/admin # 设置管理员
PUT /groups/{groupId}/owner # 转让群主
```

#### 文件管理 (`/files/*`)
```bash
POST /files/upload        # 上传文件
GET /files/{fileId}       # 下载文件
DELETE /files/{fileId}    # 删除文件
GET /files/{fileId}/thumbnail # 获取缩略图
```

#### 通话管理 (`/calls/*`)
```bash
POST /calls/initiate      # 发起通话
PUT /calls/{callId}/accept # 接受通话
PUT /calls/{callId}/reject # 拒绝通话
DELETE /calls/{callId}    # 结束通话
GET /calls/history        # 通话历史
```
### WebSocket实时通信

#### 连接管理
- **端点**: `/ws`
- **认证**: JWT Token参数传递
- **心跳**: 自动心跳检测连接状态

#### 消息格式
```json
{
  "type": "chat",
  "messageId": "msg_001",
  "senderId": "user_001",
  "receiverId": "user_002",
  "groupId": "group_001",
  "content": "消息内容",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

#### 状态同步
- **在线状态**: 用户上线/下线广播
- **输入状态**: 正在输入提示
- **阅读状态**: 消息已读确认

## 实现流程

### 用户认证流程

#### 注册流程
1. **前端验证**: 表单验证用户名、密码格式
2. **密码加密**: 前端使用bcrypt/hash库预加密
3. **API调用**: `POST /auth/register`
4. **后端处理**:
   - 验证用户名唯一性
   - 密码二次加密存储
   - 创建User实体并保存
   - 生成JWT Token返回
5. **状态更新**: 更新用户在线状态为ONLINE

#### 登录流程
1. **前端输入**: 用户名密码输入
2. **API调用**: `POST /auth/login`
3. **后端验证**:
   - 查询用户是否存在
   - 密码比对验证
   - 生成JWT Token
4. **返回数据**: Token + 用户信息
5. **WebSocket连接**: 使用Token建立实时连接

#### JWT认证机制
```java
// JwtService.java 核心实现
public String generateToken(String userId) {
    return Jwts.builder()
        .setSubject(userId)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
        .signWith(SignatureAlgorithm.HS512, SECRET_KEY)
        .compact();
}

public String extractUserId(String token) {
    return Jwts.parser()
        .setSigningKey(SECRET_KEY)
        .parseClaimsJws(token)
        .getBody()
        .getSubject();
}
```

### 消息发送流程

#### 私聊消息
1. **前端输入**: 用户输入消息内容
2. **消息组装**: 创建Message对象，设置类型和内容
3. **API调用**: `POST /messages`
4. **后端处理**:
   - 保存消息到数据库
   - 生成唯一messageId
   - 通过WebSocket推送给接收者
5. **状态同步**: 更新消息状态为SENT

#### 群聊消息
1. **消息组装**: 设置groupId，receiverId为null
2. **后端处理**:
   - 保存消息到数据库
   - 查询群成员列表
   - 遍历推送给所有在线成员
3. **性能优化**: 使用异步处理避免阻塞

#### WebSocket消息推送
```java
// TeleMsgWebSocketHandler.java
@Override
public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) {
    String userId = getUserIdFromSession(session);
    // 解析消息内容
    Message msg = parseMessage(message.getPayload());
    
    // 保存到数据库
    messageService.save(msg);
    
    // 推送给接收者
    if (msg.isPrivateMessage()) {
        sendToUser(msg.getReceiverId(), msg);
    } else {
        sendToGroup(msg.getGroupId(), msg);
    }
}
```

### 文件上传流程

#### 前端分片上传
1. **文件选择**: 用户选择文件
2. **分片处理**: 将大文件分割成小块
3. **并发上传**: 多个分片并行上传
4. **进度显示**: 实时显示上传进度

#### 后端处理
1. **接收分片**: 接收文件分片数据
2. **临时存储**: 保存到临时目录
3. **分片合并**: 所有分片上传完成后合并
4. **MinIO存储**: 上传到MinIO对象存储
5. **数据库记录**: 保存FileInfo元数据
6. **URL生成**: 返回可访问的文件URL

#### MinIO集成实现
```java
// MinIOService.java
public String uploadFile(MultipartFile file, String bucketName) {
    try {
        // 创建存储桶（如果不存在）
        if (!minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build())) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
        }
        
        // 生成唯一文件名
        String fileName = generateUniqueFileName(file.getOriginalFilename());
        
        // 上传文件
        minioClient.putObject(PutObjectArgs.builder()
            .bucket(bucketName)
            .object(fileName)
            .stream(file.getInputStream(), file.getSize(), -1)
            .contentType(file.getContentType())
            .build());
            
        return generatePresignedUrl(bucketName, fileName);
    } catch (Exception e) {
        throw new RuntimeException("文件上传失败", e);
    }
}
```

### 群组管理流程

#### 创建群组
1. **权限验证**: 检查用户是否有创建权限
2. **参数验证**: 验证群组名称、描述等
3. **创建实体**: 创建Group对象，设置ownerId
4. **数据库保存**: 保存群组信息
5. **初始成员**: 将创建者加入群组并设为管理员
6. **通知更新**: 广播群组创建事件

#### 成员管理
1. **权限检查**: 验证操作者权限
2. **状态更新**: 更新GroupMember表
3. **实时通知**: WebSocket推送成员变更
4. **缓存清理**: 清理相关缓存数据

### 实时通信架构

#### WebSocket连接管理
- **连接建立**: JWT Token验证身份
- **会话存储**: ConcurrentHashMap存储活跃连接
- **心跳检测**: 定期发送ping/pong消息
- **异常处理**: 连接断开时清理资源

#### 消息路由策略
- **私聊路由**: 直接查找接收者会话推送
- **群聊路由**: 查询群成员，批量推送消息
- **离线处理**: 存储离线消息，待上线时推送
- **消息确认**: 发送回执确认机制

#### 性能优化
- **异步处理**: 使用CompletableFuture异步处理
- **连接池**: WebSocket连接复用
- **消息队列**: 高并发场景使用消息队列
- **缓存策略**: Redis缓存热点数据

## 开发计划

### 已完成功能
- ✅ 基础IM系统 (基于MobileIMSDK)
- ✅ Spring Boot后端重构
- ✅ RESTful API完整实现
- ✅ 前端Electron应用框架
- ✅ 用户认证和权限系统
- ✅ 消息持久化和文件存储

### 进行中功能
- 🚧 WebRTC P2P语音通话集成
- 🚧 局域网优化方案 (15-20人天，2-3周)
- 🚧 音频质量优化和设备管理

### 未来规划
- 📋 视频通话支持
- 📋 群组语音通话 (SFU架构)
- 📋 会议功能
- 📋 AI降噪和实时转录

## 部署方式

### 开发环境
```bash
# 后端启动
cd TeleMsg-SpringBoot
./gradlew bootRun

# 前端启动
cd ui
npm run electron-dev
```

### 生产环境
- **Docker容器化**: 支持Docker Compose一键部署
- **数据库**: MySQL + MinIO对象存储
- **构建**: Gradle + Vite + Electron Builder
- **跨平台**: 支持Windows/macOS/Linux打包

## 关键特性

### 企业级特性
- **高性能**: 基于Netty的异步网络处理
- **可扩展**: 微服务架构设计
- **安全**: JWT认证 + 权限控制
- **监控**: Spring Boot Actuator健康检查
- **日志**: 完整的日志系统 (Log4j2)

### 用户体验
- **现代化UI**: React + TypeScript + Radix UI
- **响应式设计**: 支持多种屏幕尺寸
- **实时通信**: WebSocket双向通信
- **文件管理**: MinIO集成，支持缩略图生成
- **搜索功能**: 消息内容搜索

## 技术亮点

1. **多架构兼容**: 同时支持传统Java Swing客户端和现代化Electron应用
2. **协议扩展**: 从TCP协议扩展到WebSocket + REST API
3. **存储集成**: MinIO对象存储 + MySQL关系数据库
4. **WebRTC集成**: 正在实现P2P语音通话功能
5. **容器化部署**: 完整的Docker支持

## 项目状态

- **开发阶段**: 核心功能完成，WebRTC功能开发中
- **代码质量**: 使用现代Java 21 + Spring Boot 3.x
- **文档完善**: 详细的API文档和架构说明
- **测试覆盖**: 基础单元测试，集成测试待完善

## 总结

TeleMsg是一个功能完整、架构现代的企业级即时通讯系统，正在向支持实时语音通话的方向演进。通过集成WebRTC技术，将为用户提供完整的通讯解决方案，包括文本、文件和语音通话功能。项目采用前后端分离架构，支持多种客户端类型，具有良好的扩展性和维护性
