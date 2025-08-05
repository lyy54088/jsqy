/**
 * 图片代理工具
 * 解决跨域图片加载问题
 */

// 图片代理服务配置
const PROXY_SERVICES = {
  // 使用免费的图片代理服务
  CORS_ANYWHERE: 'https://cors-anywhere.herokuapp.com/',
  // 或者使用其他代理服务
  ALLORIGINS: 'https://api.allorigins.win/raw?url=',
  // 本地代理（如果有的话）
  LOCAL: '/api/proxy?url='
};

/**
 * 获取代理后的图片URL
 * @param originalUrl 原始图片URL
 * @param useProxy 是否使用代理
 * @returns 代理后的URL或原始URL
 */
export const getProxiedImageUrl = (originalUrl: string, useProxy: boolean = true): string => {
  // 如果是本地图片或data URL，直接返回
  if (!originalUrl || 
      originalUrl.startsWith('data:') || 
      originalUrl.startsWith('blob:') || 
      originalUrl.startsWith('/') ||
      originalUrl.startsWith('./') ||
      originalUrl.includes('localhost')) {
    return originalUrl;
  }

  // 如果不使用代理，直接返回原始URL
  if (!useProxy) {
    return originalUrl;
  }

  // 使用AllOrigins代理服务
  return `${PROXY_SERVICES.ALLORIGINS}${encodeURIComponent(originalUrl)}`;
};

/**
 * 创建一个安全的图片元素
 * @param src 图片源
 * @param fallbackSrc 备用图片源
 * @returns Promise<HTMLImageElement>
 */
export const createSafeImage = (src: string, fallbackSrc?: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // 设置跨域属性
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve(img);
    
    img.onerror = () => {
      if (fallbackSrc && fallbackSrc !== src) {
        // 尝试备用图片
        createSafeImage(fallbackSrc).then(resolve).catch(reject);
      } else {
        reject(new Error(`Failed to load image: ${src}`));
      }
    };
    
    // 首先尝试代理URL
    img.src = getProxiedImageUrl(src);
  });
};

/**
 * 生成默认头像
 * @param name 用户名
 * @param size 头像尺寸
 * @returns SVG格式的头像URL
 */
export const generateDefaultAvatar = (name: string, size: number = 150): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  
  const initial = name.charAt(0).toUpperCase();
  const colorIndex = name.charCodeAt(0) % colors.length;
  const backgroundColor = colors[colorIndex];
  
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${backgroundColor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size/3}" fill="white" text-anchor="middle" dy=".3em">${initial}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * 替换外部图片URL为安全的本地或代理URL
 * @param url 原始URL
 * @param fallbackName 备用名称（用于生成默认头像）
 * @returns 安全的图片URL
 */
export const getSafeImageUrl = (url: string, fallbackName: string = 'User'): string => {
  // 如果是外部URL（特别是Unsplash），使用默认头像
  if (url && (url.includes('unsplash.com') || url.includes('images.unsplash.com'))) {
    console.warn('External image URL detected, using default avatar:', url);
    return generateDefaultAvatar(fallbackName);
  }
  
  // 如果是其他外部URL，尝试代理
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    return getProxiedImageUrl(url);
  }
  
  // 本地URL或data URL直接返回
  return url || generateDefaultAvatar(fallbackName);
};