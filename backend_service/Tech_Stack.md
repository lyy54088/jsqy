# 技术选型与架构说明

## 概述

本文档详细说明了健身教练应用后端服务的技术选型、架构设计和实施方案。我们采用现代化的技术栈，确保系统的可扩展性、可维护性和高性能。

## 技术选型

### 1. 核心技术栈

#### 后端框架
- **Node.js (v18+)**: 
  - 选择理由: 高性能的JavaScript运行时，丰富的生态系统，与前端技术栈统一
  - 优势: 非阻塞I/O、事件驱动、快速开发、社区活跃
  
- **Express.js (v4.18+)**:
  - 选择理由: 成熟稳定的Web框架，中间件生态丰富，学习成本低
  - 优势: 灵活性高、性能优秀、文档完善、社区支持好

#### 编程语言
- **TypeScript (v5.3+)**:
  - 选择理由: 提供静态类型检查，提高代码质量和开发效率
  - 优势: 类型安全、IDE支持好、重构友好、团队协作效率高

#### 数据库
- **MongoDB (v6.0+)**:
  - 选择理由: 文档型数据库，适合存储复杂的嵌套数据结构
  - 优势: 灵活的Schema、水平扩展能力、JSON原生支持、地理位置查询

#### 认证授权
- **JWT (JSON Web Tokens)**:
  - 选择理由: 无状态认证，适合分布式系统
  - 优势: 跨域支持、可扩展性好、安全性高

#### 密码加密
- **bcryptjs**:
  - 选择理由: 安全的密码哈希算法，防彩虹表攻击
  - 优势: 自适应成本、盐值自动生成、时间复杂度可调

### 2. 中间件和工具

#### 安全中间件
- **Helmet**: HTTP安全头设置
- **CORS**: 跨域资源共享配置
- **Rate Limiter**: API请求频率限制

#### 数据验证
- **Joi**: 强大的数据验证库
- 优势: 声明式验证、丰富的验证规则、错误信息友好

#### 文件处理
- **Multer**: 文件上传处理
- **Sharp**: 图片处理和优化

#### 日志记录
- **Morgan**: HTTP请求日志
- **Winston**: 应用日志管理

#### 开发工具
- **Nodemon**: 开发时自动重启
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化

## 系统架构

### 1. 整体架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用       │    │   后端API服务    │    │   数据库服务     │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   外部服务       │
                       │ (DeepSeek AI)   │
                       └─────────────────┘
```

### 2. 分层架构

```
┌─────────────────────────────────────────┐
│              路由层 (Routes)              │  ← HTTP请求入口
├─────────────────────────────────────────┤
│            控制器层 (Controllers)         │  ← 业务逻辑协调
├─────────────────────────────────────────┤
│             服务层 (Services)            │  ← 核心业务逻辑
├─────────────────────────────────────────┤
│           数据访问层 (DAL/Models)         │  ← 数据库操作
├─────────────────────────────────────────┤
│            中间件层 (Middleware)          │  ← 横切关注点
└─────────────────────────────────────────┘
```

### 3. 目录结构

```
backend_service/
├── src/
│   ├── config/              # 配置文件
│   │   ├── database.ts      # 数据库配置
│   │   ├── jwt.ts          # JWT配置
│   │   └── upload.ts       # 文件上传配置
│   ├── controllers/         # 控制器层
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── checkinController.ts
│   │   ├── contractController.ts
│   │   └── aiCoachController.ts
│   ├── middleware/          # 中间件
│   │   ├── auth.ts         # 认证中间件
│   │   ├── validation.ts   # 数据验证中间件
│   │   ├── errorHandler.ts # 错误处理中间件
│   │   └── rateLimiter.ts  # 速率限制中间件
│   ├── models/             # 数据模型
│   │   ├── User.ts
│   │   ├── CheckIn.ts
│   │   ├── Contract.ts
│   │   └── AICoachSession.ts
│   ├── routes/             # 路由定义
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── checkins.ts
│   │   ├── contracts.ts
│   │   ├── aicoach.ts
│   │   └── upload.ts
│   ├── services/           # 业务服务层
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── checkinService.ts
│   │   ├── contractService.ts
│   │   ├── aiCoachService.ts
│   │   └── uploadService.ts
│   ├── utils/              # 工具函数
│   │   ├── logger.ts
│   │   ├── validator.ts
│   │   ├── encryption.ts
│   │   └── helpers.ts
│   ├── types/              # TypeScript类型定义
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── checkin.ts
│   │   └── contract.ts
│   └── server.ts           # 应用入口
├── tests/                  # 测试文件
├── dist/                   # 编译输出
├── uploads/                # 文件上传目录
├── logs/                   # 日志文件
├── .env.example           # 环境变量示例
├── package.json
├── tsconfig.json
└── README.md
```

## 核心模块设计

### 1. 认证授权模块

```typescript
// JWT配置
interface JWTConfig {
  secret: string;
  expiresIn: string;
  issuer: string;
  audience: string;
}

// 认证中间件
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};
```

### 2. 数据验证模块

```typescript
// 使用Joi进行数据验证
const userRegistrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required(),
  profile: Joi.object({
    name: Joi.string().max(50),
    age: Joi.number().integer().min(10).max(120),
    height: Joi.number().min(50).max(300),
    weight: Joi.number().min(20).max(500),
    goal: Joi.string().max(200)
  }).optional()
});
```

### 3. 错误处理模块

```typescript
// 统一错误处理
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 错误处理中间件
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  // MongoDB错误处理
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // 重复字段错误
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};
```

## 性能优化策略

### 1. 数据库优化
- **索引策略**: 为常用查询字段创建合适的索引
- **连接池**: 配置合理的连接池大小
- **查询优化**: 使用聚合管道优化复杂查询
- **数据分页**: 实现高效的分页查询

### 2. 缓存策略
- **内存缓存**: 使用Redis缓存热点数据
- **查询缓存**: 缓存频繁查询的结果
- **会话缓存**: 缓存用户会话信息

### 3. API优化
- **响应压缩**: 使用gzip压缩响应数据
- **请求限流**: 防止API滥用
- **异步处理**: 使用队列处理耗时操作
- **CDN加速**: 静态资源使用CDN分发

## 安全策略

### 1. 认证安全
- **密码策略**: 强制复杂密码，定期更换
- **JWT安全**: 使用强随机密钥，设置合理过期时间
- **多因素认证**: 支持短信/邮箱验证码

### 2. 数据安全
- **输入验证**: 严格验证所有输入数据
- **SQL注入防护**: 使用参数化查询
- **XSS防护**: 对输出内容进行转义
- **CSRF防护**: 使用CSRF令牌

### 3. 传输安全
- **HTTPS**: 强制使用HTTPS传输
- **CORS配置**: 限制跨域访问来源
- **安全头**: 设置安全相关的HTTP头

## 监控和日志

### 1. 应用监控
- **性能监控**: 监控API响应时间和吞吐量
- **错误监控**: 实时监控应用错误和异常
- **资源监控**: 监控CPU、内存、磁盘使用情况

### 2. 日志管理
- **结构化日志**: 使用JSON格式记录日志
- **日志级别**: 区分不同级别的日志信息
- **日志轮转**: 定期轮转和压缩日志文件
- **集中化日志**: 使用ELK栈进行日志分析

### 3. 健康检查
```typescript
// 健康检查端点
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: await checkDatabaseHealth(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage()
  };
  
  res.status(200).json(health);
});
```

## 部署策略

### 1. 容器化部署
```dockerfile
# Dockerfile示例
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### 2. 环境配置
- **开发环境**: 本地开发，热重载
- **测试环境**: 自动化测试，CI/CD集成
- **生产环境**: 高可用部署，负载均衡

### 3. CI/CD流程
```yaml
# GitHub Actions示例
name: Deploy Backend
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build application
        run: npm run build
      - name: Deploy to production
        run: npm run deploy
```

## 扩展性考虑

### 1. 微服务架构
- **服务拆分**: 按业务领域拆分服务
- **API网关**: 统一入口和路由
- **服务发现**: 动态服务注册和发现

### 2. 数据库扩展
- **读写分离**: 主从复制，读写分离
- **分库分表**: 水平分片，提高并发能力
- **缓存层**: 多级缓存，减少数据库压力

### 3. 消息队列
- **异步处理**: 使用消息队列处理耗时任务
- **事件驱动**: 基于事件的松耦合架构
- **削峰填谷**: 平滑处理突发流量

这个技术选型方案提供了现代化、可扩展、高性能的后端架构，能够满足健身教练应用的各种需求，并为未来的扩展留有充分的空间。