const express = require('express');
const { body, param, query } = require('express-validator');
const depositController = require('../controllers/depositController');
const authMiddleware = require('../middleware/auth');
const rateLimitMiddleware = require('../middleware/rateLimit');

const router = express.Router();

// 验证规则
const createDepositValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('金额必须大于0'),
  body('currency')
    .optional()
    .isIn(['CNY', 'USD'])
    .withMessage('货币类型无效'),
  body('paymentMethod')
    .isIn(['wechat', 'alipay', 'bank_card'])
    .withMessage('支付方式无效'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('描述长度不能超过200字符'),
  body('contractId')
    .optional()
    .isMongoId()
    .withMessage('契约ID格式无效')
];

const refundValidation = [
  param('recordId')
    .isMongoId()
    .withMessage('记录ID格式无效'),
  body('reason')
    .isLength({ min: 1, max: 500 })
    .withMessage('退款原因必须在1-500字符之间'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('退款金额必须大于0')
];

const queryValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('限制数量必须在1-100之间'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('偏移量必须大于等于0'),
  query('status')
    .optional()
    .isIn(['pending', 'success', 'failed', 'refunded'])
    .withMessage('状态参数无效'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('开始日期格式无效'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('结束日期格式无效')
];

// 应用认证中间件到所有路由
router.use(authMiddleware);

/**
 * @route   GET /api/v1/deposit/records
 * @desc    获取保证金购买记录列表
 * @access  Private
 */
router.get('/records', 
  queryValidation,
  rateLimitMiddleware({ windowMs: 60000, max: 30 }), // 每分钟最多30次请求
  depositController.getDepositRecords
);

/**
 * @route   POST /api/v1/deposit/records
 * @desc    创建保证金购买记录
 * @access  Private
 */
router.post('/records',
  createDepositValidation,
  rateLimitMiddleware({ windowMs: 60000, max: 10 }), // 每分钟最多10次请求
  depositController.createDepositRecord
);

/**
 * @route   GET /api/v1/deposit/records/:recordId
 * @desc    获取保证金购买记录详情
 * @access  Private
 */
router.get('/records/:recordId',
  param('recordId').isMongoId().withMessage('记录ID格式无效'),
  rateLimitMiddleware({ windowMs: 60000, max: 60 }), // 每分钟最多60次请求
  depositController.getDepositRecord
);

/**
 * @route   POST /api/v1/deposit/records/:recordId/refund
 * @desc    申请保证金退款
 * @access  Private
 */
router.post('/records/:recordId/refund',
  refundValidation,
  rateLimitMiddleware({ windowMs: 60000, max: 5 }), // 每分钟最多5次请求
  depositController.requestRefund
);

/**
 * @route   GET /api/v1/deposit/statistics
 * @desc    获取保证金统计信息
 * @access  Private
 */
router.get('/statistics',
  rateLimitMiddleware({ windowMs: 60000, max: 20 }), // 每分钟最多20次请求
  depositController.getDepositStatistics
);

/**
 * @route   GET /api/v1/deposit/export
 * @desc    导出保证金记录表格
 * @access  Private
 */
router.get('/export',
  query('format')
    .optional()
    .isIn(['csv', 'json'])
    .withMessage('导出格式无效'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('开始日期格式无效'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('结束日期格式无效'),
  rateLimitMiddleware({ windowMs: 300000, max: 5 }), // 每5分钟最多5次请求
  depositController.exportDepositRecords
);

/**
 * @route   POST /api/v1/deposit/callback
 * @desc    支付回调处理（第三方支付平台调用）
 * @access  Public (需要验证签名)
 */
router.post('/callback',
  body('transactionId').notEmpty().withMessage('交易ID不能为空'),
  body('orderId').isMongoId().withMessage('订单ID格式无效'),
  body('status').isIn(['success', 'failed']).withMessage('支付状态无效'),
  body('paymentTime').isISO8601().withMessage('支付时间格式无效'),
  rateLimitMiddleware({ windowMs: 60000, max: 100 }), // 每分钟最多100次请求
  depositController.handlePaymentCallback
);

module.exports = router;