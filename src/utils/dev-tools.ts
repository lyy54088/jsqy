/**
 * 开发工具 - 用于清理测试数据和重置应用状态
 */

export const DevTools = {
  /**
   * 清理所有本地存储的数据
   */
  clearAllData: () => {
    // 清理 Zustand 持久化存储
    localStorage.removeItem('fitness-contract-storage');
    
    // 清理其他可能的本地存储
    const keysToRemove = [];
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
    
    // 清理 sessionStorage
    sessionStorage.clear();
    
    console.log('✅ 所有本地数据已清理');
    
    // 刷新页面以重置应用状态
    window.location.reload();
  },

  /**
   * 清理用户数据但保留设置
   */
  clearUserData: () => {
    const storage = localStorage.getItem('fitness-contract-storage');
    if (storage) {
      try {
        const data = JSON.parse(storage);
        // 只保留一些基础设置，清理用户相关数据
        const cleanData = {
          state: {
            user: null,
            isLoggedIn: false,
            aiCoach: null,
            currentContract: null,
            contractHistory: [],
            todayCheckIns: [],
            checkInHistory: [],
            currentChatSession: null,
            chatHistory: [],
            loading: false,
            error: null
          },
          version: data.version || 0
        };
        
        localStorage.setItem('fitness-contract-storage', JSON.stringify(cleanData));
        console.log('✅ 用户数据已清理，设置已保留');
        window.location.reload();
      } catch (error: unknown) {
        console.error('清理用户数据时出错:', error);
        DevTools.clearAllData();
      }
    }
  },

  /**
   * 显示当前存储的数据（用于调试）
   */
  showStoredData: () => {
    const storage = localStorage.getItem('fitness-contract-storage');
    if (storage) {
      try {
        const data = JSON.parse(storage);
        console.log('📊 当前存储的数据:', data);
        return data;
      } catch (error: unknown) {
        console.error('解析存储数据时出错:', error);
      }
    } else {
      console.log('📊 没有找到存储的数据');
    }
    return null;
  },

  /**
   * 检查是否有测试数据
   */
  hasTestData: () => {
    const storage = localStorage.getItem('fitness-contract-storage');
    if (storage) {
      try {
        const data = JSON.parse(storage);
        const state = data.state;
        
        // 检查是否有测试用户或测试契约
        const hasTestUser = state?.user && (
          state.user.nickname?.includes('测试') ||
          state.user.phone?.includes('test') ||
          state.user.id?.includes('test')
        );
        
        const hasTestContract = state?.currentContract && (
          state.currentContract.amount === 500 ||
          state.currentContract.remainingAmount === 500
        );
        
        return hasTestUser || hasTestContract;
      } catch (error: unknown) {
        console.error('检查测试数据时出错:', error);
      }
    }
    return false;
  }
};

// 在开发环境下将工具挂载到 window 对象
if (import.meta.env.DEV) {
  (window as unknown as { DevTools: typeof DevTools }).DevTools = DevTools;
  console.log('🛠️ 开发工具已加载，使用 DevTools.clearAllData() 清理所有数据');
}