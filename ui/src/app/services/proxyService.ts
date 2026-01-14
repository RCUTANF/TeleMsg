/**
 * 代理服务 - 与Electron主进程通信以管理代理设置
 */

export interface ProxySettings {
  enabled: boolean;
  host: string;
  port: string;
  type: 'http' | 'https' | 'socks5';
}

export interface ProxyResponse {
  success: boolean;
  message?: string;
  data?: ProxySettings;
}

/**
 * 检查是否在Electron环境中
 */
export function isElectronEnvironment(): boolean {
  return typeof window !== 'undefined' && !!(window as any).electronAPI?.proxy;
}

/**
 * 保存代理设置 - 优先使用Electron API，降级到localStorage
 */
export async function setProxySettings(settings: ProxySettings): Promise<ProxyResponse> {
  try {
    // 验��必填字段
    if (settings.enabled) {
      if (!settings.host?.trim()) {
        return {
          success: false,
          message: '代理服务器地址不能为空'
        };
      }
      if (!settings.port?.trim()) {
        return {
          success: false,
          message: '代理端口不能为空'
        };
      }

      // 验证端口号
      const port = parseInt(settings.port);
      if (isNaN(port) || port < 1 || port > 65535) {
        return {
          success: false,
          message: '请输入有效的端口号 (1-65535)'
        };
      }
    }

    // 优先使用Electron API
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.proxy?.setProxySettings) {
      return await electronAPI.proxy.setProxySettings(settings);
    }

    // 降级方案：保存到localStorage
    localStorage.setItem('proxySettings', JSON.stringify(settings));
    return {
      success: true,
      message: '代理设置已保存（本地存储）'
    };
  } catch (error) {
    console.error('保存代理设置失败:', error);
    return {
      success: false,
      message: `保存代理设置失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}

/**
 * 获取代理设置 - 优先使用Electron API，降级到localStorage
 */
export async function getProxySettings(): Promise<ProxyResponse> {
  try {
    const electronAPI = (window as any).electronAPI;

    // 优先使用Electron API
    if (electronAPI?.proxy?.getProxySettings) {
      return await electronAPI.proxy.getProxySettings();
    }

    // 降级方案：从localStorage读取
    const saved = localStorage.getItem('proxySettings');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        return {
          success: true,
          data: config
        };
      } catch {
        return {
          success: true,
          data: {
            enabled: false,
            host: '',
            port: '',
            type: 'http'
          }
        };
      }
    }

    return {
      success: true,
      data: {
        enabled: false,
        host: '',
        port: '',
        type: 'http'
      }
    };
  } catch (error) {
    console.error('获取代理设置失败:', error);
    return {
      success: false,
      message: `获取代理设置失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}

/**
 * 验证代理连接
 */
export async function validateProxyConnection(settings: Omit<ProxySettings, 'enabled'>): Promise<ProxyResponse> {
  try {
    if (!settings.host?.trim()) {
      return {
        success: false,
        message: '代理服务器地址不能为空'
      };
    }
    if (!settings.port?.trim()) {
      return {
        success: false,
        message: '代理端口不能为空'
      };
    }

    // 验证端口号
    const port = parseInt(settings.port);
    if (isNaN(port) || port < 1 || port > 65535) {
      return {
        success: false,
        message: '请输入有效的端口号 (1-65535)'
      };
    }

    const electronAPI = (window as any).electronAPI;

    // 使用Electron API验证
    if (electronAPI?.proxy?.validateProxyConnection) {
      console.log('使用 Electron API 验证代理连接:', settings);
      return await electronAPI.proxy.validateProxyConnection(settings);
    }

    // 在浏览器环境中，尝试进行基本的连接检测
    console.log('在浏览器环境中进行代理验证:', settings);

    try {
      // 创建一个简单的fetch请求来测试网络连接
      // 注意：这不是真正的代理测试，只是测试网络连接
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://httpbin.org/ip', {
        signal: controller.signal,
        method: 'GET',
        mode: 'cors'
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return {
          success: true,
          message: '网络连接正常（注意：浏览器环境无法直接测试代理连接）'
        };
      } else {
        return {
          success: false,
          message: '网络连接失败'
        };
      }
    } catch (fetchError) {
      return {
        success: false,
        message: `网络连接测试失败: ${fetchError instanceof Error ? fetchError.message : '未知错误'}`
      };
    }
  } catch (error) {
    console.error('验证代理连接失败:', error);
    return {
      success: false,
      message: `验证代理连接失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}

/**
 * 清除所有代理设置
 */
export async function clearProxySettings(): Promise<ProxyResponse> {
  try {
    const emptySettings: ProxySettings = {
      enabled: false,
      host: '',
      port: '',
      type: 'http'
    };

    return await setProxySettings(emptySettings);
  } catch (error) {
    console.error('清除代理设置失败:', error);
    return {
      success: false,
      message: `清除代理设置失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}

