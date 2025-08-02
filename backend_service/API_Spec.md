# 健身教练应用 API 规范文档

## 概述

本文档定义了健身教练应用的后端 API 接口规范，采用 RESTful 设计风格，支持用户管理、打卡记录、契约管理、AI 教练对话等核心功能。

## 服务器信息

- **Base URL (开发环境)**: `http://localhost:3000/api`
- **Base URL (生产环境)**: `https://api.fitness-coach.com/api`
- **API 版本**: v1
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证方式

API 使用 JWT (JSON Web Token) 进行身份认证。

### 认证流程
1. 用户通过 `/api/auth/login` 登录获取 JWT token
2. 在后续请求的 Header 中携带 token：`Authorization: Bearer <token>`
3. Token 有效期为 7 天，过期后需要重新登录

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## API 接口列表

### 1. 用户认证 (Authentication)

#### 1.1 用户注册
- **路径**: `POST /api/auth/register`
- **描述**: 创建新用户账户
- **认证**: 无需认证

**请求体**:
```json
{
  "username": "string (3-20字符)",
  "email": "string (有效邮箱格式)",
  "password": "string (6-50字符)",
  "profile": {
    "name": "string (可选)",
    "age": "number (可选, 10-120)",
    "height": "number (可选, 50-300cm)",
    "weight": "number (可选, 20-500kg)",
    "goal": "string (可选)"
  }
}
```

**响应**:
- **200 OK**: 注册成功
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "profile": {},
      "createdAt": "string"
    },
    "token": "string"
  }
}
```
- **400 Bad Request**: 请求参数错误
- **409 Conflict**: 用户名或邮箱已存在

#### 1.2 用户登录
- **路径**: `POST /api/auth/login`
- **描述**: 用户登录获取访问令牌
- **认证**: 无需认证

**请求体**:
```json
{
  "email": "string",
  "password": "string"
}
```

**响应**:
- **200 OK**: 登录成功
- **401 Unauthorized**: 邮箱或密码错误

#### 1.3 刷新令牌
- **路径**: `POST /api/auth/refresh`
- **描述**: 刷新访问令牌
- **认证**: 需要有效的 JWT token

### 2. 用户管理 (Users)

#### 2.1 获取用户信息
- **路径**: `GET /api/users/profile`
- **描述**: 获取当前用户的详细信息
- **认证**: 需要认证

**响应**:
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "profile": {
      "name": "string",
      "age": "number",
      "height": "number",
      "weight": "number",
      "goal": "string"
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

#### 2.2 更新用户信息
- **路径**: `PUT /api/users/profile`
- **描述**: 更新用户资料信息
- **认证**: 需要认证

**请求体**:
```json
{
  "profile": {
    "name": "string (可选)",
    "age": "number (可选)",
    "height": "number (可选)",
    "weight": "number (可选)",
    "goal": "string (可选)"
  }
}
```

#### 2.3 修改密码
- **路径**: `PUT /api/users/password`
- **描述**: 修改用户密码
- **认证**: 需要认证

**请求体**:
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

### 3. 打卡记录 (Check-ins)

#### 3.1 创建打卡记录
- **路径**: `POST /api/checkins`
- **描述**: 创建新的打卡记录
- **认证**: 需要认证

**请求体**:
```json
{
  "type": "breakfast|lunch|dinner|workout|protein",
  "image": "string (可选, base64编码)",
  "location": {
    "latitude": "number (可选)",
    "longitude": "number (可选)",
    "address": "string (可选)"
  },
  "timestamp": "string (ISO 8601格式)"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "userId": "string",
    "type": "string",
    "image": "string",
    "location": {},
    "aiAnalysis": {
      "foodItems": ["string"],
      "healthScore": "number",
      "calories": "number",
      "nutritionInfo": {
        "protein": "number",
        "carbs": "number",
        "fat": "number",
        "fiber": "number"
      },
      "recommendations": ["string"],
      "description": "string"
    },
    "timestamp": "string",
    "createdAt": "string"
  }
}
```

#### 3.2 获取打卡记录列表
- **路径**: `GET /api/checkins`
- **描述**: 获取用户的打卡记录列表
- **认证**: 需要认证

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20, 最大: 100)
- `type`: 打卡类型筛选
- `startDate`: 开始日期 (ISO 8601格式)
- `endDate`: 结束日期 (ISO 8601格式)

#### 3.3 获取单个打卡记录
- **路径**: `GET /api/checkins/:id`
- **描述**: 获取指定ID的打卡记录详情
- **认证**: 需要认证

#### 3.4 删除打卡记录
- **路径**: `DELETE /api/checkins/:id`
- **描述**: 删除指定的打卡记录
- **认证**: 需要认证

### 4. 契约管理 (Contracts)

#### 4.1 创建契约
- **路径**: `POST /api/contracts`
- **描述**: 创建新的健身契约
- **认证**: 需要认证

**请求体**:
```json
{
  "type": "normal|hero",
  "title": "string",
  "description": "string",
  "rules": {
    "dailyCheckIns": "number",
    "penaltyAmount": "number",
    "duration": "number"
  },
  "startDate": "string (ISO 8601格式)"
}
```

#### 4.2 获取契约列表
- **路径**: `GET /api/contracts`
- **描述**: 获取用户的契约列表
- **认证**: 需要认证

**查询参数**:
- `status`: 契约状态筛选 (active|completed|failed)
- `type`: 契约类型筛选 (normal|hero)

#### 4.3 获取契约详情
- **路径**: `GET /api/contracts/:id`
- **描述**: 获取指定契约的详细信息
- **认证**: 需要认证

#### 4.4 更新契约进度
- **路径**: `PUT /api/contracts/:id/progress`
- **描述**: 更新契约的完成进度
- **认证**: 需要认证

### 5. AI 教练 (AI Coach)

#### 5.1 创建对话会话
- **路径**: `POST /api/aicoach/sessions`
- **描述**: 创建新的AI教练对话会话
- **认证**: 需要认证

**请求体**:
```json
{
  "sessionType": "general|nutrition|workout|motivation"
}
```

#### 5.2 发送消息
- **路径**: `POST /api/aicoach/sessions/:sessionId/messages`
- **描述**: 向AI教练发送消息并获取回复
- **认证**: 需要认证

**请求体**:
```json
{
  "content": "string",
  "context": {
    "recentCheckIns": "array (可选)",
    "currentContract": "object (可选)",
    "userProfile": "object (可选)"
  }
}
```

#### 5.3 获取会话历史
- **路径**: `GET /api/aicoach/sessions/:sessionId`
- **描述**: 获取指定会话的消息历史
- **认证**: 需要认证

#### 5.4 获取会话列表
- **路径**: `GET /api/aicoach/sessions`
- **描述**: 获取用户的AI教练会话列表
- **认证**: 需要认证

### 6. 文件上传 (Upload)

#### 6.1 上传图片
- **路径**: `POST /api/upload/image`
- **描述**: 上传图片文件
- **认证**: 需要认证
- **Content-Type**: `multipart/form-data`

**请求体**:
- `image`: 图片文件 (支持 JPEG, PNG, WebP)
- `type`: 图片类型 (food|profile|other)

## 错误代码

| 错误代码 | HTTP状态码 | 描述 |
|---------|-----------|------|
| VALIDATION_ERROR | 400 | 请求参数验证失败 |
| UNAUTHORIZED | 401 | 未授权访问 |
| FORBIDDEN | 403 | 权限不足 |
| NOT_FOUND | 404 | 资源不存在 |
| CONFLICT | 409 | 资源冲突 |
| RATE_LIMIT_EXCEEDED | 429 | 请求频率超限 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| DATABASE_ERROR | 500 | 数据库操作错误 |
| AI_SERVICE_ERROR | 503 | AI服务不可用 |

## 数据模型

### User (用户)
```typescript
interface User {
  _id: string;
  username: string;
  email: string;
  password: string; // 加密存储
  profile?: {
    name?: string;
    age?: number;
    height?: number; // cm
    weight?: number; // kg
    goal?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### CheckInRecord (打卡记录)
```typescript
interface CheckInRecord {
  _id: string;
  userId: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'workout' | 'protein';
  image?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  aiAnalysis?: {
    foodItems?: string[];
    healthScore?: number;
    calories?: number;
    nutritionInfo?: {
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
    };
    recommendations?: string[];
    description?: string;
  };
  timestamp: Date;
  createdAt: Date;
}
```

### Contract (契约)
```typescript
interface Contract {
  _id: string;
  userId: string;
  type: 'normal' | 'hero';
  title: string;
  description: string;
  rules: {
    dailyCheckIns: number;
    penaltyAmount: number;
    duration: number; // 天数
  };
  status: 'active' | 'completed' | 'failed';
  startDate: Date;
  endDate: Date;
  progress: {
    completedDays: number;
    totalPenalty: number;
    checkInHistory: Date[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### AICoachSession (AI教练会话)
```typescript
interface AICoachSession {
  _id: string;
  userId: string;
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }[];
  sessionType: 'general' | 'nutrition' | 'workout' | 'motivation';
  createdAt: Date;
  updatedAt: Date;
}
```

## 速率限制

- **全局限制**: 每15分钟最多100个请求
- **登录接口**: 每15分钟最多5次尝试
- **AI对话接口**: 每分钟最多10个请求
- **文件上传**: 每小时最多50次上传

## 安全考虑

1. **密码安全**: 使用 bcrypt 进行密码加密，加密轮数为12
2. **JWT安全**: 使用强随机密钥，定期轮换
3. **输入验证**: 所有输入都经过严格的数据验证
4. **SQL注入防护**: 使用参数化查询
5. **XSS防护**: 对输出内容进行转义
6. **CORS配置**: 限制跨域访问来源
7. **文件上传安全**: 限制文件类型和大小

## 版本更新

- **v1.0.0** (2024-01-01): 初始版本，包含基础功能
- 后续版本将在此处记录更新内容