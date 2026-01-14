const { app, BrowserWindow, Menu, shell, dialog, ipcMain, session } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const fs = require('fs');
const http = require('http');
const https = require('https');

// 保持对主窗口的全局引用
let mainWindow;

// 代理配置存储路径
const proxyConfigPath = path.join(app.getPath('userData'), 'proxy-config.json');

// 读取代理配置
function readProxyConfig() {
  try {
    if (fs.existsSync(proxyConfigPath)) {
      const data = fs.readFileSync(proxyConfigPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('读取代理配置失败:', error);
  }
  return null;
}

// 写入代理配置
function writeProxyConfig(config) {
  try {
    fs.writeFileSync(proxyConfigPath, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('写入代理配置失败:', error);
    return false;
  }
}

// 应用代理设置到会话
function applyProxySettings(proxyConfig) {
  try {
    if (!proxyConfig || !proxyConfig.enabled) {
      // 禁用代���
      mainWindow.webContents.session.setProxy({ proxyRules: '' });
      return;
    }

    const { host, port, type } = proxyConfig;

    if (!host || !port) {
      console.warn('代理配置不完整');
      return;
    }

    // 构建代理规则
    const proxyUrl = `${type || 'http'}://${host}:${port}`;
    const proxyRules = `${type || 'http'}=${proxyUrl}`;

    // 应用代���设置
    mainWindow.webContents.session.setProxy({ proxyRules }).then(() => {
      console.log('代理设置已应用:', proxyRules);
    }).catch(error => {
      console.error('应用代理设置失败:', error);
    });
  } catch (error) {
    console.error('应用代理设置时出错:', error);
  }
}

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, 'icons', 'icon.png'),
    show: false, // 先不显示，等加载完成后再显示
    titleBarStyle: 'default',
    frame: true
  });

  // 加载应用
  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  // 应用保存的代理设置
  const savedProxyConfig = readProxyConfig();
  if (savedProxyConfig) {
    applyProxySettings(savedProxyConfig);
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // 开发模式下打开开发者工具
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // 当窗口关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 防止导航到外部网站
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    if (parsedUrl.origin !== 'http://localhost:5173' && !navigationUrl.startsWith('file://')) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
}

// 当应用准备就绪时创建窗口
app.whenReady().then(() => {
  createWindow();

  // 设置应用菜单
  createMenu();

  app.on('activate', () => {
    // 在 macOS 上，当点击 dock 图标且没有其他窗口打开时，
    // 通常会重新创建一个窗口
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 当所有窗口都关闭时退出应用
app.on('window-all-closed', () => {
  // 在 macOS 上，应用和菜单栏通常会保持激活状态，
  // 直到用户明确使用 Cmd + Q 退出
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 安全：防止新窗口创建
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// 创建应用菜单
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectall', label: '全选' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'forceReload', label: '强制重新加载' },
        { role: 'toggleDevTools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '重置��放' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' }
      ]
    },
    {
      label: '窗口',
      submenu: [
        { role: 'minimize', label: '最小化' },
        { role: 'close', label: '关闭' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于 TeleMsg',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于 TeleMsg',
              message: 'TeleMsg Desktop',
              detail: 'TeleMsg 企业通讯平台桌面版\n版本: 1.0.0\n\n基于 Electron 构建的现代化企业即时通讯应用'
            });
          }
        }
      ]
    }
  ];

  // macOS 特殊菜单处理
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about', label: '关于 ' + app.getName() },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide', label: '隐藏 ' + app.getName() },
        { role: 'hideothers', label: '隐藏其他' },
        { role: 'unhide', label: '全部显示' },
        { type: 'separator' },
        { role: 'quit', label: '退出 ' + app.getName() }
      ]
    });

    // 窗口菜单
    template[4].submenu = [
      { role: 'close', label: '关闭窗口' },
      { role: 'minimize', label: '最小化' },
      { role: 'zoom', label: '缩放' },
      { type: 'separator' },
      { role: 'front', label: '全部置于前台' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC 处理程序
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

// 代理设置相关 IPC 处理程序
ipcMain.handle('set-proxy-settings', async (event, settings) => {
  try {
    const proxyConfig = {
      enabled: settings.enabled,
      host: settings.host,
      port: settings.port,
      type: settings.type || 'http'
    };

    // 保存到文件
    const saved = writeProxyConfig(proxyConfig);

    if (saved && mainWindow) {
      // 应用代理设置
      applyProxySettings(proxyConfig);
      return {
        success: true,
        message: '代理设置已保存并应用'
      };
    } else {
      return {
        success: false,
        message: '保存代理设置失败'
      };
    }
  } catch (error) {
    console.error('设置代理配置时出错:', error);
    return {
      success: false,
      message: '设置代理配置时出错: ' + error.message
    };
  }
});

ipcMain.handle('get-proxy-settings', async (event) => {
  try {
    const proxyConfig = readProxyConfig();
    return {
      success: true,
      data: proxyConfig || {
        enabled: false,
        host: '',
        port: '',
        type: 'http'
      }
    };
  } catch (error) {
    console.error('获取代理配置时出错:', error);
    return {
      success: false,
      message: '获取代理配置时出错'
    };
  }
});

ipcMain.handle('validate-proxy-connection', async (event, settings) => {
  try {
    const { host, port, type } = settings;

    if (!host || !port) {
      return {
        success: false,
        message: '代理地址或端口不能为空'
      };
    }

    console.log(`开始验证代理连接: ${type}://${host}:${port}`);

    // 验证不同类型的代理
    if (type === 'socks5') {
      // 对于SOCKS5，我们尝试简单的TCP连接测试
      return new Promise((resolve) => {
        const net = require('net');
        const socket = new net.Socket();
        const timeout = 5000;

        const timer = setTimeout(() => {
          socket.destroy();
          resolve({
            success: false,
            message: 'SOCKS5 代理连接超时'
          });
        }, timeout);

        socket.connect(parseInt(port), host, () => {
          clearTimeout(timer);
          socket.destroy();
          resolve({
            success: true,
            message: 'SOCKS5 代理连接成功'
          });
        });

        socket.on('error', (error) => {
          clearTimeout(timer);
          console.error('SOCKS5代理验证失败:', error.message);
          resolve({
            success: false,
            message: `SOCKS5 代理连接失败: ${error.message}`
          });
        });
      });
    } else {
      // 对于HTTP/HTTPS代理，使用真实的代理请求
      return new Promise((resolve) => {
        const timeout = 5000;
        const testUrl = 'http://httpbin.org/ip'; // 使用httpbin来测试

        // 创建代理agent
        const Agent = type === 'https' ? https.Agent : http.Agent;
        const requestModule = testUrl.startsWith('https:') ? https : http;

        // 构建请求选项
        const options = {
          hostname: 'httpbin.org',
          port: 80,
          path: '/ip',
          method: 'GET',
          timeout: timeout,
          agent: new Agent({
            keepAlive: false,
            // 使用代理
            proxy: `${type}://${host}:${port}`
          })
        };

        // 如果需要通过代理，修改请求选项
        if (type === 'http' || type === 'https') {
          // HTTP/HTTPS 代理需要使用 CONNECT 方法或直接代理
          options.hostname = host;
          options.port = parseInt(port);
          options.path = testUrl;
          options.method = 'GET';
          options.headers = {
            'Host': 'httpbin.org',
            'User-Agent': 'TeleMsg-Proxy-Test/1.0'
          };
        }

        const timer = setTimeout(() => {
          resolve({
            success: false,
            message: '代理连接超时'
          });
        }, timeout);

        const req = http.request(options, (res) => {
          clearTimeout(timer);
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            if (res.statusCode === 200) {
              console.log('代理测试响应:', data);
              resolve({
                success: true,
                message: `${type.toUpperCase()} 代理连接成功`
              });
            } else {
              resolve({
                success: false,
                message: `代理响应错误: HTTP ${res.statusCode}`
              });
            }
          });
        });

        req.on('error', (error) => {
          clearTimeout(timer);
          console.error('代理验证失败:', error.message);
          resolve({
            success: false,
            message: `${type.toUpperCase()} 代理连接失败: ${error.message}`
          });
        });

        req.on('timeout', () => {
          clearTimeout(timer);
          req.destroy();
          resolve({
            success: false,
            message: '代理连接超时'
          });
        });

        req.end();
      });
    }
  } catch (error) {
    console.error('验证代理连接时出错:', error);
    return {
      success: false,
      message: '验证代理连接时出错: ' + error.message
    };
  }
});

// 处理应用协议（用于深度链接）
app.setAsDefaultProtocolClient('telemsg');

// 处理协议 URL
app.on('open-url', (event, url) => {
  event.preventDefault();
  console.log('Protocol URL:', url);
  // 这里可以处理 telemsg:// 协议的 URL
});

// 单实例应用
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时，聚焦到主窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
