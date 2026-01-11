# TeleMsg 项目结构总结

## 项目概述

TeleMsg 是一个基于 MobileIMSDK 的多端即时通讯系统，包含 Java Swing 客户端、现代化 Web 客户端以及 SpringBoot 服务端。该项目采用模块化设计，支持文本消息、文件传输、音视频通话等核心 IM 功能。

## 技术栈

### 后端技术
- **Java**: JDK 21
- **Netty**: 4.1.50 高性能网络框架
- **SpringBoot**: 3.2+ 现代化服务端框架
- **MobileIMSDK**: 核心 IM 通信框架
- **MySQL/H2**: 数据持久化
- **Redis**: 缓存和会话管理
- **Gson**: JSON 处理
- **Log4j**: 日志系统

### 前端技术 (Web UI)
- **React**: 18.3.1
- **TypeScript**: 类型安全
- **Vite**: 6.3.5 构建工具
- **Tailwind CSS**: 4.1.12 样式框架
- **Radix UI**: 现代化 UI 组件库
- **Material-UI**: 设计系统
- **WebSocket**: 实时通信

## 项目结构

```
TeleMsg/
├── 📁 Client/                      # Java Swing 客户端
│   ├── 📄 Launch.java             # 客户端启动入口
│   ├── 📁 lib/                    # 第三方库
│   │   ├── beautyeye_lnf.jar     # UI美化库
│   │   ├── EPC_*.jar             # 自定义UI组件
│   │   └── MobileIMSDK*.jar      # IM SDK核心
│   └── 📁 src/                    # 源代码
│       ├── 📁 net/x52im/         # IM相关实现
│       └── 📁 org/jb2011/        # UI界面实现
│
├── 📁 Client_SDK/                 # 客户端SDK模块
│   ├── 📁 lib/                   # 依赖库
│   │   ├── gson-2.8.6.jar       # JSON处理
│   │   ├── netty-all-4.1.50.Final.jar  # 网络框架
│   │   └── swing-worker-*.jar    # Swing异步处理
│   └── 📁 src/                   # SDK源码
│
├── 📁 Server/                     # 传统服务端
│   ├── 📁 lib/                   # MobileIMSDK服务端库
│   ├── 📁 script/                # 启动脚本
│   │   ├── run.bat              # Windows启动脚本
│   │   └── run.sh               # Linux启动脚本
│   └── 📁 src/                   # 服务端源码
│
├── 📁 Server_SDK/                 # 服务端SDK模块
│   ├── 📁 libs/                  # RabbitMQ等扩展库
│   └── 📁 src/                   # SDK源码
│
├── 📁 TeleMsg-SpringBoot/         # 现代化SpringBoot服务端
│   ├── 📄 README.md             # 详细文档
│   ├── 📄 docker-compose.yml    # Docker编排
│   ├── 📄 Dockerfile            # 容器化配置
│   ├── 📁 src/main/java/        # Java源码
│   │   └── com/telemsg/server/  # 主包
│   │       ├── 📁 entity/       # 数据实体层
│   │       ├── 📁 repository/   # 数据访问层
│   │       ├── 📁 service/      # 业务逻辑层
│   │       └── 📁 controller/   # REST API层
│   └── 📁 docker/               # Docker配置
│       ├── 📁 mysql/            # MySQL配置
│       └── 📁 nginx/            # Nginx代理配置
│
└── 📁 ui/                         # 现代化Web客户端
    ├── 📄 package.json           # 依赖管理
    ├── 📄 vite.config.ts         # Vite配置
    ├── 📄 tsconfig.json          # TypeScript配置
    └── 📁 src/                    # 前端源码
        ├── 📄 main.tsx            # 应用入口
        ├── 📁 app/                # 应用核心
        │   ├── 📄 App.tsx         # 主应用组件
        │   ├── 📁 components/     # React组件
        │   │   ├── AdminPanel.tsx      # 管理员面板
        │   │   ├── ChatArea.tsx        # 聊天区域
        │   │   ├── ContactList.tsx     # 联系人列表
        │   │   ├── LoginPage.tsx       # 登录页面
        │   │   ├── VideoCallDialog.tsx # 视频通话
        │   │   └── 📁 ui/             # 基础UI组件
        │   └── 📁 services/       # 服务层
        │       └── api.ts         # API服务封装
        └── 📁 styles/             # 样式文件
```

## 核心功能模块

### 1. 用户管理 👤
- **认证系统**: 用户注册、登录、JWT令牌管理
- **个人资料**: 头像、昵称、用户名管理
- **权限管理**: 普通用户、管理员角色区分

### 2. 即时通讯 💬
- **实时消息**: WebSocket + MobileIMSDK双重保障
- **消息类型**: 文本、图片、文件、表情
- **消息状态**: 发送中、已发送、已读状态跟踪
- **离线消息**: 消息持久化和离线推送

### 3. 联系人系统 📞
- **好友管理**: 添加、删除、搜索联系人
- **在线状态**: 实时显示用户在线状态
- **最近联系**: 智能排序最近聊天对象

### 4. 文件传输 📁
- **多格式支持**: 图片、文档、音视频文件
- **断点续传**: 大文件传输优化
- **文件预览**: 图片和文档在线预览

### 5. 音视频通话 📹
- **语音通话**: 高质量音频通信
- **视频通话**: 实时视频传输
- **通话控制**: 接听、挂断、静音等操作

### 6. 管理功能 ⚙️
- **用户管理**: 用户列表、权限管理、封禁操作
- **系统监控**: 在线用户数、消息统计、存储使用情况
- **日志管理**: 详细的操作日志和错误追踪

## API 服务架构

### HTTP REST API

#### 认证相关 API

**用户登录**
- **接口路径**: `POST /api/auth/login`
- **Content-Type**: `application/json`
- **请求格式**:
```json
{
  "username": "用户名",
  "password": "密码"
}
```
- **成功响应格式**:
```json
{
  "token": "JWT令牌",
  "user": {
    "id": "用户ID",
    "name": "用户昵称", 
    "username": "用户名",
    "avatar": "头像URL",
    "role": "user"
  }
}
```
- **错误响应格式**:
```json
{
  "error": "用户名或密码错误"
}
```

**用户注册**
- **接口路径**: `POST /api/auth/register`
- **Content-Type**: `application/json`
- **请求格式**:
```json
{
  "name": "显示名称",
  "username": "用户名", 
  "password": "密码"
}
```

**用户登出**
- **接口路径**: `POST /api/auth/logout`
- **请求头**: `Authorization: Bearer {JWT令牌}`

#### 其他核心 API

```typescript
// 用户管理
GET  /api/users/me            # 获取当前用户信息
PUT  /api/users/profile       # 更新用户资料

// 联系人管理  
GET  /api/contacts            # 获取联系人列表
POST /api/contacts            # 添加联系人
DELETE /api/contacts/:id      # 删除联系人

// 消息相关
GET  /api/messages/:contactId # 获取聊天记录
POST /api/messages            # 发送消息
PUT  /api/messages/:id/read   # 标记消息已读

// 文件上传
POST /api/files/upload        # 文件上传

// 音视频通话
POST /api/calls/initiate      # 发起通话
POST /api/calls/answer        # 接听通话
POST /api/calls/end           # 结束通话
```

#### 服务端配置信息

- **服务端口**: 8080
- **API基础路径**: `/api`
- **完整登录URL**: `http://localhost:8080/api/auth/login`
- **JWT过期时间**: 24小时 (86400000ms)
- **文件上传限制**: 10MB
- **跨域配置**: 已禁用CSRF，允许所有认证相关端点

### WebSocket 实时通信
```typescript
// WebSocket连接格式
wss://domain/api/ws?token=${jwt_token}&userId=${user_id}

// 消息格式
{
  type: 'message' | 'call' | 'status' | 'notification',
  data: { /* 具体数据 */ },
  timestamp: Date
}
```

## 部署架构

### 开发环境
```yaml
# docker-compose.yml 配置
services:
  app:        # SpringBoot应用
  mysql:      # 数据库
  redis:      # 缓存
  nginx:      # 反向代理
```

### 构建脚本
- **Java模块**: `./gradlew build` - Gradle统一构建
- **Web客户端**: `npm run build` - Vite构建生产版本
- **Docker**: `docker-compose up -d` - 一键启动所有服务

## 技术特性

### 🚀 性能优化
- **Netty**: 高性能异步网络处理
- **连接池**: 数据库连接复用
- **缓存策略**: Redis缓存热点数据
- **懒加载**: 按需加载聊天记录

### 🔒 安全特性
- **JWT认证**: 无状态Token认证
- **HTTPS**: 传输层安全加密
- **输入验证**: 防止XSS和SQL注入
- **权限控制**: 基于角色的访问控制

### 📱 跨平台支持
- **Java客户端**: Windows、Linux、macOS
- **Web客户端**: 现代浏览器全支持
- **移动端**: 响应式设计适配移动设备

### 🔧 可扩展性
- **微服务架构**: 模块化设计便于扩展
- **插件系统**: 支持第三方功能集成
- **多协议**: TCP、UDP、WebSocket并存
- **消息队列**: RabbitMQ支持高并发消息处理

## 快速开始

### 1. 环境准备
```bash
# Java环境
Java 21+
MySQL 8.0+
Redis 6.0+

# Node.js环境 (Web客户端)
Node.js 18+
npm/pnpm
```

### 2. 项目启动
```bash
# 启动数据库服务
docker-compose up mysql redis -d

# 构建并启动SpringBoot服务端
cd TeleMsg-SpringBoot
./gradlew bootRun

# 启动Web客户端
cd ui
npm install
npm run dev

# 构建Java客户端
./gradlew :Client:build
# 运行Java客户端
java -jar Client/build/libs/Client.jar
```

### 3. 访问应用
- **Web客户端**: http://localhost:5173
- **API文档**: http://localhost:8080/swagger-ui.html
- **管理后台**: Web客户端管理员账号登录

## 项目亮点

1. **多客户端支持**: 同时提供传统Java桌面客户端和现代化Web客户端
2. **现代化技术栈**: 采用最新的React、SpringBoot、Java 21等技术
3. **完整的IM功能**: 涵盖文本、语音、视频、文件等全功能通信
4. **企业级架构**: 支持集群部署、负载均衡、监控告警
5. **开发友好**: 完善的文档、规范的代码结构、便捷的构建脚本

该项目是一个功能完整、技术先进的即时通讯解决方案，适合用于企业内部沟通、在线客服、社交应用等多种场景。
