import fs from 'fs';
import path from 'path';

enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

interface LogStats {
  total: number;
  success: number;
  error: number;
  providers: Record<string, { success: number; error: number }>;
  daily: Record<string, number>;
}

class Logger {
  private logDir: string;
  private stats: LogStats;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.stats = {
      total: 0,
      success: 0,
      error: 0,
      providers: {},
      daily: {}
    };
    this.ensureLogDir();
  }

  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getLogFileName(): string {
    const today = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `sms-${today}.log`);
  }

  private sanitizePhone(phone: string): string {
    if (!phone || phone.length < 7) return phone;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }

  private writeLog(level: LogLevel, provider: string, message: string, phone?: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      provider,
      message,
      phone: phone ? this.sanitizePhone(phone) : undefined,
      data
    };

    // 控制台输出
    const logMessage = `[${level}] [${provider}] ${message}`;
    switch (level) {
      case LogLevel.ERROR:
        console.error(logMessage, data);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data);
        break;
      case LogLevel.INFO:
        console.info(logMessage, data);
        break;
      case LogLevel.DEBUG:
        console.debug(logMessage, data);
        break;
    }

    // 写入文件
    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.getLogFileName(), logLine);
    } catch (error) {
      console.error('写入日志文件失败:', error);
    }

    // 更新统计
    this.updateStats(level, provider);
  }

  private updateStats(level: LogLevel, provider: string): void {
    this.stats.total++;
    
    if (level === LogLevel.ERROR) {
      this.stats.error++;
    } else if (level === LogLevel.INFO) {
      this.stats.success++;
    }

    if (!this.stats.providers[provider]) {
      this.stats.providers[provider] = { success: 0, error: 0 };
    }

    if (level === LogLevel.ERROR) {
      this.stats.providers[provider].error++;
    } else if (level === LogLevel.INFO) {
      this.stats.providers[provider].success++;
    }

    const today = new Date().toISOString().split('T')[0];
    this.stats.daily[today] = (this.stats.daily[today] || 0) + 1;
  }

  // 短信发送成功日志
  smsSuccess(provider: string, phone: string, data?: any): void {
    this.writeLog(LogLevel.INFO, provider, '短信发送成功', phone, data);
  }

  // 短信发送失败日志
  smsError(provider: string, phone: string, error: any, data?: any): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.writeLog(LogLevel.ERROR, provider, `短信发送失败: ${errorMessage}`, phone, data);
  }

  // 配置错误日志
  smsConfigError(provider: string, message: string): void {
    this.writeLog(LogLevel.WARN, provider, `配置错误: ${message}`);
  }

  // 通用错误日志
  error(message: string, error?: any): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.writeLog(LogLevel.ERROR, 'SYSTEM', `${message}: ${errorMessage}`);
  }

  // 获取统计信息
  getStats(): LogStats {
    return { ...this.stats };
  }

  // 清理旧日志文件（保留30天）
  cleanOldLogs(): void {
    try {
      const files = fs.readdirSync(this.logDir);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      files.forEach(file => {
        if (file.startsWith('sms-') && file.endsWith('.log')) {
          const filePath = path.join(this.logDir, file);
          const stats = fs.statSync(filePath);
          if (stats.mtime < thirtyDaysAgo) {
            fs.unlinkSync(filePath);
            console.log(`已删除过期日志文件: ${file}`);
          }
        }
      });
    } catch (error) {
      console.error('清理日志文件失败:', error);
    }
  }
}

// 导出单例实例
export const logger = new Logger();

// 定期清理日志（每天执行一次）
setInterval(() => {
  logger.cleanOldLogs();
}, 24 * 60 * 60 * 1000);