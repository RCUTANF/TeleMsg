/**
 * 自定义Hook - 管理代理设置
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getProxySettings,
  setProxySettings,
  validateProxyConnection,
  type ProxySettings,
  type ProxyResponse
} from '../services/proxyService';

export interface UseProxySettingsResult {
  // 状态
  proxyEnabled: boolean;
  proxyHost: string;
  proxyPort: string;
  proxyType: 'http' | 'https' | 'socks5';
  loading: boolean;
  validating: boolean;
  error: string | null;

  // 更新函数
  setProxyEnabled: (enabled: boolean) => void;
  setProxyHost: (host: string) => void;
  setProxyPort: (port: string) => void;
  setProxyType: (type: 'http' | 'https' | 'socks5') => void;

  // 操作函数
  loadProxySettings: () => Promise<ProxyResponse>;
  saveProxySettings: () => Promise<ProxyResponse>;
  validateProxy: () => Promise<ProxyResponse>;
  clearProxySettings: () => Promise<ProxyResponse>;
}

/**
 * 使用代理设置Hook
 * @param shouldLoadOnMount 是否在挂载时加载代理设置
 */
export function useProxySettings(shouldLoadOnMount = true): UseProxySettingsResult {
  const [proxyEnabled, setProxyEnabled] = useState(false);
  const [proxyHost, setProxyHost] = useState('');
  const [proxyPort, setProxyPort] = useState('');
  const [proxyType, setProxyType] = useState<'http' | 'https' | 'socks5'>('http');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载代理设置
  const loadProxySettings = useCallback(async (): Promise<ProxyResponse> => {
    try {
      setLoading(true);
      setError(null);
      const result = await getProxySettings();

      if (result.success && result.data) {
        setProxyEnabled(result.data.enabled);
        setProxyHost(result.data.host);
        setProxyPort(result.data.port);
        setProxyType(result.data.type);
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      setError(message);
      console.error('加载代理设置出错:', message);
      return {
        success: false,
        message
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存代理设置
  const saveProxySettings = useCallback(async (): Promise<ProxyResponse> => {
    try {
      setValidating(true);
      setError(null);

      const settings: ProxySettings = {
        enabled: proxyEnabled,
        host: proxyHost,
        port: proxyPort,
        type: proxyType
      };

      const result = await setProxySettings(settings);

      if (!result.success) {
        setError(result.message || '保存失败');
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      setError(message);
      console.error('保存代理设置出错:', message);
      return {
        success: false,
        message
      };
    } finally {
      setValidating(false);
    }
  }, [proxyEnabled, proxyHost, proxyPort, proxyType]);

  // 验证代理连接
  const validateProxy = useCallback(async (): Promise<ProxyResponse> => {
    try {
      setValidating(true);
      setError(null);

      const result = await validateProxyConnection({
        host: proxyHost,
        port: proxyPort,
        type: proxyType
      });

      if (!result.success) {
        setError(result.message || '验证失败');
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      setError(message);
      console.error('验证代理连接出错:', message);
      return {
        success: false,
        message
      };
    } finally {
      setValidating(false);
    }
  }, [proxyHost, proxyPort, proxyType]);

  // 清除代理设置
  const clearProxySettings = useCallback(async (): Promise<ProxyResponse> => {
    try {
      setValidating(true);
      setError(null);

      const emptySettings: ProxySettings = {
        enabled: false,
        host: '',
        port: '',
        type: 'http'
      };

      const result = await setProxySettings(emptySettings);

      if (result.success) {
        setProxyEnabled(false);
        setProxyHost('');
        setProxyPort('');
        setProxyType('http');
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      setError(message);
      console.error('清除代理设置出错:', message);
      return {
        success: false,
        message
      };
    } finally {
      setValidating(false);
    }
  }, []);

  // 挂载时加载设置
  useEffect(() => {
    if (shouldLoadOnMount) {
      loadProxySettings();
    }
  }, [shouldLoadOnMount, loadProxySettings]);

  return {
    // 状态
    proxyEnabled,
    proxyHost,
    proxyPort,
    proxyType,
    loading,
    validating,
    error,

    // 更新函数
    setProxyEnabled,
    setProxyHost,
    setProxyPort,
    setProxyType,

    // 操作函数
    loadProxySettings,
    saveProxySettings,
    validateProxy,
    clearProxySettings
  };
}

