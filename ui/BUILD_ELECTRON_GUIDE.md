# TeleMsg Desktop - Electron 应用构建指南

## 📦 概述

TeleMsg Desktop 是一个基于 Electron 的桌面应用程序，可以打包为独立的 Windows .exe 安装程序，**不需要浏览器**即可运行。

## 🎯 快速开始

### 开发模式（推荐用于开发和测试）

```bash
# 使用 Gradle 启动 Electron 开发模式
gradle devElectron

# 或者 Windows 下使用
gradlew devElectron
```

这将：
1. 自动安装 npm 依赖
2. 启动 Vite 开发服务器（支持热重载）
3. 启动 Electron 桌面应用程序窗口
4. 在桌面应用中显示界面（**不是浏览器**）

### 构建生产版本（打包成 .exe）

#### 方式一：构建完整的安装包（推荐）

```bash
# 构建 Windows 安装程序和便携版
gradle distElectronWin

# 或者
gradlew distElectronWin
```

**输出位置：** `ui/dist-electron/`
- `TeleMsg Desktop Setup 1.0.0.exe` - NSIS 安装程序
- `TeleMsg Desktop 1.0.0.exe` - 便携版（绿色版，无需安装）

#### 方式二：快速构建（仅打包应用）

```bash
# 构建 Windows 应用（生成未打包的应用程序文件）
gradle buildElectronWin

# 或者通用构建（根据当前平台自动选择）
gradle buildElectron
```

**输出位置：** `ui/dist-electron/win-unpacked/`
- 包含完整的应用程序文件夹
- 可直接运行 `TeleMsg Desktop.exe`

## 📁 构建输出说明

���建完成后，你将在 `ui/dist-electron/` 目录下看到：

```
dist-electron/
├── win-unpacked/                    # 未打包的应用程序文件夹
│   └── TeleMsg Desktop.exe         # 可直接运行的 exe（需要整个文件夹）
├── TeleMsg Desktop Setup 1.0.0.exe # 安装程序（推荐分发）
└── TeleMsg Desktop 1.0.0.exe       # 便携版（可单独运行）
```

### 三种分发方式的区别

| 类型 | 文件 | 特点 | 使用场景 |
|------|------|------|----------|
| **安装程序** | `TeleMsg Desktop Setup 1.0.0.exe` | • 包含安装向导<br>• 创建桌面快捷方式<br>• 注册到系统程序列表<br>• 支持卸载 | 正式发布给用户 |
| **便携版** | `TeleMsg Desktop 1.0.0.exe` | • 单文件，体积较大<br>• 无需安装<br>• 可放在 U 盘使用 | 临时使用、测试 |
| **未打包版** | `win-unpacked/TeleMsg Desktop.exe` | • 需要整个文件夹<br>• 文件结构清晰<br>• 便于调试 | 开发调试 |

## 🚀 完整工作流程

### 开发阶段

```bash
# 1. 安装依赖（首次运行）
gradle npmInstall

# 2. 启动开发模式（热重载）
gradle devElectron

# 现在你可以：
# - 在 Electron 窗口中看到应用
# - 修改代码后自动刷新
# - 使用 Ctrl+Shift+I 打开开发者工具
```

### 测试阶段

```bash
# 1. 构建测试版本
gradle buildElectronWin

# 2. 测试应用
cd ui/dist-electron/win-unpacked
./TeleMsg Desktop.exe

# 验证：
# ✓ 应用能正常启动
# ✓ 所有功能正常工作
# ✓ 没有浏览器窗口打开
```

### 发布阶段

```bash
# 1. 构建发行版
gradle distElectronWin

# 2. 获取安装包
# 输出在：ui/dist-electron/TeleMsg Desktop Setup 1.0.0.exe

# 3. 分发给用户
# 用户只需双击安装程序，按向导安装即可
```

## 🔧 高级配置

### 修改��用信息

编辑 `ui/package.json` 中的 `build` 部分：

```json
{
  "build": {
    "appId": "com.telemsg.desktop",
    "productName": "TeleMsg Desktop",
    "win": {
      "publisherName": "TeleMsg Team",
      "target": ["nsis", "portable"]
    }
  }
}
```

### 自定义安装程序

NSIS 安装程序配置：

```json
{
  "nsis": {
    "oneClick": false,                          // 允许用户选择安装路径
    "allowToChangeInstallationDirectory": true,  // 允许更改安装目录
    "createDesktopShortcut": true,              // 创建桌面快捷方式
    "createStartMenuShortcut": true,            // 创建开始菜单快捷方式
    "deleteAppDataOnUninstall": true           // 卸载时删除用户数据
  }
}
```

### 自定义应用图标

将图标文件放在 `ui/public/icons/` 目录下：
- `icon.png` - 应用窗口图标
- `icon.ico` - Windows 应用图标（推荐 256x256）

## 🐛 常见问题

### 1. 构建失败：找不到 electron-builder

**解决方案：**
```bash
cd ui
npm install electron-builder --save-dev
```

### 2. 应用启动后显示空白页

**原因：** Vite 构建路径配置问题

**解决方案：** 检查 `ui/vite.config.ts`：
```typescript
export default defineConfig({
  base: './',  // 重要：使用���对路径
  // ...
})
```

### 3. 开发模式启动失败

**检查：**
1. 端口 5173 是否被占用
2. Node.js ��本是否 >= 18.17.0
3. 清理缓存：`gradle cleanUI`

### 4. 构建的 exe 文件太大

**优化：**
- 使用 `dist:win` 而不是 `build:win`（启用压缩）
- 检查 `package.json` 中的 `files` 配置，排除不必要的文件
- 考虑使用 ASAR 打包（默认已启用）

## 📊 所有可用的 Gradle 任务

```bash
# 开发相关
gradle devUI             # 仅启动 Web 开发服务器（浏览器）
gradle devElectron       # 启动 Electron 开发模式（桌面应用）

# 构建相关
gradle buildUI           # 仅构建 Web 资源
gradle buildElectron     # 构建 Electron 应用（未打包）
gradle buildElectronWin  # 构建 Windows Electron 应用

# 打包发布
gradle distElectronWin   # 打包 Windows 发行版（推荐）

# 清理
gradle cleanUI           # 清理构建文件
```

## 🎉 总结

使用 Electron 版本的 TeleMsg Desktop：

✅ **是独立的桌面应用** - 不需要浏览器  
✅ **有自己的窗口和菜单** - 原生体验  
✅ **可以打包成 .exe** - 方便分发  
✅ **支持热重载开发** - 提高开发效率  
✅ **跨平台支持** - Windows/Mac/Linux

推荐工作流：
1. 开发时用 `gradle devElectron`
2. 测试时用 `gradle buildElectronWin`
3. 发布时用 `gradle distElectronWin`

