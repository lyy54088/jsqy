import React, { useState, useEffect } from 'react';
import { getSafeImageUrl, generateDefaultAvatar } from '@/lib/image-proxy';

interface SafeImageProps {
  src: string;
  alt: string;
  fallbackName?: string;
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
}

/**
 * 安全图片组件
 * 自动处理跨域图片加载问题，提供备用方案
 */
const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackName = 'User',
  className = '',
  onError,
  onLoad
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    
    // 获取安全的图片URL
    const safeSrc = getSafeImageUrl(src, fallbackName);
    setCurrentSrc(safeSrc);
  }, [src, fallbackName]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setIsLoading(false);
      
      // 如果加载失败，使用默认头像
      const defaultAvatar = generateDefaultAvatar(fallbackName);
      setCurrentSrc(defaultAvatar);
      
      onError?.();
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-gray-400 text-sm">加载中...</div>
        </div>
      )}
      
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onError={handleError}
        onLoad={handleLoad}
        crossOrigin="anonymous"
      />
      
      {hasError && (
        <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded">
          备用
        </div>
      )}
    </div>
  );
};

export default SafeImage;