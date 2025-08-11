/**
 * 数据清理工具 - 专门处理无效的契约数据
 */

export class DataCleaner {
  private static readonly STORAGE_KEY = 'fitness-contract-storage';
  
  /**
   * 检查并清理无效的契约数据
   */
  static checkAndCleanInvalidData(): boolean {
    try {
      const storageData = localStorage.getItem(this.STORAGE_KEY);
      if (!storageData) {
        return false;
      }

      const data = JSON.parse(storageData);
      const state = data.state;
      
      // 检查各种无效状态
      const issues = this.detectIssues(state);
      
      if (issues.length > 0) {
        console.warn('检测到数据问题:', issues);
        this.cleanData();
        return true;
      }
      
      return false;
    } catch (error: unknown) {
      console.error('检查数据时出错:', error);
      this.cleanData();
      return true;
    }
  }
  
  /**
   * 检测数据问题
   */
  private static detectIssues(state: unknown): string[] {
    const issues: string[] = [];
    
    // 1. 没有用户但有契约
    if (!state?.user && state?.currentContract) {
      issues.push('没有用户但存在契约数据');
    }
    
    // 2. 契约用户ID与当前用户ID不匹配
    if (state?.user && state?.currentContract && 
        state.currentContract.userId !== state.user.id) {
      issues.push('契约用户ID与当前用户ID不匹配');
    }
    
    // 3. 特殊检查：500元保证金但没有用户（这是测试数据的典型特征）
    if (state?.currentContract && 
        (state.currentContract.amount === 500 || state.currentContract.remainingAmount === 500) &&
        !state?.user) {
      issues.push('检测到500元保证金但没有用户（疑似测试数据）');
    }
    
    // 4. 契约状态异常
    if (state?.currentContract && !state.currentContract.userId) {
      issues.push('契约缺少用户ID');
    }
    
    return issues;
  }
  
  /**
   * 清理数据
   */
  private static cleanData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('✅ 无效数据已清理');
  }
  
  /**
   * 强制清理所有数据
   */
  static forceCleanAll(): void {
    // 清理主要存储
    localStorage.removeItem(this.STORAGE_KEY);
    
    // 清理其他相关存储
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('fitness') || 
        key.includes('contract') || 
        key.includes('coach') || 
        key.includes('checkin')
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // 清理会话存储
    sessionStorage.clear();
    
    console.log('✅ 所有数据已强制清理');
  }
  
  /**
   * 获取当前存储的数据（用于调试）
   */
  static getStoredData(): unknown {
    try {
      const storageData = localStorage.getItem(this.STORAGE_KEY);
      return storageData ? JSON.parse(storageData) : null;
    } catch (error: unknown) {
      console.error('获取存储数据时出错:', error);
      return null;
    }
  }
}

// 在开发环境下将工具挂载到 window 对象
if (import.meta.env.DEV) {
  (window as unknown as { DataCleaner: typeof DataCleaner }).DataCleaner = DataCleaner;
  console.log('🧹 数据清理工具已加载，使用 DataCleaner.forceCleanAll() 强制清理所有数据');
}