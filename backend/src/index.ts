import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import smsRoutes from './routes/sms';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 路由
app.use('/api/sms', smsRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: '健身教练后端服务'
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({ 
    message: '健身教练后端API服务',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      sms: '/api/sms'
    }
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'API接口不存在',
    path: req.originalUrl 
  });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 健身教练后端服务启动成功`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 短信服务: /api/sms`);
});

export default app;