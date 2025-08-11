// PWA相关工具函数

/**
 * 注册Service Worker
 */
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker注册成功:', registration.scope);
      
      // 监听更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 新的Service Worker已安装，提示用户刷新
              if (confirm('应用有新版本可用，是否立即更新？')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
    } catch (error: unknown) {
      console.error('Service Worker注册失败:', error);
    }
  } else {
    console.log('当前浏览器不支持Service Worker');
  }
};

/**
 * 检查是否为PWA模式
 */
export const isPWAMode = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as unknown as { standalone?: boolean }).standalone === true;
};

/**
 * 检查是否支持PWA安装
 */
export const canInstallPWA = (): boolean => {
  return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
};

/**
 * 请求通知权限
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    console.log('通知权限:', permission);
    return permission;
  }
  return 'denied';
};

/**
 * 发送本地通知
 */
export const sendNotification = (title: string, options?: NotificationOptions): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options
    });
    
    // 3秒后自动关闭
    setTimeout(() => {
      notification.close();
    }, 3000);
  }
};

/**
 * 检查网络状态
 */
export const getNetworkStatus = (): { online: boolean; effectiveType?: string } => {
  const nav = navigator as unknown as { 
    connection?: { effectiveType?: string }; 
    mozConnection?: { effectiveType?: string }; 
    webkitConnection?: { effectiveType?: string }; 
  };
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  
  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType
  };
};

/**
 * 监听网络状态变化
 */
export const onNetworkChange = (callback: (online: boolean) => void): (() => void) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // 返回清理函数
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

/**
 * 缓存重要数据到localStorage
 */
export const cacheData = (key: string, data: unknown): void => {
  try {
    localStorage.setItem(`pwa_cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error: unknown) {
      console.error('缓存数据失败:', error);
    }
};

/**
 * 从localStorage获取缓存数据
 */
export const getCachedData = (key: string, maxAge: number = 24 * 60 * 60 * 1000): unknown => {
  try {
    const cached = localStorage.getItem(`pwa_cache_${key}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < maxAge) {
        return data;
      }
    }
  } catch (error: unknown) {
    console.error('获取缓存数据失败:', error);
  }
  return null;
};

/**
 * 清理过期缓存
 */
export const clearExpiredCache = (): void => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('pwa_cache_')) {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const { timestamp } = JSON.parse(cached);
          // 清理超过7天的缓存
          if (Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // 如果解析失败，直接删除
        localStorage.removeItem(key);
      }
    }
  });
};