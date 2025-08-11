# 健身教练应用后端服务

一个基于 Node.js + TypeScript + MongoDB 的现代化健身教练应用后端服务，提供用户管理、打卡记录、契约管理、AI教练对话、保证金管理等功能。

## 🏦 保证金管理系统

新增的保证金管理系统提供完整的保证金购买、记录、退款和统计功能：

### 功能特性
- ✅ 保证金购买记录创建和管理
- ✅ 支付状态跟踪（微信支付、支付宝）
- ✅ 退款申请处理
- ✅ 使用历史记录
- ✅ 统计报表生成和Excel导出
- ✅ 多渠道通知服务（短信、邮件、推送）

### API 端点
- `GET /api/v1/deposit/records` - 获取保证金记录列表
- `POST /api/v1/deposit/records` - 创建保证金购买记录
- `GET /api/v1/deposit/records/:id` - 获取保证金记录详情
- `POST /api/v1/deposit/records/:id/refund` - 申请保证金退款
- `GET /api/v1/deposit/statistics` - 获取保证金统计信息
- `GET /api/v1/deposit/export` - 导出保证金记录表格
- `POST /api/v1/deposit/callback` - 支付回调处理

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- MongoDB >= 6.0
- Redis >= 7.0 (可选，用于缓存)

### 安装依赖

```bash
# 进入后端服务目录
cd backend_service

# 安装依赖
npm install
```

### 环境配置

1. 复制环境变量示例文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，配置必要的环境变量：
```env
# 服务器配置
PORT=3000
NODE_ENV=development

# MongoDB 配置
MONGODB_URI=mongodb://localhost:27017/fitness_coach
MONGODB_DB_NAME=fitness_coach

# JWT 配置
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# AI服务配置 (如需要)
# AI_API_KEY=your_ai_api_key_here
# AI_API_URL=https://api.example.com
```

### 启动服务

```bash
# 开发模式（热重载）
npm run dev

# 构建项目
npm run build

# 生产模式
npm start
```

### 验证服务

访问健康检查端点：
```bash
curl http://localhost:3000/health
```

预期响应：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

## 📁 项目结构

```
backend_service/
├── src/                    # 源代码
│   ├── config/            # 配置文件
│   ├── controllers/       # 控制器层
│   ├── middleware/        # 中间件
│   ├── models/           # 数据模型
│   ├── routes/           # 路由定义
│   ├── services/         # 业务服务层
│   ├── utils/            # 工具函数
│   ├── types/            # TypeScript类型
│   └── server.ts         # 应用入口
├── tests/                 # 测试文件
├── dist/                 # 编译输出
├── uploads/              # 文件上传目录
├── logs/                 # 日志文件
└── docs/                 # 文档
```

## 🔧 开发命令

```bash
# 开发模式
npm run dev

# 构建项目
npm run build

# 启动生产服务
npm start

# 运行测试
npm test

# 代码检查
npm run lint

# 代码格式化
npm run format

# 类型检查
npm run type-check
```

## 📚 API 文档

详细的 API 文档请参考：[API_Spec.md](./API_Spec.md)

### 主要端点

- **认证**: `/api/auth/*`
  - `POST /api/auth/register` - 用户注册
  - `POST /api/auth/login` - 用户登录
  - `POST /api/auth/refresh` - 刷新令牌

- **用户管理**: `/api/users/*`
  - `GET /api/users/profile` - 获取用户信息
  - `PUT /api/users/profile` - 更新用户信息
  - `PUT /api/users/password` - 修改密码

- **打卡记录**: `/api/checkins/*`
  - `POST /api/checkins` - 创建打卡记录
  - `GET /api/checkins` - 获取打卡记录列表
  - `GET /api/checkins/:id` - 获取单个打卡记录

- **契约管理**: `/api/contracts/*`
  - `POST /api/contracts` - 创建契约
  - `GET /api/contracts` - 获取契约列表
  - `GET /api/contracts/:id` - 获取契约详情

- **AI教练**: `/api/aicoach/*`
  - `POST /api/aicoach/sessions` - 创建对话会话
  - `POST /api/aicoach/sessions/:id/messages` - 发送消息
  - `GET /api/aicoach/sessions` - 获取会话列表

## 🗄️ 数据库

### MongoDB 集合

- `users` - 用户信息
- `checkins` - 打卡记录
- `contracts` - 契约信息
- `ai_coach_sessions` - AI教练会话

### 数据库初始化

```bash
# 连接到 MongoDB
mongo

# 创建数据库和用户
use fitness_coach
db.createUser({
  user: "fitness_app",
  pwd: "your_password",
  roles: ["readWrite"]
})
```

详细的数据库设计请参考：[DB_Schema.md](./DB_Schema.md)

## 🔒 安全特性

- JWT 身份认证
- 密码 bcrypt 加密
- 请求速率限制
- 输入数据验证
- CORS 配置
- 安全 HTTP 头设置
- 文件上传安全检查

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 生成测试覆盖率报告
npm run test:coverage
```

## 📊 监控和日志

### 日志文件

- `logs/app.log` - 应用日志
- `logs/error.log` - 错误日志
- `logs/access.log` - 访问日志

### 健康检查

- `GET /health` - 服务健康状态
- 包含数据库连接状态
- 系统资源使用情况

## 🐳 Docker 部署

### 使用 Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止服务
docker-compose down
```

### 单独构建镜像

```bash
# 构建镜像
docker build -t fitness-coach-backend .

# 运行容器
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/fitness_coach \
  -e JWT_SECRET=your_secret \
  fitness-coach-backend
```

## 🔧 配置说明

### 环境变量

| 变量名 | 描述 | 默认值 | 必需 |
|--------|------|--------|------|
| `PORT` | 服务端口 | 3000 | 否 |
| `NODE_ENV` | 运行环境 | development | 否 |
| `MONGODB_URI` | MongoDB连接字符串 | - | 是 |
| `JWT_SECRET` | JWT密钥 | - | 是 |
| `AI_API_KEY` | AI服务API密钥 | - | 否 |
| `CORS_ORIGIN` | CORS允许的源 | http://localhost:5173 | 否 |

### 性能调优

- 连接池大小：10
- 请求超时：30秒
- 文件上传限制：10MB
- 速率限制：100请求/15分钟

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 编写单元测试
- 添加适当的注释
- 更新相关文档

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 支持

如有问题或建议，请：

1. 查看 [API文档](./API_Spec.md)
2. 查看 [数据库设计](./DB_Schema.md)
3. 查看 [技术架构](./Tech_Stack.md)
4. 提交 Issue
5. 联系开发团队

## 🔄 版本历史

- **v1.0.0** - 初始版本
  - 用户认证和管理
  - 打卡记录功能
  - 契约管理系统
  - AI教练对话
  - 文件上传功能

---

**注意**: 这是一个示例后端服务架构。在生产环境中使用前，请确保：

1. 更改所有默认密码和密钥
2. 配置适当的安全策略
3. 设置监控和日志系统
4. 实施备份策略
5. 进行安全审计