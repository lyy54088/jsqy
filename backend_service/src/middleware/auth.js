const jwt = require('jsonwebtoken');

/**
 * JWT认证中间件
 * 验证请求头中的JWT token
 */
const authMiddleware = (req, res, next) => {
  try {
    // 从请求头获取token
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: '访问被拒绝，缺少认证token'
      });
    }

    // 检查token格式 (Bearer <token>)
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '无效的token格式'
      });
    }

    // 提取token
    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问被拒绝，token为空'
      });
    }

    // 验证token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret);
    
    // 将用户信息添加到请求对象
    req.user = {
      id: decoded.userId,
      phone: decoded.phone,
      iat: decoded.iat,
      exp: decoded.exp
    };

    // 检查token是否即将过期（30分钟内）
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - now;
    
    if (timeUntilExpiry < 1800) { // 30分钟
      // 在响应头中添加刷新提示
      res.set('X-Token-Refresh-Needed', 'true');
      res.set('X-Token-Expires-In', timeUntilExpiry.toString());
    }

    next();

  } catch (error) {
    console.error('JWT验证失败:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'token已过期，请重新登录',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的token',
        code: 'INVALID_TOKEN'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 可选认证中间件
 * 如果有token则验证，没有token则继续执行
 */
const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // 没有token，继续执行
    return next();
  }

  // 有token，使用标准认证中间件
  authMiddleware(req, res, next);
};

/**
 * 管理员认证中间件
 * 需要先通过基础认证，然后检查管理员权限
 */
const adminAuthMiddleware = (req, res, next) => {
  // 先进行基础认证
  authMiddleware(req, res, (err) => {
    if (err) return next(err);
    
    // 检查管理员权限
    // 这里可以从数据库查询用户角色，或者从token中获取角色信息
    const isAdmin = req.user.role === 'admin' || req.user.isAdmin;
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: '访问被拒绝，需要管理员权限'
      });
    }
    
    next();
  });
};

/**
 * 生成JWT token
 * @param {Object} payload - token载荷
 * @param {string} expiresIn - 过期时间
 * @returns {string} JWT token
 */
const generateToken = (payload, expiresIn = '24h') => {
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign(payload, jwtSecret, { expiresIn });
};

/**
 * 验证JWT token
 * @param {string} token - JWT token
 * @returns {Object} 解码后的载荷
 */
const verifyToken = (token) => {
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.verify(token, jwtSecret);
};

/**
 * 刷新JWT token
 * @param {string} token - 旧的JWT token
 * @returns {string} 新的JWT token
 */
const refreshToken = (token) => {
  try {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret, { ignoreExpiration: true });
    
    // 创建新的载荷（移除时间戳）
    const { iat, exp, ...payload } = decoded;
    
    // 生成新token
    return generateToken(payload);
    
  } catch (error) {
    throw new Error('无法刷新token');
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  adminAuthMiddleware,
  generateToken,
  verifyToken,
  refreshToken
};