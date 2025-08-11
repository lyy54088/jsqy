/**
 * 通知服务
 * 处理各种类型的用户通知
 */

const EventEmitter = require('events');

class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.channels = {
      push: true,      // 推送通知
      sms: false,      // 短信通知
      email: false,    // 邮件通知
      websocket: true  // WebSocket实时通知
    };
    
    this.templates = {
      payment_success: {
        title: '支付成功',
        template: '您的保证金 ¥{amount} 支付成功，契约已生效。',
        priority: 'high'
      },
      payment_failed: {
        title: '支付失败',
        template: '保证金支付失败，请重新尝试。金额：¥{amount}',
        priority: 'high'
      },
      refund_request: {
        title: '退款申请已提交',
        template: '您的保证金退款申请已提交，退款金额：¥{amount}，预计1-3个工作日到账。',
        priority: 'medium'
      },
      refund_success: {
        title: '退款成功',
        template: '您的保证金 ¥{amount} 已成功退款，请查收。',
        priority: 'high'
      },
      refund_failed: {
        title: '退款失败',
        template: '保证金退款失败，请联系客服。退款金额：¥{amount}',
        priority: 'high'
      },
      contract_created: {
        title: '契约创建成功',
        template: '您的健身契约已创建成功，保证金：¥{amount}，请按时完成打卡。',
        priority: 'medium'
      },
      contract_violation: {
        title: '契约违约提醒',
        template: '检测到您今日未完成打卡，将从保证金中扣除 ¥{penalty}。',
        priority: 'high'
      },
      deposit_expiring: {
        title: '保证金即将过期',
        template: '您的保证金 ¥{amount} 将在24小时后过期，请及时使用。',
        priority: 'medium'
      }
    };
  }

  /**
   * 发送通知
   * @param {string} userId - 用户ID
   * @param {Object} notification - 通知内容
   * @param {string} notification.type - 通知类型
   * @param {string} notification.title - 通知标题
   * @param {string} notification.message - 通知消息
   * @param {Object} notification.data - 附加数据
   * @param {Array} channels - 发送渠道
   * @returns {Promise<Object>} 发送结果
   */
  async sendNotification(userId, notification, channels = ['push', 'websocket']) {
    try {
      const { type, title, message, data = {} } = notification;
      
      // 获取通知模板
      const template = this.templates[type];
      
      // 格式化消息内容
      const formattedMessage = template 
        ? this.formatMessage(template.template, data)
        : message;
      
      const finalNotification = {
        id: this.generateNotificationId(),
        userId,
        type,
        title: title || (template ? template.title : '系统通知'),
        message: formattedMessage,
        data,
        priority: template ? template.priority : 'medium',
        channels,
        createdAt: new Date(),
        status: 'pending'
      };

      // 发送到各个渠道
      const results = await Promise.allSettled(
        channels.map(channel => this.sendToChannel(channel, finalNotification))
      );

      // 统计发送结果
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.length - successCount;

      // 触发通知事件
      this.emit('notification_sent', {
        notification: finalNotification,
        results,
        successCount,
        failureCount
      });

      return {
        success: successCount > 0,
        notificationId: finalNotification.id,
        successCount,
        failureCount,
        results: results.map((result, index) => ({
          channel: channels[index],
          success: result.status === 'fulfilled',
          error: result.status === 'rejected' ? result.reason : null
        }))
      };

    } catch (error) {
      console.error('发送通知失败:', error);
      throw new Error('发送通知失败');
    }
  }

  /**
   * 发送到指定渠道
   * @param {string} channel - 渠道名称
   * @param {Object} notification - 通知对象
   * @returns {Promise<Object>} 发送结果
   */
  async sendToChannel(channel, notification) {
    if (!this.channels[channel]) {
      throw new Error(`渠道 ${channel} 未启用`);
    }

    switch (channel) {
      case 'push':
        return this.sendPushNotification(notification);
      case 'sms':
        return this.sendSMSNotification(notification);
      case 'email':
        return this.sendEmailNotification(notification);
      case 'websocket':
        return this.sendWebSocketNotification(notification);
      default:
        throw new Error(`不支持的通知渠道: ${channel}`);
    }
  }

  /**
   * 发送推送通知
   * @param {Object} notification - 通知对象
   * @returns {Promise<Object>} 发送结果
   */
  async sendPushNotification(notification) {
    try {
      // 模拟推送通知发送
      // 实际项目中需要集成推送服务（如极光推送、个推等）
      console.log('发送推送通知:', {
        userId: notification.userId,
        title: notification.title,
        message: notification.message
      });

      // 模拟异步发送
      await new Promise(resolve => setTimeout(resolve, 100));

      return {
        success: true,
        channel: 'push',
        messageId: `push_${Date.now()}`,
        sentAt: new Date()
      };

    } catch (error) {
      console.error('推送通知发送失败:', error);
      throw error;
    }
  }

  /**
   * 发送短信通知
   * @param {Object} notification - 通知对象
   * @returns {Promise<Object>} 发送结果
   */
  async sendSMSNotification(notification) {
    try {
      // 模拟短信发送
      // 实际项目中需要集成短信服务（如阿里云短信、腾讯云短信等）
      console.log('发送短信通知:', {
        userId: notification.userId,
        message: notification.message
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      return {
        success: true,
        channel: 'sms',
        messageId: `sms_${Date.now()}`,
        sentAt: new Date()
      };

    } catch (error) {
      console.error('短信通知发送失败:', error);
      throw error;
    }
  }

  /**
   * 发送邮件通知
   * @param {Object} notification - 通知对象
   * @returns {Promise<Object>} 发送结果
   */
  async sendEmailNotification(notification) {
    try {
      // 模拟邮件发送
      // 实际项目中需要集成邮件服务（如SendGrid、阿里云邮件推送等）
      console.log('发送邮件通知:', {
        userId: notification.userId,
        title: notification.title,
        message: notification.message
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      return {
        success: true,
        channel: 'email',
        messageId: `email_${Date.now()}`,
        sentAt: new Date()
      };

    } catch (error) {
      console.error('邮件通知发送失败:', error);
      throw error;
    }
  }

  /**
   * 发送WebSocket通知
   * @param {Object} notification - 通知对象
   * @returns {Promise<Object>} 发送结果
   */
  async sendWebSocketNotification(notification) {
    try {
      // 模拟WebSocket通知发送
      // 实际项目中需要通过WebSocket连接发送实时通知
      console.log('发送WebSocket通知:', {
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data
      });

      // 触发WebSocket事件
      this.emit('websocket_notification', notification);

      return {
        success: true,
        channel: 'websocket',
        messageId: `ws_${Date.now()}`,
        sentAt: new Date()
      };

    } catch (error) {
      console.error('WebSocket通知发送失败:', error);
      throw error;
    }
  }

  /**
   * 批量发送通知
   * @param {Array} notifications - 通知列表
   * @returns {Promise<Array>} 发送结果列表
   */
  async sendBatchNotifications(notifications) {
    const results = await Promise.allSettled(
      notifications.map(({ userId, notification, channels }) => 
        this.sendNotification(userId, notification, channels)
      )
    );

    return results.map((result, index) => ({
      index,
      success: result.status === 'fulfilled',
      result: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }

  /**
   * 格式化消息模板
   * @param {string} template - 消息模板
   * @param {Object} data - 数据对象
   * @returns {string} 格式化后的消息
   */
  formatMessage(template, data) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  /**
   * 生成通知ID
   * @returns {string} 通知ID
   */
  generateNotificationId() {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 设置通知渠道状态
   * @param {string} channel - 渠道名称
   * @param {boolean} enabled - 是否启用
   */
  setChannelStatus(channel, enabled) {
    if (this.channels.hasOwnProperty(channel)) {
      this.channels[channel] = enabled;
    }
  }

  /**
   * 添加通知模板
   * @param {string} type - 通知类型
   * @param {Object} template - 模板配置
   */
  addTemplate(type, template) {
    this.templates[type] = template;
  }

  /**
   * 获取通知统计
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 统计结果
   */
  async getNotificationStats(userId, options = {}) {
    // 模拟统计数据
    // 实际项目中需要从数据库查询
    return {
      totalSent: 150,
      totalRead: 120,
      totalUnread: 30,
      byType: {
        payment_success: 25,
        payment_failed: 5,
        refund_request: 10,
        contract_created: 20,
        contract_violation: 15
      },
      byChannel: {
        push: 140,
        websocket: 150,
        sms: 30,
        email: 20
      },
      lastNotificationAt: new Date()
    };
  }
}

// 创建单例实例
const notificationService = new NotificationService();

// 导出方法
module.exports = {
  sendNotification: (userId, notification, channels) => 
    notificationService.sendNotification(userId, notification, channels),
  sendBatchNotifications: (notifications) => 
    notificationService.sendBatchNotifications(notifications),
  getNotificationStats: (userId, options) => 
    notificationService.getNotificationStats(userId, options),
  setChannelStatus: (channel, enabled) => 
    notificationService.setChannelStatus(channel, enabled),
  addTemplate: (type, template) => 
    notificationService.addTemplate(type, template),
  
  // 导出事件监听器
  on: (event, listener) => notificationService.on(event, listener),
  off: (event, listener) => notificationService.off(event, listener),
  emit: (event, data) => notificationService.emit(event, data)
};