# TeleMsg SpringBoot Server

基于SpringBoot构建的生产级即时通讯服务端，集成MobileIMSDK框架，支持群聊和消息持久化存储。

## 🚀 项目特性

### ✅ 核心功能
- **用户管理**: 用户注册、登录、信息管理
- **群组功能**: 创建群组、加入/离开、权限管理、成员管理
- **消息系统**: 私聊、群聊、消息持久化、离线消息
- **实时通信**: 基于MobileIMSDK的高性能网络框架
- **多协议支持**: UDP、TCP��WebSocket同时支持

### ✅ 技术特性
- **SpringBoot 3.2**: 现代化的Java Web框架
- **Spring Data JPA**: 数据持久化和ORM
- **MySQL/H2**: 生产和开发数据库支持
- **Redis**: 缓存和会话管理
- **Netty**: 高性能网络通信
- **JWT**: 安全认证（可扩展）

### ✅ 企业级特性
- **消息持久化**: 完整的消息历史记录
- **QoS保证**: 消息可靠传输机制
- **会话管理**: 用户在线状态管理
- **RESTful API**: 完整的HTTP接口
- **监控和日志**: 生产级别的监控支持

## 📦 项目结构

```
TeleMsg-SpringBoot/
├── src/main/java/com/telemsg/server/
│   ├── TeleMsgServerApplication.java     # 启动类
│   ├── entity/                          # 实体类
│   │   ├── User.java                   # 用户实体
│   │   ├── Group.java                  # 群组实体
│   │   ├── GroupMember.java            # 群成员实体
│   │   └── Message.java                # 消息实体
│   ├── repository/                      # 数据访问层
│   │   ├── UserRepository.java
│   │   ├── GroupRepository.java
│   │   ├── GroupMemberRepository.java
│   │   └── MessageRepository.java
│   ├── service/                         # 业务逻辑层
│   │   ├── UserService.java
│   │   ├── GroupService.java
│   │   └── MessageService.java
│   ├── controller/                      # REST API控制器
│   │   ├── UserController.java
│   │   ├── GroupController.java
│   │   ├── MessageController.java
│   │   └── ApiResponse.java
│   ├── im/                             # IM集成层
│   │   ├── TeleMsgServerLauncher.java  # IM服务启动器
│   │   ├── TeleMsgServerEventListener.java # 事件监听器
│   │   ├── IMSessionManager.java       # 会话管理器
│   │   └── TeleMsgQoSEventListener.java
│   └── config/                         # 配置类
│       └── SecurityConfig.java
├── src/main/resources/
│   └── application.properties          # 配置文件
├── build.gradle                        # Gradle构建配置
└── README.md                          # 项目文档
```

## 🛠️ 快速开始

### 1. 环境要求

- **Java**: JDK 21+
- **MySQL**: 8.0+ (生产环境)
- **Redis**: 6.0+ (可选，用于缓存)
- **Gradle**: 8.0+

### 2. 数据库配置

#### 开发环境 (H2数据库)
```properties
# 使用内存H2数据库，无需额外配置
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.username=sa
spring.datasource.password=password
spring.h2.console.enabled=true
```

#### 生产环境 (MySQL)
```properties
# 修改 application.properties 中的数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/telemsg_db?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=GMT%2B8
spring.datasource.username=your_username
spring.datasource.password=your_password
```

创建数据库：
```sql
CREATE DATABASE telemsg_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 构建和运行

#### 使用Docker Compose (推荐生产环境)
```bash
# 启动完整服务 (包含MySQL, Redis, MinIO)
docker-compose up -d

# 仅启动应用
./gradlew bootRun
```

#### Windows原生开发环境 (推荐开发环境)
```batch
# 1. 安装MinIO (仅需运行一次)
scripts\install-minio.bat

# 2. 启动开发环境 (MinIO + TeleMsg)
scripts\start-dev-environment.bat

# 3. 或者分别启动
scripts\start-minio.bat       # 启动MinIO
gradlew.bat bootRun          # 启动TeleMsg应用
```

#### 手动构建运行
```bash
# 克隆项目
cd TeleMsg-SpringBoot

# 构建项目
./gradlew build

# 运行服务
./gradlew bootRun

# 或使用自定义任务
./gradlew runServer
```

> **💡 开发提示**: Windows用户推荐使用原生MinIO方案，无需Docker环境，启动更快。详见 [MINIO_WINDOWS_SETUP.md](./MINIO_WINDOWS_SETUP.md)

### 4. 验证运行

服务启动后，你应该看到类似的输出：
```
████████╗███████╗██╗     ███████╗███╗   ███╗███████╗ ██████╗ 
╚══██╔══╝██╔════╝██║     ██╔════╝████╗ ████║██╔════╝██╔════╝ 
   ██║   █████╗  ██║     █████╗  ██╔████╔██║███████╗██║  ███╗
   ██║   ██╔══╝  ██║     ██╔══╝  ██║╚██╔╝██║╚════██║██║   ██║
   ██║   ███████╗███████╗███████╗██║ ╚═╝ ██║███████║╚██████╔╝
   ╚═╝   ╚══════╝╚══════╝╚══════╝╚═╝     ╚═╝╚══════╝ ╚═════╝ 

TeleMsg Server Started Successfully!
Production-ready IM server with group chat and message persistence.

TeleMsg服务端启动成功!
TCP端口: 8901
WebSocket端口: 3000
UDP端口: 7901
```

## 🔧 API接口文档

### 用户管理 API

#### 用户注册
```bash
POST /api/users/register
Content-Type: application/json

{
    "username": "testuser",
    "password": "123456",
    "email": "test@example.com",
    "phone": "13800138000"
}
```

#### 用户登录
```bash
POST /api/users/login
Content-Type: application/json

{
    "username": "testuser",
    "password": "123456"
}
```

#### 获取用户信息
```bash
GET /api/users/{userId}
```

### 群组管理 API

#### 创建群组
```bash
POST /api/groups
Content-Type: application/json

{
    "groupName": "测试群组",
    "description": "这是一个测试群组",
    "ownerId": "U1704876543001"
}
```

#### 加入群组
```bash
POST /api/groups/{groupId}/members
Content-Type: application/json

{
    "userId": "U1704876543002",
    "nickname": "群内���称"
}
```

#### 获取群成员
```bash
GET /api/groups/{groupId}/members
```

### 消息管理 API

#### 发送私聊消息
```bash
POST /api/messages/private
Content-Type: application/json

{
    "senderId": "U1704876543001",
    "receiverId": "U1704876543002",
    "messageType": "text",
    "content": "你好，这是一条测试消息"
}
```

#### 发送群聊消息
```bash
POST /api/messages/group
Content-Type: application/json

{
    "senderId": "U1704876543001",
    "groupId": "G1704876543001",
    "messageType": "text",
    "content": "大家好！"
}
```

#### 获取聊天记录
```bash
# 私聊记录
GET /api/messages/private?user1=U1704876543001&user2=U1704876543002&page=0&size=20

# 群聊记录
GET /api/messages/group/{groupId}?page=0&size=20
```

## 🔌 客户端连接

TeleMsg服务端兼容原有的MobileIMSDK客户端，连接参数：

- **TCP端口**: 8901
- **WebSocket端口**: 3001
- **UDP端口**: 7901
- **服务器地址**: localhost (开发环境)

客户端连接示例（以原有Client为例）：
```java
// 在IMClientManager中配置服务器地址
ConfigEntity.serverIP = "localhost";  // 或服务器IP
ConfigEntity.serverTCPPort = 8901;
```

## 📊 监控和管理

### 应用监控
访问 `http://localhost:8080/api/actuator/health` 查看应用健康状态

### 数据库管理 (开发环境)
- H2控制台: `http://localhost:8080/h2-console`
- 数据库URL: `jdbc:h2:mem:testdb`
- 用户名: `sa`
- 密码: (空)

## 🔐 安全配置

当前版本为了简化开发，暂时关闭了认证机制。生产环境建议：

1. 启用JWT认证
2. 配置HTTPS/SSL
3. 设置适当的CORS策略
4. 配置防火墙规则

## 🚀 生产部署

### Docker部署 (推荐)
```bash
# 构建镜像
docker build -t telemsg-server .

# 运行容器
docker run -d \
  --name telemsg-server \
  -p 8080:8080 \
  -p 8901:8901 \
  -p 3001:3001 \
  -p 7901:7901/udp \
  -e MYSQL_URL=jdbc:mysql://mysql:3306/telemsg_db \
  -e MYSQL_USERNAME=root \
  -e MYSQL_PASSWORD=password \
  telemsg-server
```

### JAR包部署
```bash
# 构建JAR包
./gradlew bootJar

# 运行
java -jar build/libs/telemsg-server.jar \
  --spring.datasource.url=jdbc:mysql://localhost:3306/telemsg_db \
  --spring.datasource.username=root \
  --spring.datasource.password=password
```

## 🤝 贡献指南

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 技术支持

- 项目Issues: [GitHub Issues](https://github.com/your-repo/TeleMsg-SpringBoot/issues)
- 技术讨论: 创建Discussion
- 邮件联系: telemsg@example.com

## 🔮 路线图

- [ ] JWT认证集成
- [ ] 文件上传/下载功能
- [ ] 消息加密
- [ ] 集群部署支持
- [ ] WebRTC音视频通话
- [ ] 消息推送服务
- [ ] 管理后台界面

---

**TeleMsg SpringBoot Server** - 让即时通讯更简单！
