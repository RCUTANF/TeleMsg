# 代理设置功能集成指南

## 概述

本项目已完成了代理设置与Electron接口的集成，使代理配置能够真正生效并在应用运行时被应用到网络请求中。

## 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    React UI (主渲染进程)                      │
│  SettingsDialog.tsx ─ useProxySettings Hook                  │
└─────────────────────────────────────────────────────────────┘
                              ↓ IPC 通信
┌─────────────────────────────────────────────────────────────┐
│                  preload.cjs (隔离的桥接)                     │
│  暴露 electronAPI.proxy 接口给渲染进程                        │
└─────────────────────────────────────────────────────────────┘
                              ↓ IPC 处理
┌─────────────────────────────────────────────────────────────┐
│              electron.cjs (Electron主进程)                    │
│  • 处理代理IPC请求                                            │
│  • 读写代理配置文件                                            │
│  • 应用代理设置到BrowserWindow会话                            │
│  • 验证代理连接                                               │
└─────────────────────────────────────────────────────────────┘
```

## 核心文件说明

### 1. **electron.cjs** - Electron主进程
```javascript
// 代理配置存储路径
const proxyConfigPath = path.join(app.getPath('userData'), 'proxy-config.json');

// IPC处理程序
- set-proxy-settings: 保存代理设置并应用到会话
- get-proxy-settings: 读取保存的代理设置
- validate-proxy-connection: 验证代理连接
```

**关键功能：**
- 在应用启动时自动加载保存的代理设置
- 将代理规则应用到BrowserWindow的会话
- 提供代理连接验证

### 2. **preload.cjs** - Electron预加载脚本
```javascript
window.electronAPI.proxy = {
  setProxySettings(settings),
  getProxySettings(),
  validateProxyConnection(settings)
}
```

**安全特性：**
- 使用contextIsolation隔离上下文
- 仅暴露必要的代理API
- 防止渲染进程直接访问Node.js API

### 3. **proxyService.ts** - 代理服务层
```typescript
// 主要函数
- getProxySettings(): 获取代理设置
- setProxySettings(settings): 保存代理设置
- validateProxyConnection(settings): 验证代理连接
- isElectronEnvironment(): 检查Electron环境
```

**特性：**
- 自动检测Electron环境
- 提供localStorage降级方案
- 完整的输入验证
- 错误处理和日志记录

### 4. **useProxySettings.ts** - 自定义Hook
```typescript
// 返回对象包含
- 状态: proxyEnabled, proxyHost, proxyPort, proxyType, loading, validating, error
- 操作: loadProxySettings, saveProxySettings, validateProxy, clearProxySettings
```

**优势：**
- 简化在React组件中的使用
- 自动处理加载和验证状态
- 自动挂载时加载设置
- 集中的错误管理

### 5. **SettingsDialog.tsx** - 设置对话框
已更新为使用proxyService和useProxySettings Hook来管理代理设置。

## 使用指南

### 方式一：使用Hook（推荐用于React组件）

```typescript
import { useProxySettings } from '@/app/hooks/useProxySettings';
import { toast } from 'sonner';

function MyComponent() {
  const {
    proxyEnabled,
    proxyHost,
    proxyPort,
    proxyType,
    loading,
    validating,
    setProxyHost,
    setProxyPort,
    saveProxySettings,
    validateProxy
  } = useProxySettings(true); // true表示挂载时加载设置

  // 保存设置
  const handleSave = async () => {
    const result = await saveProxySettings();
    if (result.success) {
      toast.success('设置已保存');
    } else {
      toast.error(result.message);
    }
  };

  // 验证连接
  const handleValidate = async () => {
    const result = await validateProxy();
    if (result.success) {
      toast.success('连接成功');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div>
      {/* UI代码 */}
    </div>
  );
}
```

### 方式二：直接调用Service（非React场景）

```typescript
import { 
  getProxySettings, 
  setProxySettings,
  validateProxyConnection 
} from '@/app/services/proxyService';

// 获取设置
const result = await getProxySettings();
if (result.success) {
  console.log('代理配置:', result.data);
}

// 保存设置
const saveResult = await setProxySettings({
  enabled: true,
  host: '127.0.0.1',
  port: '8080',
  type: 'http'
});

// 验证连接
const validateResult = await validateProxyConnection({
  host: '127.0.0.1',
  port: '8080',
  type: 'http'
});
```

## 代理类型支持

| 类型 | 说明 | 用途 |
|------|------|------|
| HTTP | HTTP代理 | 默认，支持大多数场景 |
| HTTPS | HTTPS代理 | 加密代理连接 |
| SOCKS5 | SOCKS5代理 | 更灵活的代理协议 |

## 配置文件位置

代理配置保存在应用用户数据目录：

**Windows:**
```
%APPDATA%\TeleMsg\proxy-config.json
```

**macOS:**
```
~/Library/Application Support/TeleMsg/proxy-config.json
```

**Linux:**
```
~/.config/TeleMsg/proxy-config.json
```

## 配置文件格式

```json
{
  "enabled": true,
  "host": "127.0.0.1",
  "port": "8080",
  "type": "http"
}
```

## IPC通信流程

### 保存代理设置流程
```
UI (SettingsDialog)
  ↓ 调用 saveProxySettings()
Service (proxyService.ts)
  ↓ 调��� window.electronAPI.proxy.setProxySettings()
Preload (preload.cjs)
  ↓ ipcRenderer.invoke('set-proxy-settings', settings)
Main (electron.cjs)
  ↓ 保存到文件并应用到会话
  ↓ 返回成功/失败响应
```

### 获取代理设置流程
```
UI (SettingsDialog)
  ↓ 调用 getProxySettings()
Service (proxyService.ts)
  ↓ 调用 window.electronAPI.proxy.getProxySettings()
Preload (preload.cjs)
  ↓ ipcRenderer.invoke('get-proxy-settings')
Main (electron.cjs)
  ↓ 从文件读取配置
  ↓ 返回配置数据
```

## 功能特性

### ✅ 已实现
- [x] 代理设置的保存和加载
- [x] 代理设置应用到Electron会话
- [x] 代理连接验证
- [x] 自动故障转移到localStorage
- [x] 完整的输入验证
- [x] 多代理类型支持（HTTP、HTTPS、SOCKS5）
- [x] 安全的IPC通信
- [x] TypeScript类型定义
- [x] 错误处理和日志记录

### 🔄 应用流程
1. **启动时**：主进程读取保存的代理配置并应用到会话
2. **修改时**：通过SettingsDialog保存新配置
3. **验证时**：用户可测试代理连接
4. **运行时**：所有网络请求通过配置的代理进行

## 环境变量支持

可在环境中设置代理配置：
```bash
PROXY_ENABLED=true
PROXY_HOST=127.0.0.1
PROXY_PORT=8080
PROXY_TYPE=http
```

## 故障排查

### 代理设置未生效
1. 检查`proxy-config.json`是否存在和有效
2. 查看Electron主进程的日志输出
3. 确认代理服务器正在运行且可访问
4. 在SettingsDialog中使用"测试连接"验证

### 连接验证失败
1. 确认代理地址和端口正确
2. 检查网络连接和防火墙设置
3. 尝试用本地代理工具测试连接
4. 查看浏览器开发者工具中的网络请求

### localStorage降级方案何时使用
- 在非Electron环境（纯Web应用）中自动使用
- Electron API不可用时的备选方案
- 配置仅保存在浏览器本地，不持久化到文件

## 最佳实践

1. **在应用启动时加载设置**
   ```typescript
   useEffect(() => {
     loadProxySettings(); // 在App组件中调用
   }, []);
   ```

2. **提供用户反馈**
   ```typescript
   const result = await saveProxySettings();
   if (result.success) {
     toast.success('代理设置已保存');
   } else {
     toast.error(result.message);
   }
   ```

3. **验证后再保存**
   ```typescript
   const validateResult = await validateProxy();
   if (validateResult.success) {
     await saveProxySettings();
   }
   ```

4. **处理加载状态**
   ```typescript
   {loading && <LoadingSpinner />}
   {!loading && <ProxyForm />}
   ```

## 扩展功能建议

1. **代理认证支持**
   - 添加用户名/密码字段
   - 支持NTLM认证

2. **代理列表管理**
   - 保存多个代理配置
   - 快速切换

3. **代理统计**
   - 记录代理使用情况
   - 显示流量统计

4. **自动代理选择**
   - 根据URL规则选择不同代理
   - PAC脚本支持

## 许可证

MIT

## 更新日志

### v1.0.0 (2025-01-14)
- 初始版本
- 完成Electron代理设置集成
- 支持HTTP、HTTPS、SOCKS5代理
- 实现代理连接验证

