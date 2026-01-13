const { contextBridge, ipcRenderer } = require('electron');

// 暴露保护的方法给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取应用版本
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // 显示消息框
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),

  // 平台信息
  platform: process.platform,

  // 应用信息
  isElectron: true,

  // 事件监听器
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', callback);
    return () => ipcRenderer.removeListener('menu-action', callback);
  }
});

// 防止渲染进程访问 Node.js API
delete window.require;
delete window.exports;
delete window.module;
