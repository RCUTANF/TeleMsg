# TeleMsg Gradle 快速入门指南

## 🚀 推荐的开发测试流程

### 1. 快速开始 - 开发环境 (推荐)
```bash
# 开发环境运行，使用H2内存数据库，DEBUG日志
./gradlew runDev

# 带调试端口的开发环境 (IDEA可以Attach调试)
./gradlew runDev -Pdebug
```

### 2. 调试模式 - 最佳调试体验
```bash
# 专门的调试模式，自动启用调试端口5005
./gradlew runDebug
```
**IDEA调试步骤：**
1. 运行上面的命令
2. IDEA中：Run → Attach to Process
3. 选择localhost:5005
4. 设置断点，开始调试！

### 3. 快速测试 - 最小日志输出
```bash
# 快速启动，最少日志，适合快速验证功能
./gradlew runQuick
```

### 4. 生产环境测试
```bash
# 生产模式，需要MySQL数据库
./gradlew runProd
```

## 🧪 API测试流程

### 步骤1: 启动服务器
```bash
./gradlew runDev
```

### 步骤2: 查看测试命令
```bash
# 显示完整的API测试命令
./gradlew testApi
```

### 步骤3: 执行API测试
```bash
# 健康检查
curl http://localhost:8080/api/actuator/health

# 用户注册
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456","email":"test@example.com"}'

# 用户登录  
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

## 🔧 工具命令

```bash
# 显示所有端口信息
./gradlew showPorts

# 清理H2数据库数据
./gradlew cleanData

# 查看所有可用命令
./gradlew helpTeleMsg

# 运行单元测试
./gradlew test

# 构建项目
./gradlew build
```

## 🐛 IDEA调试配置

### 方法1: 使用Gradle调试任务 (推荐)
1. 运行：`./gradlew runDebug`
2. IDEA：Run → Attach to Process → localhost:5005

### 方法2: 手动配置调试参数
1. 运行：`./gradlew runDev -Pdebug`  
2. IDEA：Run → Attach to Process → localhost:5005

### 方法3: IDEA直接运行配置
在IDEA中创建Application配置：
- Main class: `com.telemsg.server.TeleMsgServerApplication`
- VM options: `-Xmx1024m -XX:+UseG1GC`
- Program arguments: `--spring.profiles.active=dev`
- Working directory: `E:\project\TeleMsg\TeleMsg-SpringBoot`

## 📊 开发环境信息

当运行 `./gradlew runDev` 后，你可以访问：

- **API接口**: http://localhost:8080/api
- **健康检查**: http://localhost:8080/api/actuator/health  
- **H2数据库控制台**: http://localhost:8080/h2-console
  - URL: `jdbc:h2:mem:testdb`
  - 用户名: `sa`
  - 密码: (空)
- **TCP IM端口**: 8901 (客户端连接)
- **WebSocket端口**: 3000
- **调试端口**: 5005 (runDebug时)

## 💡 开发技巧

1. **热重载**: 使用`spring-boot-devtools`，修改代码后自动重启
2. **日志调试**: 开发模式自动开启DEBUG日志
3. **数据库**: H2内存数据库，重启后数据清空，适合开发测试
4. **端口检查**: 运行前确保8080、8901等端口未被占用

## 🆚 不同启动方式对比

| 启动方式 | 数据库 | 日志级别 | 调试端口 | 用途 |
|---------|--------|----------|----------|------|
| `runDev` | H2内存 | DEBUG | - | 日常开发 |
| `runDev -Pdebug` | H2内存 | DEBUG | 5005 | 开发+调试 |
| `runDebug` | H2内存 | DEBUG | 5005 | 专门调试 |
| `runQuick` | H2内存 | WARN | - | 快速验证 |
| `runProd` | MySQL | INFO | - | 生产测试 |

现在您可以直接通过Gradle进行更方便的开发和调试了！🎉
