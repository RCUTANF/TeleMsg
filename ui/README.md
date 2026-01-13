# TeleMsg Desktop

TeleMsg 企业通讯平台桌面版 - 基于 Electron 构建的现代化企业即时通讯应用。

## 功能特性

- 💬 实时消息传输
- 👥 群组聊天和讨论空间
- 📞 音视频通话
- 📁 文件传输
- 🔒 端到端加密
- 🛡️ 企业级安全管理
- 🎨 现代化 UI 界面
- 🌍 跨平台支持

## 系统要求

- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器
- 操作系统：Windows 10+, macOS 10.15+, Ubuntu 18.04+

## 开发环境设置

### 1. 克隆项目并安装依赖

```bash
# 进入 UI 模块目录
cd ui

# 安装依赖
npm install
```

### 2. 开发模式运行

```bash
# 启动开发服务器和 Electron
npm run electron-dev

# 或者分别启动
npm run dev          # 启动 Vite 开发服务器
npm run electron     # 启动 Electron (需要先运行 dev)
```

### 3. 构建生产版本

#### Windows 构建
```bash
# 构建 Windows 可执行文件
npm run build:win

# 或使用批处理脚本
./build-win.bat
```

#### macOS 构建
```bash
# 构建 macOS 应用包
npm run build:mac
```

#### Linux 构建
```bash
# 构建 Linux 应用包
npm run build:linux

# 或使用脚本
./build-linux.sh
```

#### 构建所有平台
```bash
npm run dist
```

## 项目结构

```
ui/
├── public/                 # 静态资源
│   ├── electron.cjs       # Electron 主进程
│   ├── preload.cjs        # 预加载脚本
│   └── icons/             # 应用图标
├── src/                   # 源代码
│   ├── app/              # React 应用
│   ├── components/       # UI 组件
│   └── services/         # API 服务
├── build/                # 构建配置文件
├── dist/                 # Web 构建输出
├── dist-electron/        # Electron 构建输出
├── package.json          # 项目配置
├── vite.config.ts        # Vite 配置
└── README.md            # 项目说明
```

## 可用脚本

### 开发脚本
- `npm run dev` - 启动 Vite 开发服务器
- `npm run electron` - 启动 Electron 应用
- `npm run electron-dev` - 同时启动开发服务器和 Electron

### 构建脚本
- `npm run build` - 构建 Web 应用
- `npm run electron-pack` - 构建 Electron 应用（开发版）
- `npm run build:electron` - 构建 Electron 应用（生产版）
- `npm run build:win` - 构建 Windows 版本
- `npm run build:mac` - 构建 macOS 版本
- `npm run build:linux` - 构建 Linux 版本
- `npm run dist:*` - 构建分发包

## 构建输出

构建完成后，可执行文件将生成在 `dist-electron/` 目录中：

- **Windows**: `.exe` 安装程序和便携版
- **macOS**: `.dmg` 磁盘镜像和 `.zip` 压缩包
- **Linux**: `.AppImage`、`.deb` 和 `.rpm` 包

## 配置说明

### Electron Builder 配置

主要构建配置在 `package.json` 的 `build` 部分：

- `appId`: 应用程序标识符
- `productName`: 产品名称
- `directories`: 构建目录配置
- `files`: 包含在应用中的文件
- `win/mac/linux`: 平台特定配置

### 图标文件

应用图标位于 `public/icons/` 目录：

- `icon.png` - 基础 PNG 图标 (256x256)
- `icon.ico` - Windows 图标 (多尺寸)
- `icon.icns` - macOS 图标
- `installer.bmp` - Windows 安装程序图像

## 开发指南

### 调试

1. **主进程调试**:
   - 在 `public/electron.cjs` 中添加 `console.log`
   - 查看终端输出

2. **渲染进程调试**:
   - 开发模式下自动打开 DevTools
   - 使用 `F12` 或 `Ctrl+Shift+I`

### 安全注意事项

- 已启用 `contextIsolation` 和 `nodeIntegration: false`
- 使用 `preload.cjs` 安全地暴露 API
- 外部链接会在系统浏览器中打开

### 性能优化

- 使用 Vite 进行快速热重载
- 生产构建自动进行代码分割和压缩
- Electron 应用包大小已优化

## 故障排除

### 常见问题

1. **依赖安装失败**
   ```bash
   # 清理缓存后重新安装
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Electron 启动失败**
   - 确保先运行 `npm run dev` 启动开发服务器
   - 检查端口 5173 是否被占用

3. **构建失败**
   - 确保所有依赖已正确安装
   - 检查图标文件是否存在
   - 验证 `package.json` 配置

### 日志输出

- 开发模式：终端输出
- 生产模式：系统日志目录

## 更新日志

### v1.0.0 (2026-01-13)
- 初始版本发布
- 完整的即时通讯功能
- 跨平台桌面应用支持
- 企业级安全特性

## 许可证

Copyright © 2026 TeleMsg Team. All rights reserved.

## 联系方式

- 项目主页: https://github.com/telemsg/desktop
- 问题报告: https://github.com/telemsg/desktop/issues
- 邮箱: support@telemsg.com
