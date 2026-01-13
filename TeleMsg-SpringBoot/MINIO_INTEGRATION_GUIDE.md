# TeleMsg MinIO 集成指南

## 概述

TeleMsg现已成功集成MinIO对象存储服务，用于处理图片、文件等媒体消息的存储和管理。MinIO提供了分布式、高可用的对象存储能力，支持亚马逊S3兼容的API。

## 🚀 快速开始

### 方式1: 使用Docker Compose启动（推荐用于生产）

```bash
# 启动包含MinIO的完整服务
docker-compose up -d

# 查看服务状态
docker-compose ps
```

### 方式2: Windows原生安装（推荐用于开发）

如果您在Windows环境下开发，可以使用原生MinIO安装：

```batch
# 运行自动安装脚本
scripts\install-minio.bat

# 启动开发环境（MinIO + TeleMsg应用）
scripts\start-dev-environment.bat

# 或者使用MinIO管理工具
scripts\minio-tools.bat
```

详细的Windows安装指南请参考：[MINIO_WINDOWS_SETUP.md](./MINIO_WINDOWS_SETUP.md)

### 服务访问地址

### 服务访问地址

启动后可访问：
- **MinIO Console**: http://localhost:9001 (管理界面)
- **MinIO API**: http://localhost:9000 (存储API)
- **TeleMsg API**: http://localhost:8080/api (应用API)

默认登录凭据：
- 用户名：`minioadmin`  
- 密码：`minioadmin123`

### 2. 开发环境配置（通用）

在 `application-dev.properties` 中配置：
```properties
# MinIO配置 - 开发环境
minio.url=http://localhost:9000
minio.access-key=minioadmin
minio.secret-key=minioadmin123
minio.bucket-name=telemsg-files
minio.region=us-east-1

# 文件上传限制
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
```

### 3. 生产环境配置

在 `application-prod.properties` 中配置：
```properties
# MinIO配置 - 生产环境
minio.url=${MINIO_URL:http://minio:9000}
minio.access-key=${MINIO_ACCESS_KEY:minioadmin}
minio.secret-key=${MINIO_SECRET_KEY:minioadmin123}
minio.bucket-name=${MINIO_BUCKET_NAME:telemsg-files}
minio.region=${MINIO_REGION:us-east-1}
```

## 📁 功能特性

### 支持的文件类型

#### 图片类型
- JPEG (.jpg, .jpeg)
- PNG (.png)  
- GIF (.gif)
- BMP (.bmp)
- WebP (.webp)

#### 文档类型  
- PDF (.pdf)
- Word文档 (.doc, .docx)
- Excel表格 (.xls, .xlsx)
- 文本文件 (.txt)
- CSV文件 (.csv)

### 自动功能
- ✅ **自动缩略图生成** - 图片文件自动生成200x200缩略图
- ✅ **文件类型检测** - 自动识别并验证文件类型
- ✅ **文件大小限制** - 默认50MB限制（可配置）
- ✅ **路径组织** - 按日期自动组织存储路径 (`2024/01/13/filename`)
- ✅ **唯一ID生成** - 每个文件分配唯一标识符
- ✅ **元数据存储** - 完整的文件信息存储到MySQL

## 🔧 API使用示例

### 1. 上传文件

```bash
# 上传图片文件
curl -X POST http://localhost:8080/api/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "contactId=optional_contact_id"
```

响应：
```json
{
  "success": true,
  "message": "文件上传成功",
  "data": {
    "fileId": "abc123-def456-ghi789",
    "fileName": "abc123-def456-ghi789.jpg",
    "originalFileName": "image.jpg",
    "fileUrl": "http://localhost:9000/telemsg-files/2024/01/13/abc123-def456-ghi789.jpg",
    "thumbnailUrl": "http://localhost:9000/telemsg-files/2024/01/13/thumb_abc123-def456-ghi789.jpg",
    "fileSize": 1048576,
    "contentType": "image/jpeg",
    "uploadTime": 1642123456789
  }
}
```

### 2. 发送文件消息

```bash
# 发送带文件的私聊消息
curl -X POST http://localhost:8080/api/messages/send-file \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "recipientId=user123" \
  -F "file=@/path/to/document.pdf" \
  -F "content=这是一个重要文档"
```

### 3. 发送群聊文件消息

```bash
# 发送群聊文件消息
curl -X POST http://localhost:8080/api/messages/send-group-file \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "groupId=group456" \
  -F "file=@/path/to/image.png" \
  -F "content=分享图片"
```

### 4. 获取文件下载链接

```bash
# 获取预签名下载URL（有效期1小时）
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/api/files/abc123-def456-ghi789/url
```

### 5. 直接下载文件

```bash
# 直接下载文件
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/api/files/abc123-def456-ghi789 \
  -o downloaded_file.jpg
```

## 🏗️ 架构设计

### 存储结构
```
telemsg-files/           # MinIO存储桶
├── 2024/               # 年份目录
│   ├── 01/            # 月份目录  
│   │   ├── 13/        # 日期目录
│   │   │   ├── abc123-def456-ghi789.jpg     # 原文件
│   │   │   └── thumb_abc123-def456-ghi789.jpg # 缩略图
│   │   └── 14/
│   └── 02/
└── 2025/
```

### 数据库设计

#### files表��构
```sql
CREATE TABLE files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_id VARCHAR(100) NOT NULL UNIQUE,    -- 文件唯一标识
    original_filename VARCHAR(255),          -- 原始文件名
    filename VARCHAR(255),                   -- 存储文件名  
    content_type VARCHAR(100),               -- MIME类型
    file_size BIGINT,                        -- 文件大小
    bucket_name VARCHAR(100),                -- MinIO桶名
    object_key VARCHAR(500),                 -- MinIO对象键
    file_url VARCHAR(500),                   -- 文件访问URL
    thumbnail_url VARCHAR(500),              -- 缩略图URL
    uploader_id VARCHAR(50),                 -- 上传者ID
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_image BOOLEAN DEFAULT FALSE           -- 是否为图片
);
```

#### 消息表扩展
```sql
-- tm_messages表新增字段
ALTER TABLE tm_messages ADD COLUMN file_id VARCHAR(100);         -- 关联文件ID
ALTER TABLE tm_messages ADD COLUMN thumbnail_url VARCHAR(500);   -- 缩略图URL
```

## 🔐 安全机制

### 1. 文件类型验证
- 严格的MIME类型检查
- 文件扩展名验证
- 恶意文件检测

### 2. 权限控制  
- 只有认证用户可上传文件
- 文件删除权限控制（仅上传者）
- 访问权限验证

### 3. 大小限制
- 默认50MB文件大小限制
- 可配置的上传限制
- 防止存储滥用

## 🚀 性能优化

### 1. 缩略图策略
- 图片自动生成200x200缩略图
- 使用高效的Thumbnailator库
- 失败时优雅降��

### 2. 预签名URL
- 1小时有效期的预签名下载链接
- 减轻应用服务器负载
- 支持直接客户端下载

### 3. 分层存储
- 按日期自动分层组织
- 便于管理和备份
- 提高查询性能

## 🔧 运维管理

### 1. MinIO管理界面
访问 http://localhost:9001 进入MinIO Console：
- 查看存储使用情况
- 管理存储桶和对象
- 配置访问策略
- 监控系统状态

### 2. 存储监控
```bash
# 查看存储使用情况
docker exec telemsg-minio mc admin info local

# 查看桶统计
docker exec telemsg-minio mc stat local/telemsg-files --recursive
```

### 3. 数据备份
```bash
# 备份MinIO数据
docker exec telemsg-minio mc mirror local/telemsg-files /backup/minio/

# 恢复数据
docker exec telemsg-minio mc mirror /backup/minio/ local/telemsg-files
```

### 4. 清理策略
```sql
-- 清理孤立文件记录（对应的MinIO对象不存在）
DELETE FROM files 
WHERE file_id NOT IN (
    SELECT DISTINCT file_id FROM tm_messages WHERE file_id IS NOT NULL
);
```

## 🐛 故障排除

### 常见问题

#### 1. MinIO连接失败
```bash
# 检查MinIO服务状态
docker logs telemsg-minio

# 检查网络连通性
curl -I http://localhost:9000/minio/health/live
```

#### 2. 文件上传失败
- 检查文件大小是否超限
- 确认文件类型是否支持
- 验证JWT token有效性

#### 3. 缩略图生成失败
- 检查图片格式是否正确
- 查看应用日志中的错误信息
- 确认Thumbnailator库正常工作

### 日志调试
```properties
# 开启MinIO相关调试日志
logging.level.com.telemsg.server.service.MinIOService=DEBUG
logging.level.io.minio=DEBUG
```

## 🔄 升级和维护

### 版本升级
```bash
# 升级MinIO版本
docker-compose pull minio
docker-compose up -d --no-deps minio
```

### 存储迁移
如需要迁移到其他对象存储（如AWS S3），只需：
1. 修改MinIO配置为S3配置
2. 迁移现有数据到S3
3. 更新数据库中的URL引用

## 📚 相关资源

- [MinIO官方文档](https://docs.min.io/)
- [MinIO Java SDK](https://docs.min.io/docs/java-client-quickstart-guide.html)
- [Spring Boot文件上���](https://spring.io/guides/gs/uploading-files/)
- [Thumbnailator文档](https://github.com/coobird/thumbnailator)

---

通过以上配置，TeleMsg现在具备了完整的文件存储和管理能力，支持图片、文件消息的发送和接收，为用户提供了丰富的多媒体通信体验！
