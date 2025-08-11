# AI健身教练 - 保证金管理系统代码结构

## 项目概览

保证金管理系统采用分层架构设计，遵循关注点分离原则，确保代码的可维护性、可测试性和可扩展性。

## 目录结构

```
backend_service/
├── src/                          # 源代码目录
│   ├── config/                   # 配置文件
│   │   ├── database.ts           # 数据库连接配置
│   │   ├── jwt.ts               # JWT认证配置
│   │   ├── upload.ts            # 文件上传配置
│   │   ├── redis.ts             # Redis缓存配置
│   │   └── index.ts             # 配置文件入口
│   ├── controllers/              # 控制器层
│   │   ├── authController.ts     # 认证控制器
│   │   ├── userController.ts     # 用户管理控制器
│   │   ├── checkinController.ts  # 打卡记录控制器
│   │   ├── contractController.ts # 契约管理控制器
│   │   ├── aiCoachController.ts  # AI教练控制器
│   │   ├── uploadController.ts   # 文件上传控制器
│   │   └── index.ts             # 控制器入口
│   ├── middleware/               # 中间件
│   │   ├── auth.ts              # 认证中间件
│   │   ├── validation.ts        # 数据验证中间件
│   │   ├── errorHandler.ts      # 错误处理中间件
│   │   ├── rateLimiter.ts       # 速率限制中间件
│   │   ├── logger.ts            # 日志中间件
│   │   ├── cors.ts              # CORS中间件
│   │   └── index.ts             # 中间件入口
│   ├── models/                   # 数据模型
│   │   ├── User.ts              # 用户模型
│   │   ├── CheckIn.ts           # 打卡记录模型
│   │   ├── Contract.ts          # 契约模型
│   │   ├── AICoachSession.ts    # AI教练会话模型
│   │   ├── base/                # 基础模型
│   │   │   ├── BaseModel.ts     # 基础模型类
│   │   │   └── index.ts
│   │   └── index.ts             # 模型入口
│   ├── routes/                   # 路由定义
│   │   ├── auth.ts              # 认证路由
│   │   ├── users.ts             # 用户路由
│   │   ├── checkins.ts          # 打卡记录路由
│   │   ├── contracts.ts         # 契约路由
│   │   ├── aicoach.ts           # AI教练路由
│   │   ├── upload.ts            # 文件上传路由
│   │   ├── health.ts            # 健康检查路由
│   │   └── index.ts             # 路由入口
│   ├── services/                 # 业务服务层
│   │   ├── authService.ts       # 认证服务
│   │   ├── userService.ts       # 用户服务
│   │   ├── checkinService.ts    # 打卡记录服务
│   │   ├── contractService.ts   # 契约服务
│   │   ├── aiCoachService.ts    # AI教练服务
│   │   ├── uploadService.ts     # 文件上传服务
│   │   ├── emailService.ts      # 邮件服务
│   │   ├── smsService.ts        # 短信服务
│   │   ├── external/            # 外部服务
│   │   │   ├── foodAnalysisAPI.ts # 食物分析API
│   │   │   └── index.ts
│   │   └── index.ts             # 服务入口
│   ├── utils/                    # 工具函数
│   │   ├── logger.ts            # 日志工具
│   │   ├── validator.ts         # 数据验证工具
│   │   ├── encryption.ts        # 加密工具
│   │   ├── helpers.ts           # 通用辅助函数
│   │   ├── constants.ts         # 常量定义
│   │   ├── errors.ts            # 错误类定义
│   │   └── index.ts             # 工具入口
│   ├── types/                    # TypeScript类型定义
│   │   ├── auth.ts              # 认证相关类型
│   │   ├── user.ts              # 用户相关类型
│   │   ├── checkin.ts           # 打卡记录类型
│   │   ├── contract.ts          # 契约相关类型
│   │   ├── aicoach.ts           # AI教练类型
│   │   ├── common.ts            # 通用类型
│   │   ├── api.ts               # API响应类型
│   │   └── index.ts             # 类型入口
│   ├── database/                 # 数据库相关
│   │   ├── connection.ts        # 数据库连接
│   │   ├── migrations/          # 数据迁移
│   │   ├── seeds/               # 种子数据
│   │   └── index.ts
│   ├── jobs/                     # 定时任务
│   │   ├── contractChecker.ts   # 契约检查任务
│   │   ├── dataCleanup.ts       # 数据清理任务
│   │   ├── reportGenerator.ts   # 报告生成任务
│   │   └── index.ts
│   └── server.ts                 # 应用入口文件
├── tests/                        # 测试文件
│   ├── unit/                     # 单元测试
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   ├── integration/              # 集成测试
│   │   ├── auth.test.ts
│   │   ├── users.test.ts
│   │   └── checkins.test.ts
│   ├── e2e/                      # 端到端测试
│   ├── fixtures/                 # 测试数据
│   ├── helpers/                  # 测试辅助函数
│   └── setup.ts                  # 测试环境设置
├── dist/                         # 编译输出目录
├── uploads/                      # 文件上传目录
│   ├── images/
│   ├── temp/
│   └── .gitkeep
├── logs/                         # 日志文件目录
│   ├── app.log
│   ├── error.log
│   └── access.log
├── docs/                         # 文档目录
│   ├── api/                      # API文档
│   ├── deployment/               # 部署文档
│   └── development/              # 开发文档
├── scripts/                      # 脚本文件
│   ├── build.sh                 # 构建脚本
│   ├── deploy.sh                # 部署脚本
│   ├── backup.sh                # 备份脚本
│   └── migrate.sh               # 迁移脚本
├── .env.example                  # 环境变量示例
├── .env.development              # 开发环境变量
├── .env.test                     # 测试环境变量
├── .gitignore                    # Git忽略文件
├── .eslintrc.js                  # ESLint配置
├── .prettierrc                   # Prettier配置
├── jest.config.js                # Jest测试配置
├── nodemon.json                  # Nodemon配置
├── package.json                  # 项目依赖
├── tsconfig.json                 # TypeScript配置
├── docker-compose.yml            # Docker Compose配置
├── Dockerfile                    # Docker镜像配置
└── README.md                     # 项目说明
```

## 分层架构详解

### 1. 路由层 (Routes)

**职责**: 定义API端点，处理HTTP请求路由

```typescript
// routes/users.ts
import { Router } from 'express';
import { userController } from '../controllers';
import { auth, validate } from '../middleware';
import { userValidation } from '../utils/validator';

const router = Router();

// 获取用户信息
router.get('/profile', auth, userController.getProfile);

// 更新用户信息
router.put('/profile', 
  auth, 
  validate(userValidation.updateProfile), 
  userController.updateProfile
);

// 修改密码
router.put('/password', 
  auth, 
  validate(userValidation.changePassword), 
  userController.changePassword
);

export default router;
```

### 2. 控制器层 (Controllers)

**职责**: 处理HTTP请求，协调业务逻辑，返回响应

```typescript
// controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import { userService } from '../services';
import { ApiResponse } from '../types';
import { AppError } from '../utils/errors';

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const user = await userService.getUserById(userId);
      
      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        message: '获取用户信息成功'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      
      const updatedUser = await userService.updateUser(userId, updateData);
      
      const response: ApiResponse = {
        success: true,
        data: updatedUser,
        message: '用户信息更新成功'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
```

### 3. 服务层 (Services)

**职责**: 实现核心业务逻辑，处理数据操作

```typescript
// services/userService.ts
import { User } from '../models';
import { UserUpdateData, UserProfile } from '../types';
import { AppError } from '../utils/errors';
import bcrypt from 'bcryptjs';

export class UserService {
  async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      const user = await User.findById(userId).select('-password');
      return user;
    } catch (error) {
      throw new AppError('获取用户信息失败', 500);
    }
  }

  async updateUser(userId: string, updateData: UserUpdateData): Promise<UserProfile> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError('邮箱或用户名已存在', 409);
      }
      throw new AppError('更新用户信息失败', 500);
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new AppError('当前密码错误', 400);
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      await User.findByIdAndUpdate(userId, { 
        password: hashedNewPassword,
        updatedAt: new Date()
      });
    } catch (error) {
      throw error;
    }
  }
}

export const userService = new UserService();
```

### 4. 模型层 (Models)

**职责**: 定义数据结构，处理数据库操作

```typescript
// models/User.ts
import { Schema, model, Document } from 'mongoose';
import { IUser } from '../types';

interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    name: { type: String, trim: true },
    age: { type: Number, min: 10, max: 120 },
    height: { type: Number, min: 50, max: 300 },
    weight: { type: Number, min: 20, max: 500 },
    goal: { type: String, trim: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// 索引
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: 1 });

export const User = model<IUserDocument>('User', userSchema);
```

### 5. 中间件层 (Middleware)

**职责**: 处理横切关注点，如认证、验证、日志等

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors';
import { JWTPayload } from '../types';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('访问令牌缺失', 401);
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('无效的访问令牌', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError('访问令牌已过期', 401));
    } else {
      next(error);
    }
  }
};

// middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { AppError } from '../utils/errors';

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new AppError(errorMessage, 400);
    }
    
    next();
  };
};
```

## 代码规范

### 1. 命名规范

- **文件名**: 使用camelCase，如 `userController.ts`
- **类名**: 使用PascalCase，如 `UserService`
- **函数名**: 使用camelCase，如 `getUserById`
- **常量**: 使用UPPER_SNAKE_CASE，如 `JWT_SECRET`
- **接口**: 使用PascalCase，前缀I，如 `IUser`

### 2. 目录命名

- 使用小写字母和连字符
- 复数形式表示集合，如 `controllers`, `services`
- 单数形式表示单个概念，如 `config`, `middleware`

### 3. 导入导出规范

```typescript
// 统一使用命名导出
export class UserService { }
export const userService = new UserService();

// 在index.ts中重新导出
export { userService } from './userService';
export { checkinService } from './checkinService';

// 导入时使用解构
import { userService, checkinService } from '../services';
```

### 4. 错误处理规范

```typescript
// 统一的错误类
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 在服务层抛出业务错误
if (!user) {
  throw new AppError('用户不存在', 404);
}

// 在控制器层捕获并传递给错误处理中间件
try {
  const result = await userService.getUser(id);
  res.json(result);
} catch (error) {
  next(error);
}
```

### 5. 异步处理规范

```typescript
// 统一使用async/await
export class UserService {
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      return await user.save();
    } catch (error) {
      throw new AppError('创建用户失败', 500);
    }
  }
}

// 避免使用Promise.then()
// ❌ 不推荐
userService.createUser(data).then(user => {
  res.json(user);
}).catch(error => {
  next(error);
});

// ✅ 推荐
try {
  const user = await userService.createUser(data);
  res.json(user);
} catch (error) {
  next(error);
}
```

## 测试策略

### 1. 单元测试

```typescript
// tests/unit/services/userService.test.ts
import { userService } from '../../../src/services';
import { User } from '../../../src/models';
import { AppError } from '../../../src/utils/errors';

jest.mock('../../../src/models');

describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when user exists', async () => {
      const mockUser = { _id: '123', username: 'test', email: 'test@example.com' };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserById('123');

      expect(result).toEqual(mockUser);
      expect(User.findById).toHaveBeenCalledWith('123');
    });

    it('should return null when user does not exist', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      const result = await userService.getUserById('123');

      expect(result).toBeNull();
    });
  });
});
```

### 2. 集成测试

```typescript
// tests/integration/auth.test.ts
import request from 'supertest';
import app from '../../src/server';
import { connectTestDB, clearTestDB } from '../helpers/database';

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });
  });
});
```

## 部署配置

### 1. Docker配置

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY dist ./dist
COPY uploads ./uploads

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 更改文件所有者
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### 2. Docker Compose配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/fitness_coach
    depends_on:
      - mongo
      - redis
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mongo_data:
  redis_data:
```

这个代码结构方案提供了清晰的分层架构、完善的开发规范和全面的测试策略，确保项目的可维护性和可扩展性。