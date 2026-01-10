# 🎯 TeleMsg 快速调试指南

## 🚀 立即开始 (3种方式)

### 方式1: 交互式启动 (推荐新手)
```bash
# Windows
start-gradle.bat

# 然后选择选项1 (开发环境运行)
```

### 方式2: 直接Gradle命令 (推荐开发者)
```bash
# 安装Gradle后直接运行
gradle runDev                # 开发环境
gradle runDebug              # 调试模式 (端口5005)
gradle runQuick              # 快速启动

# 或者使用gradlew (如果配置了wrapper)
./gradlew runDev             # Linux/Mac
.\gradlew.bat runDev         # Windows
```

### 方式3: IDEA直接运行 (推荐IDE用户)
1. 打开IDEA，导入项目
2. 找到 `TeleMsgServerApplication.java`
3. 右键 → Run (开发模式)
4. 或右键 → Debug (调试模式)

## 🐛 IDEA调试配置详解

### 快速调试 (1分钟设置)

#### 步骤1: 启动调试服务器
```bash
# 在终端中运行
gradle runDebug
```

#### 步骤2: IDEA连接调试
1. **Run** → **Attach to Process...**
2. 选择 **localhost:5005**
3. 点击 **Attach**

#### 步骤3: 设置断点开始调试
- 在任何Java代码中设置断点
- 触发API调用，断点生效！

### 高级调试 (IDEA运行配置)

#### 创建Application配置:
1. **Run** → **Edit Configurations...**
2. **Add New** → **Application**
3. 配置��下:
   ```
   Name: TeleMsg Debug
   Main class: com.telemsg.server.TeleMsgServerApplication
   VM options: -Xmx1024m -XX:+UseG1GC -Dspring.profiles.active=dev
   Program arguments: (空)
   Working directory: E:\project\TeleMsg\TeleMsg-SpringBoot
   ```
4. **Apply** → **OK**
5. 直接点击 **Debug** 按钮运行

## 📊 开发调试流程

### 标准开发流程
```bash
1. 启动服务器:    gradle runDev
2. 验证服务:      curl http://localhost:8080/api/actuator/health
3. 测试注册:      gradle testApi (查看测试命令)
4. 查看日志:      观察控制台DEBUG输出
5. 访问数据库:    http://localhost:8080/h2-console
```

### API测试流程  
```bash
# 1. 启动服务器
gradle runDev

# 2. 用户注册
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456","email":"test@example.com"}'

# 3. 用户登录
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}'

# 4. 创建群组
curl -X POST http://localhost:8080/api/groups \
  -H "Content-Type: application/json" \
  -d '{"groupName":"测试群","description":"测试群组","ownerId":"返回的userId"}'
```

## 🔧 调试技巧和窍门

### 1. 日志调试
```bash
# 开发模式自动开启详细日志
gradle runDev

# 自定义日志级别
gradle runDev -Dlogging.level.com.telemsg.server=TRACE
```

### 2. 数据库调试
```bash
# H2控制台地址
http://localhost:8080/h2-console

# 连接信息  
URL: jdbc:h2:mem:testdb
用户名: sa
密码: (空)
```

### 3. 热重载调试
- 修改代码后，应用自动重启 (spring-boot-devtools)
- 无需手动重启服务器

### 4. 端口调试
```bash
# 查看端口占用
netstat -tulpn | grep :8080
netstat -tulpn | grep :8901

# 显示所有端口信息
gradle showPorts
```

### 5. 性能调试
```bash
# JVM调优参数已预配置
-Xmx1024m -XX:+UseG1GC

# 可通过JVisualVM连接监控
```

## 🎯 常见调试场景

### 场景1: 客户端连接调试
```java
// 在TeleMsgServerEventListener.java中设置断点
@Override
public void onUserLoginSucess(String userId, String extra, Channel session) {
    log.info("用户登录成功: userId={}", userId);  // <- 设置断点
}
```

### 场景2: 消息处理调试  
```java
// 在MessageService.java中设置断点
public Message sendPrivateMessage(...) {
    Message message = new Message();  // <- 设置断点
    // ...
}
```

### 场景3: 数据库操作调试
```java
// 在UserService.java中设置断点
public User registerUser(...) {
    User savedUser = userRepository.save(user);  // <- 设置断点
    return savedUser;
}
```

## ❗ 常见问题解决

### 问题1: 端口被占用
```bash
# 解决方案: 修改配置文件端口
# application-dev.properties
server.port=8081
telemsg.server.tcp.port=8902
```

### 问题2: Java版本不兼容
```bash
# 检查Java版本
java -version

# 需要Java 21+
```

### 问题3: Gradle命令不存在
```bash
# 安装Gradle
https://gradle.org/install/

# 或者使用IDE内置Gradle
```

### 问题4: 数据库连接失败
```bash
# 开发环境使用H2，无��额外配置
# 生产环境检查MySQL配置
```

## 💡 进阶调试技巧

1. **条件断点**: 在断点上右键设置条件
2. **表达式求值**: Debug时按Alt+F8计算表达式
3. **变量监视**: 添加变量到Watch窗口  
4. **步进调试**: F8逐行，F7进入方法
5. **回到调用点**: Ctrl+Alt+F8返回上级

## 🎉 调试成功标志

当你看到这些输出，说明调试环境搭建成功:

```
🚀 启动TeleMsg开发服务器...
📊 HTTP API: http://localhost:8080/api
🔌 TCP IM端口: 8901
💾 数据库: H2内存数据库 (http://localhost:8080/h2-console)
📝 日志级别: DEBUG
🐛 调试端口: 5005 (IDEA可直接附加)

TeleMsg Server Started Successfully!
```

现在您可以高效地进行TeleMsg开发和调试了！🚀
