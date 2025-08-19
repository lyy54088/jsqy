import express from 'express';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = express.Router();

// 手机号验证函数
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

// 发送频率限制（内存存储，生产环境建议使用Redis）
const sendLimitMap = new Map<string, { count: number; lastSent: number }>();
const SEND_LIMIT = 5; // 每小时最多发送5次
const SEND_INTERVAL = 60 * 60 * 1000; // 1小时

function checkSendLimit(phone: string): { allowed: boolean; message: string } {
  const now = Date.now();
  const record = sendLimitMap.get(phone);
  
  if (!record) {
    sendLimitMap.set(phone, { count: 1, lastSent: now });
    return { allowed: true, message: '' };
  }
  
  // 重置计数器（超过1小时）
  if (now - record.lastSent > SEND_INTERVAL) {
    sendLimitMap.set(phone, { count: 1, lastSent: now });
    return { allowed: true, message: '' };
  }
  
  // 检查发送次数
  if (record.count >= SEND_LIMIT) {
    return { allowed: false, message: '发送过于频繁，请稍后再试' };
  }
  
  // 更新计数
  record.count++;
  record.lastSent = now;
  return { allowed: true, message: '' };
}

// 阿里云短信API
router.post('/aliyun', async (req: Request, res: Response) => {
  try {
    const { phone, code, signName, templateCode } = req.body;

    // 验证必要参数
    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: '手机号和验证码不能为空'
      });
    }

    // 验证手机号格式
    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: '手机号格式不正确'
      });
    }

    // 检查发送频率限制
    const limitCheck = checkSendLimit(phone);
    if (!limitCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: limitCheck.message
      });
    }

    // 检查环境变量配置
    if (!process.env.ALIYUN_ACCESS_KEY_ID || !process.env.ALIYUN_ACCESS_KEY_SECRET) {
      logger.smsConfigError('aliyun', '缺少必要的环境变量配置');
      logger.smsSuccess('aliyun', phone, { mode: 'mock', code });
      return res.json({ 
        success: true, 
        message: '验证码发送成功（模拟模式）',
        provider: 'aliyun',
        mode: 'mock'
      });
    }

    // 使用阿里云短信SDK
    const Dysmsapi20170525 = require('@alicloud/dysmsapi20170525');
    const OpenApi = require('@alicloud/openapi-client');

    const config = new OpenApi.Config({
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
      endpoint: 'dysmsapi.aliyuncs.com'
    });

    const client = new Dysmsapi20170525.default(config);
    
    const sendSmsRequest = new Dysmsapi20170525.SendSmsRequest({
      phoneNumbers: phone,
      signName: signName || process.env.ALIYUN_SMS_SIGN_NAME || '健身契约',
      templateCode: templateCode || process.env.ALIYUN_SMS_TEMPLATE_CODE,
      templateParam: JSON.stringify({ code })
    });

    const result = await client.sendSms(sendSmsRequest);
    
    if (result.body.code === 'OK') {
      logger.smsSuccess('aliyun', phone, { requestId: result.body.requestId });
      res.json({ 
        success: true, 
        message: '验证码发送成功',
        provider: 'aliyun',
        requestId: result.body.requestId
      });
    } else {
      logger.smsError('aliyun', phone, result.body.message, { code: result.body.code });
      res.json({ 
        success: false, 
        message: result.body.message || '发送失败',
        code: result.body.code
      });
    }

  } catch (error) {
    const { phone } = req.body;
    logger.smsError('aliyun', phone || 'unknown', error);
    res.status(500).json({ 
      success: false, 
      message: '短信发送失败，请稍后重试'
    });
  }
});

// 腾讯云短信API
router.post('/tencent', async (req: Request, res: Response) => {
  try {
    const { phone, code, signName, templateId } = req.body;

    // 验证必要参数
    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: '手机号和验证码不能为空'
      });
    }

    // 验证手机号格式
    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: '手机号格式不正确'
      });
    }

    // 检查发送频率限制
    const limitCheck = checkSendLimit(phone);
    if (!limitCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: limitCheck.message
      });
    }

    // 检查环境变量配置
    if (!process.env.TENCENT_SECRET_ID || !process.env.TENCENT_SECRET_KEY || !process.env.TENCENT_SMS_APP_ID) {
      logger.smsConfigError('tencent', '缺少必要的环境变量配置');
      logger.smsSuccess('tencent', phone, { mode: 'mock', code });
      return res.json({ 
        success: true, 
        message: '验证码发送成功（模拟模式）',
        provider: 'tencent',
        mode: 'mock'
      });
    }

    // 使用腾讯云短信SDK
    const tencentcloud = require('tencentcloud-sdk-nodejs');
    const SmsClient = tencentcloud.sms.v20210111.Client;
    
    const clientConfig = {
      credential: {
        secretId: process.env.TENCENT_SECRET_ID,
        secretKey: process.env.TENCENT_SECRET_KEY,
      },
      region: 'ap-beijing',
      profile: {
        httpProfile: {
          endpoint: 'sms.tencentcloudapi.com',
        },
      },
    };
    
    const client = new SmsClient(clientConfig);
    
    const params = {
      PhoneNumberSet: [phone],
      SmsSdkAppId: process.env.TENCENT_SMS_APP_ID,
      SignName: signName || process.env.TENCENT_SMS_SIGN_NAME || '健身契约',
      TemplateId: templateId || process.env.TENCENT_SMS_TEMPLATE_ID,
      TemplateParamSet: [code],
    };
    
    const result = await client.SendSms(params);
    
    if (result.SendStatusSet && result.SendStatusSet[0] && result.SendStatusSet[0].Code === 'Ok') {
      logger.smsSuccess('tencent', phone, { requestId: result.RequestId });
      res.json({ 
        success: true, 
        message: '验证码发送成功',
        provider: 'tencent',
        requestId: result.RequestId
      });
    } else {
      const errorMsg = result.SendStatusSet?.[0]?.Message || '发送失败';
      logger.smsError('tencent', phone, errorMsg, { code: result.SendStatusSet?.[0]?.Code });
      res.json({ 
        success: false, 
        message: errorMsg,
        code: result.SendStatusSet?.[0]?.Code
      });
    }

  } catch (error) {
    const { phone } = req.body;
    logger.smsError('tencent', phone || 'unknown', error);
    res.status(500).json({ 
      success: false, 
      message: '短信发送失败，请稍后重试'
    });
  }
});

// 华为云短信API
router.post('/huawei', async (req: Request, res: Response) => {
  try {
    const { phone, code, signature, templateId } = req.body;

    // 验证必要参数
    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: '手机号和验证码不能为空'
      });
    }

    // 验证手机号格式
    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: '手机号格式不正确'
      });
    }

    // 检查发送频率限制
    const limitCheck = checkSendLimit(phone);
    if (!limitCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: limitCheck.message
      });
    }

    // 检查环境变量配置
    if (!process.env.HUAWEI_ACCESS_KEY || !process.env.HUAWEI_SECRET_KEY || !process.env.HUAWEI_SMS_CHANNEL) {
      logger.smsConfigError('huawei', '缺少必要的环境变量配置');
      logger.smsSuccess('huawei', phone, { mode: 'mock', code });
      return res.json({ 
        success: true, 
        message: '验证码发送成功（模拟模式）',
        provider: 'huawei',
        mode: 'mock'
      });
    }

    // 使用华为云短信SDK
    const { SmsClient } = require('@huaweicloud/huaweicloud-sdk-sms');
    const { GlobalCredentials } = require('@huaweicloud/huaweicloud-sdk-core');
    
    const credentials = new GlobalCredentials()
      .withAk(process.env.HUAWEI_ACCESS_KEY)
      .withSk(process.env.HUAWEI_SECRET_KEY);
    
    const client = SmsClient.newBuilder()
      .withCredential(credentials)
      .withEndpoint('https://smsapi.cn-north-4.myhuaweicloud.com')
      .build();
    
    const request = {
      from: process.env.HUAWEI_SMS_CHANNEL,
      to: [phone],
      templateId: templateId || process.env.HUAWEI_SMS_TEMPLATE_ID,
      templateParas: [code],
      signature: signature || process.env.HUAWEI_SMS_SIGNATURE || '健身契约'
    };
    
    const result = await client.sendSms(request);
    
    if (result.result && result.result.length > 0 && result.result[0].status === '000000') {
      logger.smsSuccess('huawei', phone, { messageId: result.result[0].messageId });
      res.json({ 
        success: true, 
        message: '验证码发送成功',
        provider: 'huawei',
        messageId: result.result[0].messageId
      });
    } else {
      const errorMsg = result.result?.[0]?.status || '发送失败';
      logger.smsError('huawei', phone, errorMsg, { code: result.result?.[0]?.status });
      res.json({ 
        success: false, 
        message: `发送失败: ${errorMsg}`,
        code: result.result?.[0]?.status
      });
    }

  } catch (error) {
    const { phone } = req.body;
    logger.smsError('huawei', phone || 'unknown', error);
    res.status(500).json({ 
      success: false, 
      message: '短信发送失败，请稍后重试'
    });
  }
});

// 获取短信发送统计
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // 这里可以返回短信发送的统计信息
    res.json({
      success: true,
      data: {
        todaySent: 0,
        monthSent: 0,
        successRate: 0.95,
        providers: ['aliyun', 'tencent', 'huawei']
      }
    });
  } catch (error) {
    console.error('获取短信统计失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取统计失败' 
    });
  }
});

// 短信统计接口
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = logger.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取短信统计失败', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败'
    });
  }
});

// 健康检查接口
router.get('/health', (req: Request, res: Response) => {
  const providers = {
    aliyun: {
      configured: !!(process.env.ALIYUN_ACCESS_KEY_ID && process.env.ALIYUN_ACCESS_KEY_SECRET),
      required_env: ['ALIYUN_ACCESS_KEY_ID', 'ALIYUN_ACCESS_KEY_SECRET', 'ALIYUN_SMS_SIGN_NAME', 'ALIYUN_SMS_TEMPLATE_CODE']
    },
    tencent: {
      configured: !!(process.env.TENCENT_SECRET_ID && process.env.TENCENT_SECRET_KEY && process.env.TENCENT_SMS_SDK_APP_ID),
      required_env: ['TENCENT_SECRET_ID', 'TENCENT_SECRET_KEY', 'TENCENT_SMS_SDK_APP_ID', 'TENCENT_SMS_SIGN_NAME', 'TENCENT_SMS_TEMPLATE_ID']
    },
    huawei: {
      configured: !!(process.env.HUAWEI_ACCESS_KEY_ID && process.env.HUAWEI_SECRET_ACCESS_KEY),
      required_env: ['HUAWEI_ACCESS_KEY_ID', 'HUAWEI_SECRET_ACCESS_KEY', 'HUAWEI_SMS_CHANNEL_NUMBER', 'HUAWEI_SMS_TEMPLATE_ID', 'HUAWEI_SMS_SIGNATURE']
    }
  };

  const configuredCount = Object.values(providers).filter(p => p.configured).length;
  
  res.json({
    success: true,
    data: {
      status: configuredCount > 0 ? 'healthy' : 'warning',
      message: configuredCount > 0 ? `${configuredCount}个短信服务商已配置` : '未配置任何短信服务商，将使用模拟模式',
      providers,
      configured_count: configuredCount,
      total_count: Object.keys(providers).length
    }
  });
});

export default router;