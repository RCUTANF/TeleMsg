# TeleMsg 文档索引

**最后更新**: 2025年1月14日

本项目包含以下主要文档，帮助您快速了解和使用 TeleMsg 服务端。

---

## 📚 文档列表

### 1. **快速开始指南** 📖
**文件**: `QUICK_START.md`  
**用途**: 快速部署和运行项目  
**内容**:
- 环境要求
- 快速安装步骤
- 启动命令
- API 测试示例

---

### 2. **API 接口文档（完整）** 🌐
**文件**: `API_DOCUMENTATION_2.0.md` ⭐ **推荐**  
**版本**: 2.0（已更新）  
**用途**: 详细的 API 接口参考  
**内容**:
- 认证相关 API（登录/注册/登出）
- 用户管理 API
- 群组管理 API
- 讨论空间 API
- 消息管理 API（私聊、群聊、搜索、撤回等）
- 文件管理 API（MinIO 集成）
- 联系人管理 API
- 视频通话 API
- 管理员 API（用户、部门、角色管理）

**快速查找**: 通过目录快速定位所需 API

---

### 3. **项目结构与功能详解** 🏗️
**文件**: `PROJECT_STRUCTURE_2.0.md` ⭐ **推荐**  
**版本**: 2.0（已更新）  
**用途**: 项目架构、代码结构、技术栈详解  
**内容**:
- 项目概述和关键特性
- 核心功能模块（11 个）
- 完整的目录结构
- 技术栈（Spring Boot 3.2、MySQL、MinIO、MobileIMSDK）
- 数据库表设计
- 控制器层详解
- 服务层详解
- 快速开始步骤
- 与客户端的集成方法
- 常见问题 FAQ
- 性能优化建议
- 安全建议

**快速查找**: 了解代码组织、服务层实现、API 端点

---

### 4. **旧版项目总结** 📝
**文件**: `SERVER_STRUCTURE_SUMMARY.md`  
**说明**: 旧文档，仅供参考（已过时）

---

### 5. **README 项目说明** 📄
**文件**: `README.md`  
**用途**: 项目基本介绍和部署说明  
**内容**:
- 项目简介
- 功能特性
- 部署方式
- Docker 启动

---

## 🎯 快速导航

### 我想要...

#### 快速部署项目
→ 查看 **`QUICK_START.md`**

#### 理解项目架构
→ 查看 **`PROJECT_STRUCTURE_2.0.md`** 的 [项目概述](#项目概述) 和 [项目结构](#项目结构)

#### 找某个 API 的使用方法
→ 查看 **`API_DOCUMENTATION_2.0.md`** 并用 Ctrl+F 搜索

#### 了解用户相关功能
→ 查看 **`API_DOCUMENTATION_2.0.md`** 的 [用户管理 API](#用户管理-api)  
→ 查看 **`PROJECT_STRUCTURE_2.0.md`** 的 [用户管理](#2-用户管理)

#### 了解消息功能
→ 查看 **`API_DOCUMENTATION_2.0.md`** 的 [消息管理 API](#消息管理-api)  
→ 查看 **`PROJECT_STRUCTURE_2.0.md`** 的 [私聊消息](#5-私聊消息) 和 [群聊消息](#6-群聊消息)

#### 了解文件上传
→ 查看 **`API_DOCUMENTATION_2.0.md`** 的 [文件管理 API](#文件管理-api)  
→ 查看 **`PROJECT_STRUCTURE_2.0.md`** 的 [文件管理](#7-文件管理minio-对象存储)

#### 了解群组管理
→ 查看 **`API_DOCUMENTATION_2.0.md`** 的 [群组管理 API](#群组管理-api)  
→ 查看 **`PROJECT_STRUCTURE_2.0.md`** 的 [群组管理](#3-群组管理)

#### 了解讨论空间
→ 查看 **`API_DOCUMENTATION_2.0.md`** 的 [讨论空间 API](#讨论空间-api)  
→ 查看 **`PROJECT_STRUCTURE_2.0.md`** 的 [讨论空间](#4-讨论空间)

#### 了解管理员功能
→ 查看 **`API_DOCUMENTATION_2.0.md`** 的 [管理员 API](#管理员-api)  
→ 查看 **`PROJECT_STRUCTURE_2.0.md`** 的 [部门管理](#10-部门管理仅管理员) 和 [管理员功能](#11-管理员功能)

#### 查找数据库表结构
→ 查看 **`PROJECT_STRUCTURE_2.0.md`** 的 [数据库设计](#数据库设计)

#### 修改代码或集成客户端
→ 查看 **`PROJECT_STRUCTURE_2.0.md`** 的 [与客户端的集成](#与客户端的集成)

#### 解决问题或查看常见问题
→ 查看 **`PROJECT_STRUCTURE_2.0.md`** 的 [常见问题](#常见问题)

#### 了解技术栈
→ 查看 **`PROJECT_STRUCTURE_2.0.md`** 的 [技术栈](#技术栈)

#### 部署到生产环境
→ 查看 **`README.md`** 和 **`PROJECT_STRUCTURE_2.0.md`** 的 [Docker 部署](#docker-部署)

---

## 📊 功能特性一览

### 核心功能（11 个主要模块）

| # | 功能模块 | API 端点 | 文档位置 |
|---|---------|---------|--------|
| 1 | 身份认证与授权 | `/auth` | [API](API_DOCUMENTATION_2.0.md#认证相关-api) / [结构](SERVER_STRUCTURE_SUMMARY_2.0.md#1-身份认证与授权) |
| 2 | 用户管理 | `/users` | [API](API_DOCUMENTATION_2.0.md#用户管理-api) / [结构](SERVER_STRUCTURE_SUMMARY_2.0.md#2-用户管理) |
| 3 | 群组管理 | `/groups` | [API](API_DOCUMENTATION_2.0.md#群组管理-api) / [结构](SERVER_STRUCTURE_SUMMARY_2.0.md#3-群组管理) |
| 4 | 讨论空间 | `/discussion-spaces` | [API](API_DOCUMENTATION_2.0.md#讨论空间-api) / [结构](SERVER_STRUCTURE_SUMMARY_2.0.md#4-讨论空间) |
| 5 | 私聊消息 | `/messages` | [API](API_DOCUMENTATION_2.0.md#消息管理-api) / [结构](SERVER_STRUCTURE_SUMMARY_2.0.md#5-私聊消息) |
| 6 | 群聊消息 | `/messages/group` | [API](API_DOCUMENTATION_2.0.md#消息管理-api) / [结构](SERVER_STRUCTURE_SUMMARY_2.0.md#6-群聊消息) |
| 7 | 文件管理 | `/files` | [API](API_DOCUMENTATION_2.0.md#文件管理-api) / [结构](SERVER_STRUCTURE_SUMMARY_2.0.md#7-文件管理minio-对象存储) |
| 8 | 联系人管理 | `/contacts` | [API](API_DOCUMENTATION_2.0.md#联系人管理-api) / [结构](SERVER_STRUCTURE_SUMMARY_2.0.md#8-联系人管理) |
| 9 | 视频通话 | `/calls` | [API](API_DOCUMENTATION_2.0.md#视频通话-api) / [结构](SERVER_STRUCTURE_SUMMARY_2.0.md#9-视频语音通话信令) |
| 10 | 部门管理 | `/admin/departments` | [API](API_DOCUMENTATION_2.0.md#管理员-api) / [结构](SERVER_STRUCTURE_SUMMARY_2.0.md#10-部门管理仅管理员) |
| 11 | 管理员功能 | `/admin` | [API](API_DOCUMENTATION_2.0.md#管理员-api) / [结构](SERVER_STRUCTURE_SUMMARY_2.0.md#11-管理员功能) |

---

## 🔧 技术栈概览

### 后端框架
- **Spring Boot 3.2** (最新 LTS)
- **Java 21**
- **Spring Data JPA**
- **Spring Security**

### 数据存储
- **MySQL 8.0+**
- **Redis** (可选缓存)
- **MinIO** (对象存储)

### IM 框架
- **MobileIMSDK 4.x**
- **Netty** (TCP/UDP)

### 构建和部署
- **Gradle**
- **Docker** & **Docker Compose**

详见: **`PROJECT_STRUCTURE_2.0.md`** 的 [技术栈](#技术栈)

---

## 📝 API 概览

### 端点统计

| 类别 | 端点数 | 主要操作 |
|-----|--------|--------|
| 认证 (Auth) | 3 | 登录、注册、登出 |
| 用户 (User) | 5 | 查询、更新、权限管理 |
| 群组 (Group) | 10 | 创建、加入、管理成员、转让、解散 |
| 讨论空间 (DiscussionSpace) | 5 | 创建、查询、成员管理 |
| 消息 (Message) | 13 | 发送、查询、已读、搜索、撤回、删除 |
| 文件 (File) | 6 | 上传、下载、查询、删除 |
| 联系人 (Contact) | 3 | 查询、添加、删除 |
| 通话 (Call) | 3 | 发起、接听、结束 |
| 管理员 (Admin) | 12 | 用户、部门、角色管理、统计 |

**总计**: 60+ 个 API 端点

详见: **`API_DOCUMENTATION_2.0.md`**

---

## 🗄️ 数据库表

核心数据表：
- `tm_users` - 用户信息
- `tm_groups` - 群组信息
- `tm_group_members` - 群成员关系
- `tm_messages` - 消息内容
- `tm_file_info` - 文件元数据
- `tm_departments` - 部门信息

详见: **`PROJECT_STRUCTURE_2.0.md`** 的 [数据库设计](#数据库设计)

---

## 🚀 快速开始步骤

### 1. 克隆项目
```bash
git clone https://github.com/your-repo/TeleMsg.git
cd TeleMsg-SpringBoot
```

### 2. 配置环境
编辑 `application-dev.properties` 配置数据库和 MinIO

### 3. 启动服务
```bash
./gradlew bootRun --args='--spring.profiles.active=dev'
```

### 4. 测试 API
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

详见: **`QUICK_START.md`** 或 **`PROJECT_STRUCTURE_2.0.md`** 的 [快速开始](#快速开始)

---

## ❓ 常见问题速查

| 问题 | 位置 |
|------|------|
| 如何修改 JWT Token 有效期？ | [PROJECT_STRUCTURE_2.0.md#q1](SERVER_STRUCTURE_SUMMARY_2.0.md#q1-如何修改-jwt-token-有效期) |
| 如何扩展文件类型支持？ | [PROJECT_STRUCTURE_2.0.md#q2](SERVER_STRUCTURE_SUMMARY_2.0.md#q2-如何扩展支持更多文件类型) |
| 如何增加文件大小限制？ | [PROJECT_STRUCTURE_2.0.md#q3](SERVER_STRUCTURE_SUMMARY_2.0.md#q3-如何增加-minio-文件大小限制) |
| MinIO 连接失败怎么办？ | [PROJECT_STRUCTURE_2.0.md#q7](SERVER_STRUCTURE_SUMMARY_2.0.md#q7-minio-连接失败怎么办) |
| 支持加密消息吗？ | [PROJECT_STRUCTURE_2.0.md#q9](SERVER_STRUCTURE_SUMMARY_2.0.md#q9-支持对消息进行加密吗) |
| 如何处理离线消息？ | [PROJECT_STRUCTURE_2.0.md#q10](SERVER_STRUCTURE_SUMMARY_2.0.md#q10-如何处理离线消息) |

更多问题见: **`PROJECT_STRUCTURE_2.0.md`** 的 [常见问题](#常见问题)

---

## 📞 获取帮助

1. **查看文档** - 这个索引和各个文档文件
2. **检查日志** - `logs/` 目录下的日志文件
3. **查看示例** - `QUICK_START.md` 中的 curl 示例
4. **提交 Issue** - GitHub Issues
5. **联系开发团队** - TeleMsg 开发团队

---

## 📢 文档版本信息

| 文件 | 版本 | 更新时间 | 状态 |
|-----|------|---------|------|
| API_DOCUMENTATION_2.0.md | 2.0 | 2025-01-14 | ✅ 最新 |
| PROJECT_STRUCTURE_2.0.md | 2.0 | 2025-01-14 | ✅ 最新 |
| QUICK_START.md | 1.0 | - | ⚠️ 可参考 |
| README.md | 1.0 | - | ⚠️ 可参考 |
| SERVER_STRUCTURE_SUMMARY.md | 1.0 | - | ❌ 已过时 |

**推荐查看**: API_DOCUMENTATION_2.0.md 和 PROJECT_STRUCTURE_2.0.md（最新版本）

---

## ✨ 主要改进（v2.0）

相比 v1.0，v2.0 文档包括：

✅ **更完整的 API 覆盖** - 所有 60+ 个端点都有详细说明  
✅ **新增讨论空间功能** - 群组内的子分组支持  
✅ **完整的文件管理** - MinIO 对象存储集成  
✅ **增强的消息功能** - 搜索、撤回、删除等  
✅ **管理员系统** - 用户、部门、角色完整管理  
✅ **更详细的服务层说明** - 每个服务的核心方法列表  
✅ **数据库表设计** - 完整的 SQL 结构  
✅ **集成指南** - 与客户端的详细集成步骤  
✅ **性能优化建议** - 缓存、索引等  
✅ **安全建议** - 生产环境配置  

---

## 📄 许可证

MIT License - 详见项目根目录的 LICENSE 文件

---

**最后更新**: 2025年1月14日  
**维护者**: TeleMsg 开发团队  
**文档版本**: 2.0

希望这份文档索引能帮助您快速找到所需信息！如有问题，请参考相应的详细文档或联系开发团队。

