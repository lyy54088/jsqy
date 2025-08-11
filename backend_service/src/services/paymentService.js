const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * 支付服务类
 */
class PaymentService {
  constructor() {
    this.config = {
      wechat: {
        appId: process.env.WECHAT_APP_ID || 'wx_test_app_id',
        mchId: process.env.WECHAT_MCH_ID || 'test_mch_id',
        apiKey: process.env.WECHAT_API_KEY || 'test_api_key',
        notifyUrl: process.env.WECHAT_NOTIFY_URL || 'http://localhost:3000/api/v1/deposit/callback'
      },
      alipay: {
        appId: process.env.ALIPAY_APP_ID || 'test_app_id',
        privateKey: process.env.ALIPAY_PRIVATE_KEY || 'test_private_key',
        publicKey: process.env.ALIPAY_PUBLIC_KEY || 'test_public_key',
        notifyUrl: process.env.ALIPAY_NOTIFY_URL || 'http://localhost:3000/api/v1/deposit/callback'
      }
    };
  }

  /**
   * 生成支付二维码
   * @param {Object} options - 支付选项
   * @param {string} options.orderId - 订单ID
   * @param {number} options.amount - 支付金额
   * @param {string} options.paymentMethod - 支付方式
   * @param {string} options.description - 商品描述
   * @returns {Promise<Object>} 支付信息
   */
  async generatePaymentQR(options) {
    const { orderId, amount, paymentMethod, description } = options;

    try {
      let paymentUrl;
      
      if (paymentMethod === 'wechat') {
        paymentUrl = await this.generateWechatPaymentUrl(orderId, amount, description);
      } else if (paymentMethod === 'alipay') {
        paymentUrl = await this.generateAlipayPaymentUrl(orderId, amount, description);
      } else {
        throw new Error('不支持的支付方式');
      }

      // 生成二维码
      const qrCode = await QRCode.toDataURL(paymentUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return {
        paymentUrl,
        qrCode,
        orderId,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30分钟后过期
      };

    } catch (error) {
      console.error('生成支付二维码失败:', error);
      throw new Error('生成支付二维码失败');
    }
  }

  /**
   * 生成微信支付URL
   * @param {string} orderId - 订单ID
   * @param {number} amount - 支付金额（元）
   * @param {string} description - 商品描述
   * @returns {Promise<string>} 支付URL
   */
  async generateWechatPaymentUrl(orderId, amount, description) {
    // 模拟微信支付URL生成
    // 实际项目中需要调用微信支付API
    const params = {
      appid: this.config.wechat.appId,
      mch_id: this.config.wechat.mchId,
      nonce_str: this.generateNonceStr(),
      body: description,
      out_trade_no: orderId,
      total_fee: Math.round(amount * 100), // 转换为分
      spbill_create_ip: '127.0.0.1',
      notify_url: this.config.wechat.notifyUrl,
      trade_type: 'NATIVE'
    };

    // 生成签名
    params.sign = this.generateWechatSign(params);

    // 模拟返回支付URL
    const paymentUrl = `weixin://wxpay/bizpayurl?pr=${this.generateCodeUrl(params)}`;
    
    return paymentUrl;
  }

  /**
   * 生成支付宝支付URL
   * @param {string} orderId - 订单ID
   * @param {number} amount - 支付金额（元）
   * @param {string} description - 商品描述
   * @returns {Promise<string>} 支付URL
   */
  async generateAlipayPaymentUrl(orderId, amount, description) {
    // 模拟支付宝支付URL生成
    // 实际项目中需要调用支付宝API
    const params = {
      app_id: this.config.alipay.appId,
      method: 'alipay.trade.precreate',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      version: '1.0',
      notify_url: this.config.alipay.notifyUrl,
      biz_content: JSON.stringify({
        out_trade_no: orderId,
        total_amount: amount.toFixed(2),
        subject: description
      })
    };

    // 生成签名
    params.sign = this.generateAlipaySign(params);

    // 模拟返回支付URL
    const paymentUrl = `alipays://platformapi/startapp?saId=10000007&qrcode=${encodeURIComponent(JSON.stringify(params))}`;
    
    return paymentUrl;
  }

  /**
   * 处理支付结果
   * @param {Object} paymentData - 支付数据
   * @returns {Promise<Object>} 处理结果
   */
  async processPayment(paymentData) {
    const { orderId, transactionId, amount, paymentMethod, status } = paymentData;

    try {
      // 验证支付结果
      const isValid = await this.verifyPaymentResult(paymentData);
      
      if (!isValid) {
        throw new Error('支付结果验证失败');
      }

      // 返回处理结果
      return {
        success: true,
        orderId,
        transactionId,
        amount,
        paymentMethod,
        status,
        processedAt: new Date()
      };

    } catch (error) {
      console.error('处理支付结果失败:', error);
      return {
        success: false,
        error: error.message,
        orderId
      };
    }
  }

  /**
   * 验证支付结果
   * @param {Object} paymentData - 支付数据
   * @returns {Promise<boolean>} 验证结果
   */
  async verifyPaymentResult(paymentData) {
    const { paymentMethod, signature, ...data } = paymentData;

    try {
      if (paymentMethod === 'wechat') {
        return this.verifyWechatSignature(data, signature);
      } else if (paymentMethod === 'alipay') {
        return this.verifyAlipaySignature(data, signature);
      }
      
      return false;
    } catch (error) {
      console.error('验证支付签名失败:', error);
      return false;
    }
  }

  /**
   * 申请退款
   * @param {Object} refundData - 退款数据
   * @returns {Promise<Object>} 退款结果
   */
  async requestRefund(refundData) {
    const { orderId, transactionId, refundAmount, refundReason, paymentMethod } = refundData;

    try {
      let refundResult;

      if (paymentMethod === 'wechat') {
        refundResult = await this.processWechatRefund(orderId, transactionId, refundAmount, refundReason);
      } else if (paymentMethod === 'alipay') {
        refundResult = await this.processAlipayRefund(orderId, transactionId, refundAmount, refundReason);
      } else {
        throw new Error('不支持的支付方式');
      }

      return {
        success: true,
        refundId: refundResult.refundId,
        status: 'processing',
        estimatedTime: '1-3个工作日',
        ...refundResult
      };

    } catch (error) {
      console.error('申请退款失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 处理微信退款
   * @param {string} orderId - 订单ID
   * @param {string} transactionId - 交易ID
   * @param {number} refundAmount - 退款金额
   * @param {string} refundReason - 退款原因
   * @returns {Promise<Object>} 退款结果
   */
  async processWechatRefund(orderId, transactionId, refundAmount, refundReason) {
    // 模拟微信退款处理
    // 实际项目中需要调用微信退款API
    return {
      refundId: `wx_refund_${Date.now()}`,
      refundAmount,
      refundTime: new Date()
    };
  }

  /**
   * 处理支付宝退款
   * @param {string} orderId - 订单ID
   * @param {string} transactionId - 交易ID
   * @param {number} refundAmount - 退款金额
   * @param {string} refundReason - 退款原因
   * @returns {Promise<Object>} 退款结果
   */
  async processAlipayRefund(orderId, transactionId, refundAmount, refundReason) {
    // 模拟支付宝退款处理
    // 实际项目中需要调用支付宝退款API
    return {
      refundId: `alipay_refund_${Date.now()}`,
      refundAmount,
      refundTime: new Date()
    };
  }

  /**
   * 生成随机字符串
   * @param {number} length - 字符串长度
   * @returns {string} 随机字符串
   */
  generateNonceStr(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成微信支付签名
   * @param {Object} params - 参数对象
   * @returns {string} 签名
   */
  generateWechatSign(params) {
    // 排序参数
    const sortedKeys = Object.keys(params).sort();
    const stringA = sortedKeys
      .filter(key => params[key] !== '' && key !== 'sign')
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    const stringSignTemp = `${stringA}&key=${this.config.wechat.apiKey}`;
    return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
  }

  /**
   * 生成支付宝签名
   * @param {Object} params - 参数对象
   * @returns {string} 签名
   */
  generateAlipaySign(params) {
    // 排序参数
    const sortedKeys = Object.keys(params).sort();
    const stringA = sortedKeys
      .filter(key => params[key] !== '' && key !== 'sign')
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    // 模拟RSA2签名
    return crypto.createHash('sha256').update(stringA).digest('hex');
  }

  /**
   * 验证微信签名
   * @param {Object} data - 数据对象
   * @param {string} signature - 签名
   * @returns {boolean} 验证结果
   */
  verifyWechatSignature(data, signature) {
    const calculatedSign = this.generateWechatSign(data);
    return calculatedSign === signature;
  }

  /**
   * 验证支付宝签名
   * @param {Object} data - 数据对象
   * @param {string} signature - 签名
   * @returns {boolean} 验证结果
   */
  verifyAlipaySignature(data, signature) {
    const calculatedSign = this.generateAlipaySign(data);
    return calculatedSign === signature;
  }

  /**
   * 生成支付码URL
   * @param {Object} params - 参数对象
   * @returns {string} 支付码
   */
  generateCodeUrl(params) {
    // 模拟生成支付码
    return Buffer.from(JSON.stringify(params)).toString('base64');
  }
}

// 创建单例实例
const paymentService = new PaymentService();

// 导出方法
module.exports = {
  generatePaymentQR: (options) => paymentService.generatePaymentQR(options),
  processPayment: (paymentData) => paymentService.processPayment(paymentData),
  requestRefund: (refundData) => paymentService.requestRefund(refundData),
  verifyPaymentResult: (paymentData) => paymentService.verifyPaymentResult(paymentData)
};