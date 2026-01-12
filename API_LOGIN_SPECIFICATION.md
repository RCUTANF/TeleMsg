# TeleMsg 服务端 API 文档

## 服务端登录接口详细说明

### 基本信息

- **服务器地址**: `http://localhost:8080`
- **API基础路径**: `/api`
- **认证方式**: JWT Token
- **数据格式**: JSON

### 登录接口规范

#### 1. 用户登录

**接口地址**: `POST http://localhost:8080/api/auth/login`

**请求头**:
```http
Content-Type: application/json
Accept: application/json
```

**请求体格式** (JSON):
```json
{
  "username": "用户名字符串",
  "password": "密码字符串"
}
```

**字段说明**:
- `username`: 必填，字符串类型，不能为空
- `password`: 必填，字符串类型，不能为空

**成功响应** (HTTP 200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "用户唯一标识",
    "name": "用户显示名称",
    "username": "用户名",
    "avatar": "头像URL（可为空字符串）",
    "role": "user"
  }
}
```

**失败响应** (HTTP 400):
```json
{
  "error": "用户名或密码错误"
}
```

#### 2. 完整的请求示例

**使用 curl 命令**:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "username": "testuser",
    "password": "123456"
  }'
```

**使用 JavaScript Fetch**:
```javascript
const loginData = {
  username: "testuser",
  password: "123456"
};

fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify(loginData)
})
.then(response => response.json())
.then(data => {
  if (data.token) {
    console.log('登录成功:', data);
    localStorage.setItem('auth_token', data.token);
  } else {
    console.error('登录失败:', data.error);
  }
});
```

**使用 Java (客户端)**:
```java
// 使用 Java 的 HTTP 客户端
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;

String loginUrl = "http://localhost:8080/api/auth/login";
String jsonBody = "{\"username\":\"testuser\",\"password\":\"123456\"}";

HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create(loginUrl))
    .header("Content-Type", "application/json")
    .header("Accept", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
    .build();

HttpResponse<String> response = client.send(request, 
    HttpResponse.BodyHandlers.ofString());

System.out.println("Response: " + response.body());
```

#### 3. 验证规则

**服务端验证**:
- 用户名和密码字段不能为空（使用 `@NotBlank` 注解）
- 用户名需要在数据库中存在
- 密码使用 BCrypt 加密验证

**客户端建议**:
- 发送请求前验证用户名和密码不为空
- 处理网络异常和超时
- 正确存储返回的 JWT Token

#### 4. 错误处理

**常见错误情况**:

1. **字段验证失败** (HTTP 400):
```json
{
  "error": "用户名不能为空"
}
```

2. **用户不存在或密码错误** (HTTP 400):
```json
{
  "error": "用户名或密码错误"
}
```

3. **服务器内部错误** (HTTP 400):
```json
{
  "error": "登录失败: 具体错误信息"
}
```

#### 5. 后续请求认证

登录成功后，其他API请求需要携带 JWT Token：

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 其他相关接口

#### 用户注册

**接口地址**: `POST http://localhost:8080/api/auth/register`

**请求体**:
```json
{
  "name": "显示名称",
  "username": "用户名",
  "password": "密码"
}
```

#### 用户登出

**接口地址**: `POST http://localhost:8080/api/auth/logout`

**请求头**:
```http
Authorization: Bearer {JWT令牌}
```

### 服务端架构信息

- **框架**: Spring Boot 3.2+
- **安全**: Spring Security + JWT
- **数据库**: MySQL 8.0+ (默认端口 3306)
- **密码加密**: BCrypt
- **CORS**: 已配置允许跨域请求
- **文件上传**: 支持，最大 10MB

### 开发环境启动

```bash
# 启动 MySQL 和 Redis
docker-compose up mysql redis -d

# 启动 SpringBoot 服务
cd TeleMsg-SpringBoot
./gradlew bootRun

# 服务启动后访问地址
# API: http://localhost:8080/api
# H2控制台: http://localhost:8080/h2-console (开发环境)
```
