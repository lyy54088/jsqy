const mongoose = require('mongoose');

// 保证金购买记录模型
const depositPurchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'CNY',
    enum: ['CNY', 'USD']
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['wechat', 'alipay', 'bank_card']
  },
  paymentInfo: {
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    paymentTime: Date,
    paymentStatus: {
      type: String,
      required: true,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
      index: true
    },
    paymentUrl: String,
    qrCode: String,
    expiresAt: Date,
    refundInfo: {
      refundId: String,
      refundTime: Date,
      refundAmount: Number,
      refundReason: String,
      refundStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed']
      }
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'used', 'refunded', 'expired'],
    default: 'active',
    index: true
  },
  description: {
    type: String,
    default: '健身契约保证金'
  },
  expiryDate: {
    type: Date,
    index: true
  },
  usageHistory: [{
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract'
    },
    usedAmount: Number,
    usedTime: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      enum: ['penalty', 'refund', 'transfer']
    },
    description: String
  }],
  metadata: {
    userAgent: String,
    ipAddress: String,
    deviceInfo: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虚拟字段：可用金额
depositPurchaseSchema.virtual('availableAmount').get(function() {
  const usedAmount = this.usageHistory.reduce((total, usage) => total + (usage.usedAmount || 0), 0);
  return Math.max(0, this.amount - usedAmount);
});

// 虚拟字段：已使用金额
depositPurchaseSchema.virtual('usedAmount').get(function() {
  return this.usageHistory.reduce((total, usage) => total + (usage.usedAmount || 0), 0);
});

// 索引
depositPurchaseSchema.index({ userId: 1, status: 1 });
depositPurchaseSchema.index({ userId: 1, createdAt: -1 });
depositPurchaseSchema.index({ 'paymentInfo.paymentTime': -1 });
depositPurchaseSchema.index({ expiryDate: 1 }, { sparse: true });

// 静态方法：获取用户保证金统计
depositPurchaseSchema.statics.getUserDepositStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalDeposit: { $sum: '$amount' },
        recordCount: { $sum: 1 },
        totalRefunded: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'refunded'] },
              '$amount',
              0
            ]
          }
        },
        availableDeposit: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'active'] },
              '$amount',
              0
            ]
          }
        }
      }
    }
  ]);

  const result = stats[0] || {
    totalDeposit: 0,
    recordCount: 0,
    totalRefunded: 0,
    availableDeposit: 0
  };

  // 获取最后一次保证金购买时间
  const lastRecord = await this.findOne(
    { userId },
    { createdAt: 1 },
    { sort: { createdAt: -1 } }
  );

  return {
    ...result,
    frozenDeposit: Math.max(0, result.totalDeposit - result.availableDeposit - result.totalRefunded),
    lastDepositAt: lastRecord ? lastRecord.createdAt : null,
    currency: 'CNY'
  };
};

// 实例方法：使用保证金
depositPurchaseSchema.methods.useDeposit = function(amount, contractId, reason, description) {
  if (this.availableAmount < amount) {
    throw new Error('保证金余额不足');
  }

  this.usageHistory.push({
    contractId,
    usedAmount: amount,
    reason,
    description
  });

  // 如果全部使用完，更新状态
  if (this.availableAmount <= 0) {
    this.status = 'used';
  }

  return this.save();
};

// 实例方法：申请退款
depositPurchaseSchema.methods.requestRefund = function(refundAmount, reason) {
  if (this.status !== 'active') {
    throw new Error('只有活跃状态的保证金才能申请退款');
  }

  if (refundAmount > this.availableAmount) {
    throw new Error('退款金额不能超过可用金额');
  }

  this.paymentInfo.refundInfo = {
    refundId: `refund_${Date.now()}`,
    refundAmount,
    refundReason: reason,
    refundStatus: 'pending'
  };

  return this.save();
};

// 中间件：保存前验证
depositPurchaseSchema.pre('save', function(next) {
  // 设置过期时间（如果未设置）
  if (!this.expiryDate && this.paymentInfo.paymentStatus === 'pending') {
    this.expiryDate = new Date(Date.now() + 30 * 60 * 1000); // 30分钟后过期
  }

  // 验证金额
  if (this.amount <= 0) {
    return next(new Error('保证金金额必须大于0'));
  }

  next();
});

// 中间件：更新时间戳
depositPurchaseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('DepositPurchase', depositPurchaseSchema);