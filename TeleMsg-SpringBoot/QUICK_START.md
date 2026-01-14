# TeleMsg SpringBoot Server - 快速测试指南

## 🚀 快速启动测试

### 方式一: 开发环境启动 (推荐用于测试)

```bash
# Windows用户
start.bat

# Linux/Mac用户
chmod +x start.sh
./start.sh
```

这将使用H2内存数据库启动服务，无需额外配置。

### 方式二: Docker启动 (推荐用于生产)

```bash
# 启动完整环境(MySQL + Redis + TeleMsg)
docker-compose up -d

# 查看日志
docker-compose logs -f telemsg-server
```

## 📋 API测试

服务启动后，可以通过以下API进行测试：

### 1. 用户注册测试

```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "123456",
    "email": "test@example.com",
    "phone": "13800138000"
  }'
```

预期响应:
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": "U1704876543001",
    "username": "testuser",
    "email": "test@example.com",
    "phone": "13800138000",
    "status": "OFFLINE"
  },
  "timestamp": 1704876543000
}
```

### 2. 用户登录测试

```bash
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "123456"
  }'
```

### 3. 创建群组测试

```bash
# 使用上面注册返回的userId
curl -X POST http://localhost:8080/api/groups \
  -H "Content-Type: application/json" \
  -d '{
    "groupName": "测试群组",
    "description": "这是一个测试群组",
    "ownerId": "U1704876543001"
  }'
```

### 4. 发送私聊消息测试

```bash
# 需要先注册两个用户
curl -X POST http://localhost:8080/api/messages/private \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "U1704876543001",
    "receiverId": "U1704876543002",
    "messageType": "text",
    "content": "你好，这是一条测试消息！"
  }'
```

### 5. 发送群聊消息测试

```bash
# 需要先创建群组并加入成员
curl -X POST http://localhost:8080/api/messages/group \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "U1704876543001",
    "groupId": "G1704876543001",
    "messageType": "text",
    "content": "大家好！这是群聊测试消息。"
  }'
```

## 🔌 IM客户端连接测试

### 原有客户端连接配置

修改原有Client项目中的 `IMClientManager.java`:

```java
// 设置服务器IP和端口
ConfigEntity.serverIP = "localhost";
ConfigEntity.serverTCPPort = 8901;

// 其他配置保持不变...
```

### 连接端口说明

- **HTTP API**: 8080 (REST接口)
- **TCP IM**: 8901 (原MobileIMSDK客户端连接)
- **WebSocket**: 3001 (Web客户端连接)
- **UDP**: 7901 (UDP协议连接)

## 📊 监控和管理

### 1. 应用健康检查

```bash
curl http://localhost:8080/api/actuator/health
```

### 2. 数据库管理 (开发环境)

- 访问: http://localhost:8080/h2-console
- 数据库URL: `jdbc:h2:mem:testdb`
- 用户名: `sa`
- 密码: (空)

### 3. Docker环境管理

```bash
# 查看所有容器状态
docker-compose ps

# 查看服务日志
docker-compose logs telemsg-server
docker-compose logs mysql
docker-compose logs redis

# 重启服务
docker-compose restart telemsg-server

# 停止所有服务
docker-compose down

# 重置环境 (清除数据)
docker-compose down -v
```

## 🔍 故障排查

### 常见问题

1. **端口冲突**
   ```bash
   # 检查端口占用
   netstat -tulpn | grep :8080
   netstat -tulpn | grep :8901
   ```

2. **数据库连接失败**
   - 检查MySQL是否启动
   - 验证数据库用户名密码
   - 确认数据库telemsg_db已创建

3. **原有客户端连接失败**
   - 确认TCP端口8901可访问
   - 检查防火墙设置
   - 验证客户端配置的服务器IP

### 日志查看

```bash
# 应用日志
tail -f logs/telemsg-server.log

# Docker环境日志
docker-compose logs -f telemsg-server
```

## ✅ 测试清单

### 基础功能测试

- [ ] 服务启动成功
- [ ] 用户注册功能
- [ ] 用户登录功能
- [ ] 群组创建功能
- [ ] 消息发送功能
- [ ] 消息持久化存储
- [ ] 原有客户端连接

### 高级功能测试

- [ ] 群组管理(加入/离开/踢人)
- [ ] 消息历史查询
- [ ] 离线消息���理
- [ ] QoS消息确认
- [ ] 用户在线状态管理

### 性能测试

- [ ] 并发用户连接
- [ ] 消息吞吐量
- [ ] 内存使用情况
- [ ] 数据库性能

## 🎯 下一步开发建议

1. **客户端集成**: 修改原有Client项目以适配新服务端
2. **认证增强**: 实现JWT token���证机制  
3. **文件上传**: 添加图片、文件上传功能
4. **推送通知**: 集成离线推送服务
5. **管理后台**: 开发Web管理界面
6. **集群部署**: 支持水平扩展

---

🎉 **恭喜！** 您已经成功构建了一个功能完整的生产级IM服务端！
