# TeleMsg Windows 开发脚本

本目录包含了在Windows环境下运行TeleMsg和MinIO的便捷脚本。

## 📁 脚本说明

### 🔧 安装脚本
- **`install-minio.bat`** - 自动下载并安装MinIO到C:\minio目录
  - 下载MinIO服务器和客户端
  - 创建必要的目录结构
  - 生成启动脚本

### 🚀 启动脚本  
- **`start-minio.bat`** - 单独启动MinIO服务器
- **`start-dev-environment.bat`** - 启动完整开发环境
  - 启动MinIO服务器
  - 初始化存储桶
  - 启动TeleMsg应用

### 🛠️ 管理脚本
- **`minio-tools.bat`** - MinIO管理工具集合
  - 服务状态检查
  - 存储桶管理
  - 文件上传测试
  - 服务重启等

## 🚀 快速开始

### 1. 首次安装
```batch
# 运行安装脚本（管理员权限推荐）
scripts\install-minio.bat
```

### 2. 启动开发环境
```batch
# 启动完整开发环境
scripts\start-dev-environment.bat
```

### 3. 管理MinIO
```batch  
# 使用管理工具
scripts\minio-tools.bat
```

## 📋 前置要求

- Windows 7/10/11
- PowerShell 或 Command Prompt
- 网络连接（用于下载MinIO）
- Java 17+（用于运行TeleMsg应用）

## 🔧 配置说明

### MinIO默认配置
- **安装路径**: `C:\minio\`
- **数据目录**: `C:\minio\data\`
- **API端口**: `9000`
- **Console端口**: `9001`
- **用户名**: `minioadmin`
- **密码**: `minioadmin123`

### 端口说明
确保以下端口未被占用：
- **9000**: MinIO API服务
- **9001**: MinIO Web控制台
- **8080**: TeleMsg应用API

## 🐛 故障排除

### 端口冲突
```batch
# 检查端口占用
netstat -ano | findstr :9000
netstat -ano | findstr :9001
netstat -ano | findstr :8080

# 终止占用进程（谨慎操作）
taskkill /pid <PID> /f
```

### 权限问题
```batch
# 以管理员身份运行命令提示符
# 确保对C:\minio目录有写入权限
```

### 网络连接问题
- 检查防火墙设置
- 确保可以访问dl.min.io域名
- 如无法自动下载，可手动下载minio.exe到C:\minio\

## 📚 相关文档

- [MinIO Windows安装详细指南](../MINIO_WINDOWS_SETUP.md)
- [MinIO集成总体指南](../MINIO_INTEGRATION_GUIDE.md)
- [TeleMsg项目文档](../README.md)

## 🔄 更新和维护

### 更新MinIO
1. 停止现有MinIO服务
2. 重新运行`install-minio.bat`
3. 重启服务

### 清理安装
```batch
# 停止服务
taskkill /f /im minio.exe

# 删除安装目录（谨慎操作，会丢失数据）
rmdir /s C:\minio
```

---

如有问题，请参考详细文档或提交Issue。
