const rateLimit = require('express-rate-limit');

// 简化版本，使用内存存储
// 在生产环境中建议使用Redis存储以支持多实例部署

/**
 * 创建限流中间件
 * @param {Object} options - 限流配置
 * @returns {Function} 限流中间件
 */
const createRateLimit = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 最大请求次数
    message: {
      success: false,
      message: '请求过于频繁，请稍后再试',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true, // 返回标准的限流头信息
    legacyHeaders: false, // 禁用旧版头信息
    // 自定义键生成器
    keyGenerator: (req) => {
      // 优先使用用户ID，其次使用IP地址
      return req.user?.id || req.ip;
    },
    // 自定义跳过条件
    skip: (req) => {
      // 跳过健康检查等特殊路径
      const skipPaths = ['/health', '/ping', '/status'];
      return skipPaths.includes(req.path);
    },
    // 自定义处理器
    handler: (req, res) => {
      const retryAfter = Math.round(options.windowMs / 1000) || 900;
      
      res.status(429).json({
        success: false,
        message: '请求过于频繁，请稍后再试',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter,
        limit: options.max || 100,
        windowMs: options.windowMs || 900000
      });
    }
  };

  // 合并配置
  const config = { ...defaultOptions, ...options };

  // 如果有Redis客户端，使用Redis存储
  if (redisClient) {
    config.store = new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix: 'rl:fitness-coach:'
    });
  }

  return rateLimit(config);
};

/**
 * 通用API限流
 * 每15分钟最多100次请求
 */
const generalRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 限制每个IP 100次请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // 优先使用真实IP，然后是转发IP，最后是连接IP
    return req.ip || req.connection.remoteAddress;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: '请求过于频繁，请稍后再试',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * 严格限流中间件
 * 每5分钟最多10次请求
 */
const strictRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * 支付相关限流中间件
 * 每分钟最多5次请求
 */
const paymentRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: '支付请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * 登录限流中间件
 * 每15分钟最多5次登录尝试
 */
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: '登录尝试过于频繁，请15分钟后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * 短信发送限流中间件
 * 每小时最多10条短信
 */
const smsRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: '短信发送过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * 文件上传限流中间件
 * 每小时最多50次上传
 */
const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: '文件上传过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * 动态限流中间件
 * 根据用户类型和操作类型动态调整限流策略
 */
const dynamicRateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    maxRequests = 100,
    premiumMultiplier = 2,
    adminMultiplier = 5
  } = options;

  return rateLimit({
    windowMs,
    max: (req) => {
      // 根据用户类型调整限制
      if (req.user) {
        if (req.user.role === 'admin') {
          return maxRequests * adminMultiplier;
        }
        if (req.user.isPremium) {
          return maxRequests * premiumMultiplier;
        }
      }
      return maxRequests;
    },
    message: {
      success: false,
      message: '请求过于频繁，请稍后再试'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

/**
 * 获取限流状态
 */
const getRateLimitStatus = async (req, res, next) => {
  try {
    // 简化版本，返回基本信息
    req.rateLimitStatus = {
      remaining: 'unknown',
      resetTime: 'unknown',
      totalHits: 'unknown',
      note: '使用内存存储，无法获取详细状态'
    };
    
    next();
  } catch (error) {
    console.error('获取限流状态失败:', error);
    next();
  }
};

/**
 * 重置限流计数
 */
const resetRateLimit = async (req, res, next) => {
  try {
    res.status(501).json({
      success: false,
      message: '当前使用内存存储，无法重置限流计数'
    });
  } catch (error) {
    console.error('重置限流计数失败:', error);
    res.status(500).json({
      success: false,
      message: '重置限流计数失败'
    });
  }
};

module.exports = {
  createRateLimit,
  generalRateLimit,
  strictRateLimit,
  paymentRateLimit,
  loginRateLimit,
  smsRateLimit,
  uploadRateLimit,
  dynamicRateLimit,
  getRateLimitStatus,
  resetRateLimit
};