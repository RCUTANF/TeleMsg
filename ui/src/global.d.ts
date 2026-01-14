export {};

declare global {
  interface Window {
    electronAPI: {
      // App version
      getAppVersion: () => Promise<string>;
      showMessageBox: (options: any) => Promise<any>;

      // Proxy settings API
      proxy: {
        setProxySettings: (settings: {
          enabled: boolean;
          host: string;
          port: string;
          type: string;
        }) => Promise<{ success: boolean; message: string }>;

        getProxySettings: () => Promise<{
          success: boolean;
          data?: { enabled: boolean; host: string; port: string; type: string };
          message?: string;
        }>;

        validateProxyConnection: (settings: {
          host: string;
          port: string;
          type: string;
        }) => Promise<{ success: boolean; message: string }>;
      };

      // Platform info
      platform: string;
      isElectron: boolean;

      // Event listeners
      onMenuAction: (callback: (event: any, action: string) => void) => () => void;
    };
  }
}

