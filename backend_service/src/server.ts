import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import visionRoutes from './routes/vision';
import communityRoutes from './routes/community';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3000;

// 安全中间件
app.use(helmet());

// CORS 配置
app.use(cors({
  origin: process.env['CORS_ORIGIN'] || ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// 压缩响应
app.use(compression());

// 请求日志
app.use(morgan(process.env['LOG_FORMAT'] || 'combined'));

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查端点
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV']
  });
});

// 基础API路由
app.get('/api/test', (_req, res) => {
  res.json({ message: '后端服务器运行正常！', timestamp: new Date().toISOString() });
});

// Vision API路由
app.use('/api/vision', visionRoutes);

// Community API路由
app.use('/api/communities', communityRoutes);

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
function startServer() {
  try {
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在端口 ${PORT}`);
      console.log(`🌍 环境: ${process.env['NODE_ENV'] || 'development'}`);
      console.log(`📊 健康检查: http://localhost:${PORT}/health`);
      console.log(`🧪 测试接口: http://localhost:${PORT}/api/test`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('🛑 收到 SIGTERM 信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 收到 SIGINT 信号，正在关闭服务器...');
  process.exit(0);
});

startServer();

export default app;