const DepositPurchase = require('../models/DepositPurchase');
const { validationResult } = require('express-validator');
const { generatePaymentQR, processPayment } = require('../services/paymentService');
const { sendNotification } = require('../services/notificationService');

/**
 * 获取保证金购买记录列表
 */
exports.getDepositRecords = async (req, res) => {
  try {
    const { limit = 20, offset = 0, status, startDate, endDate } = req.query;
    const userId = req.user.id;

    // 构建查询条件
    const query = { userId };
    
    if (status) {
      query['paymentInfo.paymentStatus'] = status;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // 查询记录
    const records = await DepositPurchase.find(query)
      .populate('contractId', 'type amount startDate endDate')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    // 获取总数
    const total = await DepositPurchase.countDocuments(query);

    // 格式化响应数据
    const formattedRecords = records.map(record => ({
      id: record._id,
      userId: record.userId,
      contractId: record.contractId?._id,
      contractInfo: record.contractId ? {
        type: record.contractId.type,
        amount: record.contractId.amount,
        startDate: record.contractId.startDate,
        endDate: record.contractId.endDate
      } : null,
      amount: record.amount,
      currency: record.currency,
      status: record.paymentInfo.paymentStatus,
      paymentMethod: record.paymentMethod,
      transactionId: record.paymentInfo.transactionId,
      description: record.description,
      createdAt: record.createdAt,
      completedAt: record.paymentInfo.paymentTime,
      refundInfo: record.paymentInfo.refundInfo
    }));

    res.json({
      success: true,
      data: {
        records: formattedRecords,
        total,
        hasMore: offset + limit < total,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total
        }
      }
    });

  } catch (error) {
    console.error('获取保证金记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取保证金记录失败',
      error: error.message
    });
  }
};

/**
 * 创建保证金购买记录
 */
exports.createDepositRecord = async (req, res) => {
  try {
    // 验证请求参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '请求参数错误',
        errors: errors.array()
      });
    }

    const { amount, currency = 'CNY', paymentMethod, description, contractId } = req.body;
    const userId = req.user.id;

    // 创建保证金购买记录
    const depositRecord = new DepositPurchase({
      userId,
      contractId,
      amount,
      currency,
      paymentMethod,
      description: description || '健身契约保证金',
      paymentInfo: {
        paymentStatus: 'pending',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30分钟后过期
      },
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        deviceInfo: req.get('X-Device-Info')
      }
    });

    await depositRecord.save();

    // 生成支付信息
    let paymentInfo = {};
    try {
      if (paymentMethod === 'wechat' || paymentMethod === 'alipay') {
        // 生成支付二维码
        const qrResult = await generatePaymentQR({
          orderId: depositRecord._id.toString(),
          amount,
          paymentMethod,
          description: depositRecord.description
        });
        
        paymentInfo = {
          paymentUrl: qrResult.paymentUrl,
          qrCode: qrResult.qrCode
        };
        
        // 更新支付信息
        depositRecord.paymentInfo.paymentUrl = qrResult.paymentUrl;
        depositRecord.paymentInfo.qrCode = qrResult.qrCode;
        await depositRecord.save();
      }
    } catch (paymentError) {
      console.error('生成支付信息失败:', paymentError);
      // 支付信息生成失败不影响记录创建
    }

    res.status(201).json({
      success: true,
      data: {
        id: depositRecord._id,
        amount: depositRecord.amount,
        currency: depositRecord.currency,
        status: depositRecord.paymentInfo.paymentStatus,
        paymentMethod: depositRecord.paymentMethod,
        description: depositRecord.description,
        expiresAt: depositRecord.paymentInfo.expiresAt,
        createdAt: depositRecord.createdAt,
        ...paymentInfo
      }
    });

  } catch (error) {
    console.error('创建保证金记录失败:', error);
    res.status(500).json({
      success: false,
      message: '创建保证金记录失败',
      error: error.message
    });
  }
};

/**
 * 获取保证金购买记录详情
 */
exports.getDepositRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const userId = req.user.id;

    const record = await DepositPurchase.findOne({
      _id: recordId,
      userId
    }).populate('contractId', 'type amount startDate endDate status');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: '保证金记录不存在'
      });
    }

    res.json({
      success: true,
      data: {
        id: record._id,
        userId: record.userId,
        contractId: record.contractId?._id,
        contractInfo: record.contractId ? {
          type: record.contractId.type,
          amount: record.contractId.amount,
          startDate: record.contractId.startDate,
          endDate: record.contractId.endDate,
          status: record.contractId.status
        } : null,
        amount: record.amount,
        currency: record.currency,
        status: record.paymentInfo.paymentStatus,
        paymentMethod: record.paymentMethod,
        transactionId: record.paymentInfo.transactionId,
        description: record.description,
        availableAmount: record.availableAmount,
        usedAmount: record.usedAmount,
        usageHistory: record.usageHistory,
        refundInfo: record.paymentInfo.refundInfo,
        createdAt: record.createdAt,
        completedAt: record.paymentInfo.paymentTime,
        refundedAt: record.paymentInfo.refundInfo?.refundTime
      }
    });

  } catch (error) {
    console.error('获取保证金记录详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取保证金记录详情失败',
      error: error.message
    });
  }
};

/**
 * 申请保证金退款
 */
exports.requestRefund = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { reason, amount } = req.body;
    const userId = req.user.id;

    const record = await DepositPurchase.findOne({
      _id: recordId,
      userId
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: '保证金记录不存在'
      });
    }

    if (record.paymentInfo.paymentStatus !== 'success') {
      return res.status(400).json({
        success: false,
        message: '只有支付成功的保证金才能申请退款'
      });
    }

    if (record.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: '当前状态不允许申请退款'
      });
    }

    const refundAmount = amount || record.availableAmount;
    
    if (refundAmount > record.availableAmount) {
      return res.status(400).json({
        success: false,
        message: '退款金额不能超过可用金额'
      });
    }

    // 申请退款
    await record.requestRefund(refundAmount, reason);

    // 发送通知
    try {
      await sendNotification(userId, {
        type: 'refund_request',
        title: '退款申请已提交',
        message: `您的保证金退款申请已提交，退款金额：¥${refundAmount}`,
        data: { recordId: record._id, amount: refundAmount }
      });
    } catch (notificationError) {
      console.error('发送退款通知失败:', notificationError);
    }

    res.json({
      success: true,
      data: {
        refundId: record.paymentInfo.refundInfo.refundId,
        status: record.paymentInfo.refundInfo.refundStatus,
        amount: refundAmount,
        estimatedTime: '1-3个工作日',
        message: '退款申请已提交，请耐心等待处理'
      }
    });

  } catch (error) {
    console.error('申请退款失败:', error);
    res.status(500).json({
      success: false,
      message: '申请退款失败',
      error: error.message
    });
  }
};

/**
 * 获取保证金统计信息
 */
exports.getDepositStatistics = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await DepositPurchase.getUserDepositStats(userId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('获取保证金统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取保证金统计失败',
      error: error.message
    });
  }
};

/**
 * 支付回调处理
 */
exports.handlePaymentCallback = async (req, res) => {
  try {
    const { transactionId, orderId, status, paymentTime } = req.body;

    const record = await DepositPurchase.findById(orderId);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    // 更新支付状态
    record.paymentInfo.transactionId = transactionId;
    record.paymentInfo.paymentStatus = status;
    record.paymentInfo.paymentTime = new Date(paymentTime);

    if (status === 'success') {
      record.status = 'active';
    } else if (status === 'failed') {
      record.status = 'expired';
    }

    await record.save();

    // 发送通知
    try {
      const notificationData = {
        type: status === 'success' ? 'payment_success' : 'payment_failed',
        title: status === 'success' ? '支付成功' : '支付失败',
        message: status === 'success' 
          ? `保证金 ¥${record.amount} 支付成功` 
          : `保证金支付失败，请重新尝试`,
        data: { recordId: record._id, amount: record.amount }
      };

      await sendNotification(record.userId, notificationData);
    } catch (notificationError) {
      console.error('发送支付通知失败:', notificationError);
    }

    res.json({
      success: true,
      message: '支付状态更新成功'
    });

  } catch (error) {
    console.error('处理支付回调失败:', error);
    res.status(500).json({
      success: false,
      message: '处理支付回调失败',
      error: error.message
    });
  }
};

/**
 * 导出保证金记录表格
 */
exports.exportDepositRecords = async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate } = req.query;
    const userId = req.user.id;

    // 构建查询条件
    const query = { userId };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // 查询记录
    const records = await DepositPurchase.find(query)
      .populate('contractId', 'type amount')
      .sort({ createdAt: -1 })
      .lean();

    if (format === 'csv') {
      // 生成CSV格式
      const csvHeader = '记录ID,金额,货币,支付方式,状态,交易ID,描述,创建时间,支付时间\n';
      const csvData = records.map(record => [
        record._id,
        record.amount,
        record.currency,
        record.paymentMethod,
        record.paymentInfo.paymentStatus,
        record.paymentInfo.transactionId || '',
        record.description,
        record.createdAt.toISOString(),
        record.paymentInfo.paymentTime ? record.paymentInfo.paymentTime.toISOString() : ''
      ].join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="deposit_records_${Date.now()}.csv"`);
      res.send('\ufeff' + csvHeader + csvData); // 添加BOM以支持中文
    } else {
      // 返回JSON格式
      res.json({
        success: true,
        data: {
          records: records.map(record => ({
            id: record._id,
            amount: record.amount,
            currency: record.currency,
            paymentMethod: record.paymentMethod,
            status: record.paymentInfo.paymentStatus,
            transactionId: record.paymentInfo.transactionId,
            description: record.description,
            createdAt: record.createdAt,
            completedAt: record.paymentInfo.paymentTime
          })),
          exportTime: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('导出保证金记录失败:', error);
    res.status(500).json({
      success: false,
      message: '导出保证金记录失败',
      error: error.message
    });
  }
};