// 通知管理服务
import { sendNotification, requestNotificationPermission } from '../utils/pwa';
import { useAppStore } from '../store';

// 通知类型枚举
export enum NotificationType {
  CHECK_IN_REMINDER = 'check_in_reminder',
  CONTRACT_EXPIRY = 'contract_expiry',
  CONTRACT_COMPLETED = 'contract_completed',
  CONTRACT_EXPIRED = 'contract_expired',
  CONTRACT_VIOLATION = 'contract_violation',
  DAILY_COMPLETE = 'daily_complete',
  AI_COACH_MESSAGE = 'ai_coach_message',
  DAILY_MOTIVATION = 'daily_motivation',
  MEAL_REMINDER = 'meal_reminder',
  GYM_REMINDER = 'gym_reminder',
  PROTEIN_REMINDER = 'protein_reminder',
  TEST = 'test',
  CHECKIN_SUCCESS = 'checkin_success',
  CHECKIN_REMINDER = 'checkin_reminder'
}

// 通知配置接口
export interface NotificationConfig {
  enabled: boolean;
  frequency: 'low' | 'medium' | 'high';
  quietHours: {
    start: string; // HH:MM 格式
    end: string;   // HH:MM 格式
  };
  types: {
    [key in NotificationType]: boolean;
  };
}

// 通知数据接口
export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  scheduledTime?: Date;
  sent: boolean;
  createdAt: Date;
}

// 默认通知配置
const DEFAULT_CONFIG: NotificationConfig = {
  enabled: true,
  frequency: 'medium',
  quietHours: {
    start: '22:00',
    end: '08:00'
  },
  types: {
    [NotificationType.CHECK_IN_REMINDER]: true,
    [NotificationType.CONTRACT_EXPIRY]: true,
    [NotificationType.CONTRACT_COMPLETED]: true,
    [NotificationType.CONTRACT_EXPIRED]: true,
    [NotificationType.CONTRACT_VIOLATION]: true,
    [NotificationType.DAILY_COMPLETE]: true,
    [NotificationType.AI_COACH_MESSAGE]: true,
    [NotificationType.DAILY_MOTIVATION]: true,
    [NotificationType.MEAL_REMINDER]: true,
    [NotificationType.GYM_REMINDER]: true,
    [NotificationType.PROTEIN_REMINDER]: true,
    [NotificationType.TEST]: true,
    [NotificationType.CHECKIN_SUCCESS]: true,
    [NotificationType.CHECKIN_REMINDER]: true
  }
};

class NotificationService {
  private config: NotificationConfig;
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();
  private notificationHistory: NotificationData[] = [];

  constructor() {
    this.config = this.loadConfig();
    this.initializeService();
  }

  // 初始化服务
  public async initialize() {
    return this.initializeService();
  }

  // 初始化服务
  private async initializeService() {
    // 请求通知权限
    await requestNotificationPermission();
    
    // 设置定时提醒
    this.setupDailyReminders();
    
    // 监听应用状态变化
    this.setupStateListeners();
  }

  // 加载通知配置
  private loadConfig(): NotificationConfig {
    const saved = localStorage.getItem('notification-config');
    if (saved) {
      try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      } catch (error) {
        console.error('加载通知配置失败:', error);
      }
    }
    return DEFAULT_CONFIG;
  }

  // 保存通知配置
  public saveConfig(config: Partial<NotificationConfig>) {
    this.config = { ...this.config, ...config };
    localStorage.setItem('notification-config', JSON.stringify(this.config));
  }

  // 获取当前配置
  public getConfig(): NotificationConfig {
    return { ...this.config };
  }

  // 检查是否在静默时间
  private isQuietTime(): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const { start, end } = this.config.quietHours;
    
    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      // 跨天的情况（如 22:00 到 08:00）
      return currentTime >= start || currentTime <= end;
    }
  }

  // 发送通知
  public async sendNotification(data: Omit<NotificationData, 'id' | 'sent' | 'createdAt'>) {
    // 检查通知是否启用
    if (!this.config.enabled || !this.config.types[data.type]) {
      return;
    }

    // 检查静默时间
    if (this.isQuietTime()) {
      console.log('当前为静默时间，跳过通知发送');
      return;
    }

    const notification: NotificationData = {
      ...data,
      id: Date.now().toString(),
      sent: true,
      createdAt: new Date()
    };

    // 发送本地通知
    sendNotification(notification.title, {
      body: notification.body,
      icon: notification.icon || '/icons/icon-192x192.png',
      badge: notification.badge || '/icons/icon-72x72.png',
      data: notification.data,
      tag: notification.type // 防止重复通知
    });

    // 保存到历史记录
    this.notificationHistory.push(notification);
    this.saveHistory();

    console.log('通知已发送:', notification);
  }

  // 安排定时通知
  public scheduleNotification(data: Omit<NotificationData, 'id' | 'sent' | 'createdAt'>, scheduledTime: Date) {
    const notificationId = Date.now().toString();
    const delay = scheduledTime.getTime() - Date.now();

    if (delay <= 0) {
      // 如果时间已过，立即发送
      this.sendNotification(data);
      return;
    }

    const timeout = setTimeout(() => {
      this.sendNotification(data);
      this.scheduledNotifications.delete(notificationId);
    }, delay);

    this.scheduledNotifications.set(notificationId, timeout);
    console.log(`通知已安排在 ${scheduledTime.toLocaleString()} 发送`);
  }

  // 取消定时通知
  public cancelScheduledNotification(notificationId: string) {
    const timeout = this.scheduledNotifications.get(notificationId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledNotifications.delete(notificationId);
    }
  }

  // 设置每日提醒
  private setupDailyReminders() {
    // 早餐提醒时间段：6:00 - 9:00
    this.scheduleDailyNotification(6, 0, {
      type: NotificationType.MEAL_REMINDER,
      title: '🌅 早餐时间到了！',
      body: '快到时间咯，不要忘了打开拍照，记录你的美食~'
    });

    this.scheduleDailyNotification(9, 0, {
      type: NotificationType.CHECKIN_REMINDER,
      title: '⏰ 早餐打卡提醒',
      body: '快到时间咯，不要忘了打开拍照，记录你的美食！早餐时间即将结束~'
    });

    // 午餐提醒时间段：11:00 - 13:00
    this.scheduleDailyNotification(11, 0, {
      type: NotificationType.MEAL_REMINDER,
      title: '🍽️ 午餐时间！',
      body: '快到时间咯，不要忘了打开拍照，记录你的美食~'
    });

    this.scheduleDailyNotification(13, 0, {
      type: NotificationType.CHECKIN_REMINDER,
      title: '⏰ 午餐打卡提醒',
      body: '快到时间咯，不要忘了打开拍照，记录你的美食！午餐时间即将结束~'
    });

    // 晚餐提醒时间段：16:00 - 19:00
    this.scheduleDailyNotification(16, 0, {
      type: NotificationType.MEAL_REMINDER,
      title: '🍲 晚餐时间到！',
      body: '快到时间咯，不要忘了打开拍照，记录你的美食~'
    });

    this.scheduleDailyNotification(19, 0, {
      type: NotificationType.CHECKIN_REMINDER,
      title: '⏰ 晚餐打卡提醒',
      body: '快到时间咯，不要忘了打开拍照，记录你的美食！晚餐时间即将结束~'
    });

    // 健身提醒 (20:00)
    this.scheduleDailyNotification(20, 0, {
      type: NotificationType.GYM_REMINDER,
      title: '💪 健身时间！',
      body: '是时候去健身房挥洒汗水了，加油！'
    });

    // 蛋白质补充提醒 (21:00)
    this.scheduleDailyNotification(21, 0, {
      type: NotificationType.PROTEIN_REMINDER,
      title: '🥛 蛋白质补充时间',
      body: '记得补充蛋白质，帮助肌肉恢复和生长~'
    });

    // 每日激励 (8:00)
    this.scheduleDailyNotification(8, 0, {
      type: NotificationType.DAILY_MOTIVATION,
      title: '✨ 新的一天开始了！',
      body: this.getRandomMotivationalMessage()
    });
  }

  // 安排每日定时通知
  private scheduleDailyNotification(hour: number, minute: number, data: Omit<NotificationData, 'id' | 'sent' | 'createdAt'>) {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // 如果今天的时间已过，安排到明天
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    this.scheduleNotification(data, scheduledTime);

    // 设置每日重复
    const dailyInterval = 24 * 60 * 60 * 1000; // 24小时
    setInterval(() => {
      this.scheduleNotification(data, new Date(Date.now() + dailyInterval));
    }, dailyInterval);
  }

  // 获取随机激励消息
  private getRandomMotivationalMessage(): string {
    const messages = [
      '每一次坚持都是对未来更好自己的投资！',
      '今天的努力，明天的收获！',
      '相信自己，你比想象中更强大！',
      '小步前进，也是进步！',
      '健康的身体是一切的基础！',
      '坚持不懈，必有回报！',
      '每一滴汗水都在为梦想加油！',
      '今天的你要比昨天更好一点！'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // 监听应用状态变化
  private setupStateListeners() {
    // 监听契约状态变化
    const checkContractStatus = () => {
      const state = useAppStore.getState();
      const contract = state.currentContract;
      
      if (contract && contract.status === 'active') {
        const endDate = new Date(contract.endDate);
        const now = new Date();
        const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // 契约即将到期提醒（3天前）
        if (daysLeft === 3) {
          this.sendNotification({
            type: NotificationType.CONTRACT_EXPIRY,
            title: '⚠️ 契约即将到期',
            body: `您的契约还有3天到期，请继续坚持打卡！`
          });
        }
        
        // 契约到期当天提醒
        if (daysLeft === 0) {
          this.sendNotification({
            type: NotificationType.CONTRACT_EXPIRY,
            title: '🎯 契约到期了！',
            body: '恭喜您完成了契约挑战，查看您的成果吧！'
          });
        }
      }
    };

    // 每小时检查一次契约状态
    setInterval(checkContractStatus, 60 * 60 * 1000);
    
    // 立即检查一次
    checkContractStatus();
  }

  // 发送打卡提醒
  public sendCheckInReminder(type: 'breakfast' | 'lunch' | 'dinner' | 'gym' | 'protein') {
    const messages = {
      breakfast: { title: '🍳 早餐打卡提醒', body: '别忘了为今天的早餐拍照打卡哦！' },
      lunch: { title: '🍽️ 午餐打卡提醒', body: '午餐时间到了，记得拍照打卡~' },
      dinner: { title: '🍲 晚餐打卡提醒', body: '晚餐准备好了吗？快来打卡吧！' },
      gym: { title: '💪 健身打卡提醒', body: '在健身房吗？记得拍照证明你的努力！' },
      protein: { title: '🥛 蛋白质打卡提醒', body: '补充蛋白质了吗？别忘了打卡记录~' }
    };

    const message = messages[type];
    this.sendNotification({
      type: NotificationType.CHECK_IN_REMINDER,
      title: message.title,
      body: message.body,
      data: { checkInType: type }
    });
  }

  // 发送AI教练消息通知
  public sendAICoachNotification(coachName: string, message: string) {
    this.sendNotification({
      type: NotificationType.AI_COACH_MESSAGE,
      title: `💬 ${coachName} 给您发消息了`,
      body: message.length > 50 ? message.substring(0, 50) + '...' : message,
      data: { coachMessage: message }
    });
  }

  // 保存通知历史
  private saveHistory() {
    // 只保留最近100条记录
    const recentHistory = this.notificationHistory.slice(-100);
    localStorage.setItem('notification-history', JSON.stringify(recentHistory));
  }

  // 获取通知历史
  public getNotificationHistory(): NotificationData[] {
    const saved = localStorage.getItem('notification-history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('加载通知历史失败:', error);
      }
    }
    return [];
  }

  // 清理过期的定时通知
  public cleanup() {
    this.scheduledNotifications.forEach((timeout, id) => {
      clearTimeout(timeout);
    });
    this.scheduledNotifications.clear();
  }
}

// 创建单例实例
export const notificationService = new NotificationService();

// 导出便捷方法
export const {
  sendNotification: sendAppNotification,
  scheduleNotification,
  sendCheckInReminder,
  sendAICoachNotification,
  getConfig: getNotificationConfig,
  saveConfig: saveNotificationConfig
} = notificationService;