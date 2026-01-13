# TeleMsg 项目结构总结

## 📖 项目概述

TeleMsg 是一个基于 MobileIMSDK 的生产级多端即时通讯系统，包含 Java Swing 桌面客户端、现代化 Web 客户端以及基于 SpringBoot 3.2 的高性能服务端。该项目采用模块化设计，支持私聊、群聊、文件传输（MinIO存储）、音视频通话以及完整的消息持久化。

## 🛠️ 技术栈

### 后端技术 (Server)
- **Java**: JDK 21 (LTS)
- **Framework**: SpringBoot 3.2+
- **IM Core**: MobileIMSDK (基于 Netty 4.1.50)
- **Database**: MySQL 8.0 / H2 (开发环境)
- **ORM**: Spring Data JPA
- **Cache**: Redis (会话管理 & 缓存)
- **Storage**: **MinIO** (分布式对象存储，支持图片缩略图、自动分类)
- **Container**: Docker & Docker Compose

### 前端技术 (Web UI)
- **Framework**: React 18.3.1
- **Language**: TypeScript
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS 4.1.12 + Radix UI
- **Communication**: WebSocket

### 桌面端技术 (Java Client)
- **GUI**: Java Swing (BeautyEye L&F)
- **Network**: Netty / MobileIMSDK Client
- **Utils**: Gson, SwingWorker

## 📁 项目结构概览

```
TeleMsg/
├── 📁 Client/                       # Java Swing 桌面客户端
│   ├── 📄 Launch.java              # 启动入口
│   ├── 📁 lib/                     # UI库与SDK依赖
│   └── 📁 src/                     # 客户端业务源码
│       ├── 📁 net/x52im/         # IM相关实现
│       └── 📁 org/jb2011/        # 原项目自带的UI界面实现（已废弃）
│
├── 📁 Client_SDK/                  # 客户端 SDK 核心模块
│   ├── 📁 lib/                   # 依赖库
│   └── 📁 src/                     # 网络通信核心实现SDK源码
│
├── 📁 Server/                      # (旧) 传统服务端备份（已废弃）
│   ├── 📁 lib/                   # MobileIMSDK服务端库
│   ├── 📁 script/                # 启动脚本
│   │   ├── run.bat              # Windows启动脚本
│   │   └── run.sh               # Linux启动脚本
│   └── 📁 src/                   # 服务端源码
│
├── 📁 TeleMsg-SpringBoot/          # 🚀 [核心] 新版 SpringBoot 服务端
│   ├── 📄 build.gradle             # Gradle构建配置
│   ├── 📄 docker-compose.yml       # Docker编排 (App + MySQL + Redis + MinIO)
│   ├── 📄 Dockerfile               # 服务端镜像构建
│   ├── 📄 README.md                # 服务端详细文档
│   ├── 🚀 start.bat                # Windows 一键启动脚本
│   ├── 🚀 start.sh                 # Linux/Mac 一键启动脚本
│   ├── 📁 src/main/java/com/telemsg/server/
│   │   ├── 📄 TeleMsgServerApplication.java
│   │   ├── 📁 entity/              # JPA实体 (User, Group, Message)
│   │   ├── 📁 repository/          # DAO层 (Spring Data JPA)
│   │   ├── 📁 service/             # 业务逻辑 (User, Group, Msg Service)
│   │   ├── 📁 controller/          # REST API (HTTP接口)
│   │   ├── 📁 im/                  # IM核心 (MobileIMSDK集成, 监听器)
│   │   └── 📁 config/              # 配置类 (Security, MinIO, Swagger)
│   └── 📁 docker/                  # 容器化配置
│       ├── 📁 mysql/               # 初始化脚本 init.sql
│       └── 📁 nginx/               # 反向代理配置
│
└── 📁 ui/                          # 现代化 Web 客户端
    ├── 📄 package.json           # 依赖管理
    ├── 📄 vite.config.ts         # Vite配置
    ├── 📄 tsconfig.json          # TypeScript配置
    └── 📁 src/
        ├── 📁 components/          # React 组件
        ├── 📁 services/            # API 服务封装
        └── 📄 main.tsx             # 入口文件
```

## 🏗️ 服务端架构

服务端采用分层架构设计，确保高内聚低耦合：

```
┌─────────────────────────────────────────────────────────────┐
│                    TeleMsg SpringBoot 架构                   │
├─────────────────────────────────────────────────────────────┤
│  🌐 API层        │  📱 IM层 (MobileIMSDK) │  🗃️ 存储层       │
│  ┌─────────────┐  │  ┌──────────────────┐  │  ┌─────────────┐  │
│  │REST API     │  │  │• TCP Port: 8901  │  │  │MySQL / H2   │  │
│  │• 用户/群组   │  │  │• UDP Port: 7901  │  │  │• 业务数据    │  │
│  │• 历史消息    │  │  │• WebSocket      │  │  │• 消息持久化  │  │
│  │• 文件上传    │  │  │• QoS 质量保证    │  │  └─────────────┘  │
│  └─────────────┘  │  └──────────────────┘  │  ┌─────────────┐  │
│                   │                        │  │MinIO        │  │
│  🏗️ 业务层        │  🔌 会话层             │  │• 文件/图片   │  │
│  ┌─────────────┐  │  ┌──────────────────┐  │  └─────────────┘  │
│  │UserService  │  │  │SessionManager    │  │  ┌─────────────┐  │
│  │GroupService │  │  │• 在线状态管理     │  │  │Redis Cache  │  │
│  │MsgService   │  │  │• 心跳保活机制     │  │  │• 会话缓存    │  │
│  └─────────────┘  │  └──────────────────┘  │  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🌟 核心功能模块

### 1. 用户与会话管理 👤
- **完整账户体系**: 注册、登录、个人信息管理。
- **混合认证**: 支持 JWT 令牌认证与 IM 协议认证。
- **状态管理**: 实时在线/离线状态检测，基于 Redis 的会话缓存。

### 2. 消息系统 (IM) 💬
- **多协议支持**: 同时支持 TCP (8901), UDP (7901) 和 WebSocket。
- **QoS 机制**: 消息送达保证，防止丢包。
- **完全持久化**: 所有私聊、群聊消息写入 MySQL，支持历史记录查询。
- **离线消息**: 用户上线后自动推送离线期间的消息。

### 3. 群组功能 👥 (New)
- **全生命周期**: 创建群组、加入/退出群组、解散群组。
- **成员管理**: 群主权限、成员列表管理。
- **群消息广播**: 高效的群消息分发机制。

### 4. MinIO 对象存储 🗃️ (New)
- **多媒体支持**: 图片、视频、文档、音频等。
- **自动处理**: 图片上传自动生成 200x200 缩略图。
- **智能存储**: 按日期自动归档 (`yyyy/MM/dd`)。
- **安全访问**: 使用预签名 URL 进行文件分享。

### 5. 现代化 Web 端 💻
- **响应式 UI**: 基于 Tailwind CSS，适配桌面与移动端。
- **实时交互**: 集成 WebSocket，实现 Web 端即时通讯。
- **音视频通话**: (WebRTC) 支持点对点音视频连接。

## 🔌 API 与 端口配置

### 服务端口
| 服务 | 端口 | 说明 |
| :--- | :--- | :--- |
| **REST API** | 8080 | HTTP 业务接口 / WebSocket 握手 |
| **IM TCP** | 8901 | 桌面端/移动端长连接 |
| **IM UDP** | 7901 | 辅助通信/UDP 模式 |
| **MinIO API** | 9000 | 对象存储 API |
| **MinIO Console**| 9001 | 对象存储管理后台 |
| **Redis** | 6379 | 缓存服务 |
| **MySQL** | 3306 | 数据库服务 |

### 核心 API 示例
- `POST /api/users/login` - 用户登录
- `POST /api/files/upload` - 文件上传 (返回 MinIO URL)
- `POST /api/groups` - 创建群组
- `GET /api/messages/history` - 获取历史消息

## 🚀 快速启动

### 1. 服务端 (Docker 方式 - 推荐)
```bash
cd TeleMsg-SpringBoot
docker-compose up -d
# 服务将启动在 localhost:8080，MinIO 控制台在 localhost:9001
```

### 2. 服务端 (开发模式)
```bash
# Windows
cd TeleMsg-SpringBoot
start.bat

# Linux/Mac
cd TeleMsg-SpringBoot
chmod +x start.sh && ./start.sh
```

### 3. 客户端启动
- **Web 端**: `cd ui && npm run dev` (访问 http://localhost:5173)
- **Java 端**: 修改配置指向 `localhost:8901`，运行 `Client/Launch.java`。

## 🎉 总结
TeleMsg 现已升级为一个具备**完整后端存储**、**文件服务**和**多端适配**的生产级 IM 系统。相比于旧版 Demo，新版 SpringBoot 服务端提供了真正的业务承载能力和数据安全性。