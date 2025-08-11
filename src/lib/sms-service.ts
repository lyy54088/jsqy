// 短信服务 - 支持多个短信服务商
import { useAppStore } from '../store';

// 短信服务商配置接口
interface SMSConfig {
  provider: 'aliyun' | 'tencent' | 'huawei' | 'mock';
  accessKeyId?: string;
  accessKeySecret?: string;
  signName?: string;
  templateCode?: string;
}

// 验证码记录接口
interface VerificationRecord {
  phone: string;
  code: string;
  timestamp: number;
  attempts: number;
  verified: boolean;
}

class SMSService {
  private config: SMSConfig;
  private verificationRecords: Map<string, VerificationRecord> = new Map();
  
  constructor() {
    // 默认配置，可以通过环境变量或设置页面修改
    this.config = {
      provider: import.meta.env.PROD ? 'aliyun' : 'mock',
      signName: '健身契约',
      templateCode: 'SMS_123456789' // 需要在短信服务商申请模板
    };
  }

  /**
   * 发送验证码
   */
  async sendVerificationCode(phone: string): Promise<{ success: boolean; message: string; code?: string }> {
    try {
      // 验证手机号格式
      if (!this.isValidPhone(phone)) {
        return { success: false, message: '手机号格式不正确' };
      }

      // 检查发送频率限制
      const rateLimit = this.checkRateLimit(phone);
      if (!rateLimit.allowed) {
        return { success: false, message: rateLimit.message };
      }

      // 生成6位数字验证码
      const code = this.generateCode();
      
      // 根据配置的服务商发送短信
      let result;
      switch (this.config.provider) {
        case 'aliyun':
          result = await this.sendByAliyun(phone, code);
          break;
        case 'tencent':
          result = await this.sendByTencent(phone, code);
          break;
        case 'huawei':
          result = await this.sendByHuawei(phone, code);
          break;
        case 'mock':
        default:
          result = await this.sendByMock(phone, code);
          break;
      }

      if (result.success) {
        // 保存验证码记录
        this.saveVerificationRecord(phone, code);
      }

      return result;
    } catch (error) {
      console.error('发送验证码失败:', error);
      return { success: false, message: '发送失败，请稍后重试' };
    }
  }

  /**
   * 验证验证码
   */
  verifyCode(phone: string, inputCode: string): { success: boolean; message: string } {
    const record = this.verificationRecords.get(phone);
    
    if (!record) {
      return { success: false, message: '请先获取验证码' };
    }

    // 检查验证码是否过期（5分钟有效期）
    const now = Date.now();
    if (now - record.timestamp > 5 * 60 * 1000) {
      this.verificationRecords.delete(phone);
      return { success: false, message: '验证码已过期，请重新获取' };
    }

    // 检查尝试次数（最多3次）
    if (record.attempts >= 3) {
      this.verificationRecords.delete(phone);
      return { success: false, message: '验证失败次数过多，请重新获取验证码' };
    }

    // 验证码校验
    if (record.code !== inputCode) {
      record.attempts++;
      return { success: false, message: `验证码错误，还可尝试${3 - record.attempts}次` };
    }

    // 验证成功
    record.verified = true;
    return { success: true, message: '验证成功' };
  }

  /**
   * 阿里云短信服务
   */
  private async sendByAliyun(phone: string, code: string): Promise<{ success: boolean; message: string; code?: string }> {
    try {
      // 这里需要集成阿里云短信SDK
      // npm install @alicloud/dysmsapi20170525
      
      const response = await fetch('http://localhost:3001/api/sms/aliyun', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          code,
          signName: this.config.signName,
          templateCode: this.config.templateCode
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return { success: true, message: '验证码发送成功' };
      } else {
        return { success: false, message: result.message || '发送失败' };
      }
    } catch (error) {
      console.error('阿里云短信发送失败:', error);
      return { success: false, message: '短信服务暂时不可用' };
    }
  }

  /**
   * 腾讯云短信服务
   */
  private async sendByTencent(phone: string, code: string): Promise<{ success: boolean; message: string; code?: string }> {
    try {
      // 这里需要集成腾讯云短信SDK
      // npm install tencentcloud-sdk-nodejs
      
      const response = await fetch('http://localhost:3001/api/sms/tencent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          code,
          signName: this.config.signName,
          templateId: this.config.templateCode
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return { success: true, message: '验证码发送成功' };
      } else {
        return { success: false, message: result.message || '发送失败' };
      }
    } catch (error) {
      console.error('腾讯云短信发送失败:', error);
      return { success: false, message: '短信服务暂时不可用' };
    }
  }

  /**
   * 华为云短信服务
   */
  private async sendByHuawei(phone: string, code: string): Promise<{ success: boolean; message: string; code?: string }> {
    try {
      // 这里需要集成华为云短信SDK
      
      const response = await fetch('http://localhost:3001/api/sms/huawei', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          code,
          signature: this.config.signName,
          templateId: this.config.templateCode
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return { success: true, message: '验证码发送成功' };
      } else {
        return { success: false, message: result.message || '发送失败' };
      }
    } catch (error) {
      console.error('华为云短信发送失败:', error);
      return { success: false, message: '短信服务暂时不可用' };
    }
  }

  /**
   * 模拟短信服务（开发环境使用）
   */
  private async sendByMock(phone: string, code: string): Promise<{ success: boolean; message: string; code?: string }> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`📱 模拟短信发送到 ${phone}: 验证码 ${code}`);
    
    // 开发环境返回验证码用于测试
    if (import.meta.env.DEV) {
      return { 
        success: true, 
        message: '验证码发送成功（开发模式）', 
        code 
      };
    }
    
    return { success: true, message: '验证码发送成功' };
  }

  /**
   * 生成6位数字验证码
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 验证手机号格式
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  /**
   * 检查发送频率限制
   */
  private checkRateLimit(phone: string): { allowed: boolean; message: string } {
    const record = this.verificationRecords.get(phone);
    const now = Date.now();
    
    if (record) {
      // 60秒内不能重复发送
      if (now - record.timestamp < 60 * 1000) {
        const remainingTime = Math.ceil((60 * 1000 - (now - record.timestamp)) / 1000);
        return { 
          allowed: false, 
          message: `请等待${remainingTime}秒后再试` 
        };
      }
    }
    
    return { allowed: true, message: '' };
  }

  /**
   * 保存验证码记录
   */
  private saveVerificationRecord(phone: string, code: string): void {
    this.verificationRecords.set(phone, {
      phone,
      code,
      timestamp: Date.now(),
      attempts: 0,
      verified: false
    });
  }

  /**
   * 更新短信服务配置
   */
  updateConfig(config: Partial<SMSConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): SMSConfig {
    return { ...this.config };
  }

  /**
   * 清理过期的验证码记录
   */
  cleanupExpiredRecords(): void {
    const now = Date.now();
    for (const [phone, record] of this.verificationRecords.entries()) {
      if (now - record.timestamp > 10 * 60 * 1000) { // 10分钟后清理
        this.verificationRecords.delete(phone);
      }
    }
  }
}

// 创建单例实例
export const smsService = new SMSService();

// 定期清理过期记录
setInterval(() => {
  smsService.cleanupExpiredRecords();
}, 5 * 60 * 1000); // 每5分钟清理一次

export default smsService;