const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoose = require('mongoose');
require('dotenv').config();

// 创建Express应用
const app = express();

// 信任代理（如果在反向代理后面）
app.set('trust proxy', 1);

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://fitness-coach.com', 'https://www.fitness-coach.com']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Info']
}));

// 请求日志
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// 压缩响应
app.use(compression());

// 解析JSON请求体
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // 保存原始请求体用于签名验证
    req.rawBody = buf;
  }
}));

// 解析URL编码请求体
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: 'AI健身教练 - 保证金管理API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health'
  });
});

// API文档路由（简单版本）
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'AI健身教练 - 保证金管理API文档',
    version: '1.0.0',
    baseUrl: req.protocol + '://' + req.get('host') + '/api/v1',
    endpoints: {
      deposit: {
        'GET /deposit/records': '获取保证金购买记录列表',
        'POST /deposit/records': '创建保证金购买记录',
        'GET /deposit/records/:id': '获取保证金购买记录详情',
        'POST /deposit/records/:id/refund': '申请保证金退款',
        'GET /deposit/statistics': '获取保证金统计信息',
        'GET /deposit/export': '导出保证金记录表格',
        'POST /deposit/callback': '支付回调处理'
      }
    },
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <jwt_token>'
    }
  });
});

// 保证金管理路由
app.use('/api/v1/deposit', (req, res, next) => {
  // 简单的认证中间件（演示用）
  const token = req.headers.authorization;
  if (!token && req.path !== '/callback') {
    return res.status(401).json({
      success: false,
      message: '需要认证token'
    });
  }
  next();
});

// 保证金记录列表
app.get('/api/v1/deposit/records', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;
    
    // 模拟数据
    const mockRecords = [
      {
        _id: '507f1f77bcf86cd799439011',
        userId: '507f1f77bcf86cd799439012',
        contractId: '507f1f77bcf86cd799439013',
        amount: 500,
        paymentMethod: 'wechat',
        paymentInfo: {
          transactionId: 'wx_20240101_001',
          paidAt: new Date('2024-01-01T10:00:00Z'),
          status: 'paid'
        },
        status: 'active',
        description: '健身契约保证金',
        expiresAt: new Date('2024-12-31T23:59:59Z'),
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:00:00Z')
      }
    ];

    res.json({
      success: true,
      data: {
        records: mockRecords,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 1,
          pages: 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取保证金记录失败',
      error: error.message
    });
  }
});

// 创建保证金记录
app.post('/api/v1/deposit/records', async (req, res) => {
  try {
    const { userId, contractId, amount, paymentMethod, description } = req.body;
    
    // 验证必需字段
    if (!userId || !contractId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: '缺少必需字段'
      });
    }

    // 模拟创建记录
    const newRecord = {
      _id: '507f1f77bcf86cd799439014',
      userId,
      contractId,
      amount,
      paymentMethod,
      paymentInfo: {
        transactionId: `${paymentMethod}_${Date.now()}`,
        status: 'pending'
      },
      status: 'pending',
      description: description || '健身契约保证金',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后过期
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({
      success: true,
      data: newRecord,
      message: '保证金记录创建成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建保证金记录失败',
      error: error.message
    });
  }
});

// 获取保证金记录详情
app.get('/api/v1/deposit/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 模拟数据
    const mockRecord = {
      _id: id,
      userId: '507f1f77bcf86cd799439012',
      contractId: '507f1f77bcf86cd799439013',
      amount: 500,
      paymentMethod: 'wechat',
      paymentInfo: {
        transactionId: 'wx_20240101_001',
        paidAt: new Date('2024-01-01T10:00:00Z'),
        status: 'paid'
      },
      status: 'active',
      description: '健身契约保证金',
      expiresAt: new Date('2024-12-31T23:59:59Z'),
      usageHistory: [
        {
          action: 'deduct',
          amount: 50,
          reason: '违约扣除',
          timestamp: new Date('2024-06-01T10:00:00Z')
        }
      ],
      availableAmount: 450,
      usedAmount: 50,
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-06-01T10:00:00Z')
    };

    res.json({
      success: true,
      data: mockRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取保证金记录详情失败',
      error: error.message
    });
  }
});

// 申请保证金退款
app.post('/api/v1/deposit/records/:id/refund', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, amount } = req.body;
    
    // 模拟退款处理
    const refundResult = {
      refundId: `refund_${Date.now()}`,
      recordId: id,
      amount: amount || 500,
      reason: reason || '合同结束退款',
      status: 'processing',
      appliedAt: new Date(),
      estimatedCompletionTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3天后
    };

    res.json({
      success: true,
      data: refundResult,
      message: '退款申请已提交，预计3个工作日内完成'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '申请退款失败',
      error: error.message
    });
  }
});

// 获取保证金统计信息
app.get('/api/v1/deposit/statistics', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    
    // 模拟统计数据
    const statistics = {
      totalDeposits: 10,
      totalAmount: 5000,
      activeDeposits: 8,
      activeAmount: 4000,
      refundedDeposits: 2,
      refundedAmount: 1000,
      averageDepositAmount: 500,
      monthlyTrend: [
        { month: '2024-01', deposits: 2, amount: 1000 },
        { month: '2024-02', deposits: 3, amount: 1500 },
        { month: '2024-03', deposits: 5, amount: 2500 }
      ],
      paymentMethodDistribution: {
        wechat: { count: 6, amount: 3000 },
        alipay: { count: 4, amount: 2000 }
      }
    };

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取统计信息失败',
      error: error.message
    });
  }
});

// 导出保证金记录表格
app.get('/api/v1/deposit/export', async (req, res) => {
  try {
    const { format = 'excel', startDate, endDate, status } = req.query;
    
    // 模拟导出功能
    const exportResult = {
      downloadUrl: `http://localhost:3000/downloads/deposit_records_${Date.now()}.xlsx`,
      fileName: `保证金记录_${new Date().toISOString().split('T')[0]}.xlsx`,
      recordCount: 10,
      fileSize: '15.2KB',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期
    };

    res.json({
      success: true,
      data: exportResult,
      message: '导出文件已生成，请在24小时内下载'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '导出失败',
      error: error.message
    });
  }
});

// 支付回调处理
app.post('/api/v1/deposit/callback', async (req, res) => {
  try {
    const { paymentMethod, transactionId, status, amount } = req.body;
    
    console.log('收到支付回调:', { paymentMethod, transactionId, status, amount });
    
    // 模拟回调处理
    if (status === 'success') {
      // 更新支付状态
      console.log(`支付成功: ${transactionId}, 金额: ${amount}`);
      
      res.json({
        success: true,
        message: '支付回调处理成功'
      });
    } else {
      console.log(`支付失败: ${transactionId}`);
      
      res.json({
        success: true,
        message: '支付失败回调已处理'
      });
    }
  } catch (error) {
    console.error('支付回调处理失败:', error);
    res.status(500).json({
      success: false,
      message: '支付回调处理失败'
    });
  }
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
  console.error('全局错误处理:', error);

  // 默认服务器错误
  const statusCode = error.statusCode || error.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? '服务器内部错误' 
    : error.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: error.stack,
      error: error.name 
    })
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 启动服务器
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 服务器运行在端口 ${PORT}`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 健康检查: http://localhost:${PORT}/health`);
      console.log(`📚 API文档: http://localhost:${PORT}/api/docs`);
      console.log(`💰 保证金API: http://localhost:${PORT}/api/v1/deposit`);
    });

    // 优雅关闭
    process.on('SIGTERM', () => {
      console.log('收到SIGTERM信号，正在关闭服务器...');
      server.close(() => {
        console.log('服务器已关闭');
      });
    });

    return server;

  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

// 如果直接运行此文件，则启动服务器
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };