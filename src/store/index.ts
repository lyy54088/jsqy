import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { notificationService, NotificationType } from '@/lib/notification-service';

// 用户信息接口
export interface User {
  id: string;
  phone: string;
  nickname: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  fitnessGoal: 'lose_weight' | 'gain_muscle';
  avatar?: string;
  createdAt: Date;
  loginType?: 'phone' | 'wechat'; // 登录方式
}

// AI教练接口
export interface AICoach {
  id: string;
  name: string;
  personality: 'loli' | 'queen' | 'mambo' | 'strict' | 'gentle';
  avatar: string;
  userId: string;
  // 自定义身份设置
  customIdentity?: {
    role: string; // 自定义角色身份，如"专业健身教练"、"营养师"等
    description: string; // 身份描述
    speakingStyle: string; // 说话方式描述
    traits: string[]; // 性格特点标签
  };
  config: {
    voiceEnabled: boolean;
    reminderFrequency: 'low' | 'medium' | 'high';
  };
}

// 训练计划接口
export interface WorkoutPlan {
  planId: string;
  planType?: 'default' | 'weekend' | 'custom'; // 计划类型：标准计划、周末计划或自定义计划
  intensity: string;
  goal: string;
  selectedDays: string[];
  weeklyWorkoutDays: number;
  totalDays: number; // 总天数
  customSelectedWeekdays?: string[]; // 自定义计划选择的星期
  lastModified?: Date; // 上次修改时间，用于30天限制
}

// 契约接口
export interface Contract {
  id: string;
  userId: string;
  type: 'normal' | 'brave' | 'custom';
  amount: number;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'cancelled';
  dailyTasks: string[];
  completedDays: number;
  violationDays: number;
  remainingAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed'; // 支付状态
  paymentId?: string; // 支付订单ID
  paidAt?: Date; // 支付时间
  // 新的违约金机制字段
  violationPenalty: number; // 每次违约扣除金额（保证金的1/3）
  accumulatedPenalty: number; // 累计扣除的违约金
  remainderAmount: number; // 除不尽的余数，到期后返还
  // 健身模式
  fitnessMode: 'standard' | 'weekend'; // 健身模式：标准模式或周末模式
  // 训练计划
  workoutPlan?: WorkoutPlan; // 可选的训练计划
}

// 打卡记录接口
export interface CheckIn {
  id: string;
  userId: string;
  contractId: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'gym' | 'protein';
  imageUrl: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  aiResult: {
    recognized: boolean;
    confidence: number;
    healthScore?: number; // 0-100, 仅食物
    description: string;
  };
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected';
}

// AI 对话消息接口
export interface ChatMessage {
  id: string;
  type: 'user' | 'coach';
  content: string;
  timestamp: Date;
  coachId: string; // 关联的教练ID
}

// AI 对话会话接口
export interface ChatSession {
  id: string;
  userId: string;
  coachId: string;
  messages: ChatMessage[];
  lastActiveAt: Date;
  createdAt: Date;
}

// 通知配置接口
export interface NotificationSettings {
  enabled: boolean;
  frequency: 'low' | 'medium' | 'high';
  quietHours: {
    start: string; // HH:MM 格式
    end: string;   // HH:MM 格式
  };
  types: {
    checkInReminder: boolean;
    checkinReminder: boolean;
    contractExpiry: boolean;
    aiCoachMessage: boolean;
    dailyMotivation: boolean;
    mealReminder: boolean;
    gymReminder: boolean;
    proteinReminder: boolean;
  };
}

// 应用状态接口
interface AppState {
  // 用户相关
  user: User | null;
  isLoggedIn: boolean;
  
  // AI教练相关
  aiCoach: AICoach | null;
  
  // 契约相关
  currentContract: Contract | null;
  contractHistory: Contract[];
  
  // 打卡相关
  todayCheckIns: CheckIn[];
  checkInHistory: CheckIn[];
  
  // AI 对话相关
  currentChatSession: ChatSession | null;
  chatHistory: ChatSession[];
  

  
  // 通知设置
  notificationSettings: NotificationSettings;
  
  // UI状态
  loading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User) => void;
  logout: () => void;
  resetAllData: () => void;
  setAICoach: (coach: AICoach) => void;
  createContract: (contract: Omit<Contract, 'id'>) => void;
  updateContract: (contractId: string, updates: Partial<Contract>) => void;
  addCheckIn: (checkIn: Omit<CheckIn, 'id'>) => void;
  updateCheckInStatus: (checkInId: string, status: CheckIn['status']) => void;
  // 违约处理函数
  processViolation: (contractId: string) => void;
  
  // AI 对话相关方法
  initializeChatSession: (coachId: string) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id'>) => void;
  clearCurrentChatSession: () => void;
  loadChatSession: (sessionId: string) => void;
  
  // 通知设置相关方法
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}



// 默认通知设置
const getDefaultNotificationSettings = (): NotificationSettings => ({
  enabled: true,
  frequency: 'medium',
  quietHours: {
    start: '22:00',
    end: '08:00'
  },
  types: {
    checkInReminder: true,
    checkinReminder: true,
    contractExpiry: true,
    aiCoachMessage: true,
    dailyMotivation: true,
    mealReminder: true,
    gymReminder: true,
    proteinReminder: true
  }
});

// 默认初始状态
const getInitialState = () => ({
  user: null,
  isLoggedIn: false,
  aiCoach: null,
  currentContract: null,
  contractHistory: [],
  todayCheckIns: [],
  checkInHistory: [],
  currentChatSession: null,
  chatHistory: [],
  notificationSettings: getDefaultNotificationSettings(),
  loading: false,
  error: null
});

// 创建store
export const useAppStore = create<AppState>()(persist(
  (set, get) => ({
    // 初始状态
    ...getInitialState(),
    
    // Actions
    setUser: (user) => set({ user, isLoggedIn: true }),
    
    logout: () => set({ 
      user: null, 
      isLoggedIn: false, 
      aiCoach: null, 
      currentContract: null,
      todayCheckIns: [],
    }),
    
    resetAllData: () => {
      // 清理localStorage
      localStorage.removeItem('fitness-contract-storage');
      // 重置所有状态到初始值
      set(() => getInitialState());
    },
    
    setAICoach: (coach) => set({ aiCoach: coach }),
    
    createContract: (contractData) => {
      const contract: Contract = {
        ...contractData,
        id: Date.now().toString(),
      };
      set({ 
        currentContract: contract,
        contractHistory: [...get().contractHistory, contract]
      });
    },
    
    updateContract: (contractId, updates) => {
      set(state => {
        const updatedContract = state.currentContract?.id === contractId 
          ? { ...state.currentContract, ...updates }
          : state.currentContract;
        
        const updatedHistory = state.contractHistory.map(contract =>
          contract.id === contractId ? { ...contract, ...updates } : contract
        );
        
        // 检查契约是否即将到期或已完成
         if (updatedContract && updates.status) {
           if (updates.status === 'completed') {
             notificationService.sendNotification({
               type: NotificationType.CONTRACT_COMPLETED,
               title: '🎊 契约完成！',
               body: `恭喜你成功完成了健身契约！`,
               data: { contractId }
             });
           } else if (updates.status === 'failed') {
             notificationService.sendNotification({
               type: NotificationType.CONTRACT_EXPIRED,
               title: '⏰ 契约已到期',
               body: '你的健身契约已到期，快来查看结果吧！',
               data: { contractId }
             });
           }
         }
        
        return {
          currentContract: updatedContract,
          contractHistory: updatedHistory
        };
      });
    },
    
    addCheckIn: (checkInData) => {
      const checkIn: CheckIn = {
        ...checkInData,
        id: Date.now().toString(),
      };
      
      const today = new Date().toDateString();
      const isToday = checkIn.timestamp.toDateString() === today;
      
      set(state => {
        const newTodayCheckIns = isToday ? [...state.todayCheckIns, checkIn] : state.todayCheckIns;
        const newCheckInHistory = [...state.checkInHistory, checkIn];
        
        // 如果是今天的打卡且状态为approved，检查是否完成了当天所有任务
        let updatedContract = state.currentContract;
        if (isToday && checkIn.status === 'approved' && state.currentContract) {
          // 必需的打卡类型
          const requiredTypes: CheckIn['type'][] = ['breakfast', 'lunch', 'dinner', 'gym', 'protein'];
          
          // 检查今天所有必需类型是否都有approved状态的打卡
          const approvedTypes = new Set(
            newTodayCheckIns
              .filter(c => c.status === 'approved')
              .map(c => c.type)
          );
          
          const allRequiredCompleted = requiredTypes.every(type => approvedTypes.has(type));
          
          // 如果所有必需任务都完成了，且今天还没有被计入completedDays
          if (allRequiredCompleted) {
            // 检查今天是否已经被计算过了（避免重复计算）
            const todayCheckInsBeforeThis = state.todayCheckIns.filter(c => c.status === 'approved');
            const wasAlreadyComplete = requiredTypes.every(type => 
              todayCheckInsBeforeThis.some(c => c.type === type)
            );
            
            if (!wasAlreadyComplete) {
              updatedContract = {
                ...state.currentContract,
                completedDays: state.currentContract.completedDays + 1
              };
              
              // 发送完成当日任务的通知
               notificationService.sendNotification({
                 type: NotificationType.DAILY_COMPLETE,
                 title: '🎉 今日任务完成！',
                 body: `恭喜你完成了今天的所有打卡任务，坚持了${updatedContract.completedDays}天！`,
                 data: { contractId: state.currentContract.id }
               });
            }
          }
        }
        
        return {
          todayCheckIns: newTodayCheckIns,
          checkInHistory: newCheckInHistory,
          currentContract: updatedContract
        };
      });
    },
    
    updateCheckInStatus: (checkInId, status) => {
      set(state => ({
        todayCheckIns: state.todayCheckIns.map(checkIn => 
          checkIn.id === checkInId ? { ...checkIn, status } : checkIn
        ),
        checkInHistory: state.checkInHistory.map(checkIn => 
          checkIn.id === checkInId ? { ...checkIn, status } : checkIn
        )
      }));
    },

    // 违约处理函数
    processViolation: (contractId) => {
      set(state => {
        const contract = state.currentContract?.id === contractId 
          ? state.currentContract 
          : state.contractHistory.find(c => c.id === contractId);
        
        if (!contract) return state;

        // 计算违约金（保证金的1/3）
        const penaltyAmount = Math.floor(contract.amount / 3);
        const remainder = contract.amount % 3;
        
        // 更新契约数据
        const updatedContract = {
          ...contract,
          violationDays: contract.violationDays + 1,
          accumulatedPenalty: (contract.accumulatedPenalty || 0) + penaltyAmount,
          remainingAmount: Math.max(0, contract.remainingAmount - penaltyAmount),
          remainderAmount: remainder // 保存余数，到期后返还
        };

        // 发送违约通知
        notificationService.sendNotification({
          type: NotificationType.CONTRACT_VIOLATION,
          title: '⚠️ 契约违约提醒',
          body: `检测到违约行为，已扣除违约金¥${penaltyAmount}元，剩余保证金¥${updatedContract.remainingAmount}元`,
          data: { contractId, penaltyAmount }
        });

        // 更新状态
        if (state.currentContract?.id === contractId) {
          return {
            ...state,
            currentContract: updatedContract,
            contractHistory: state.contractHistory.map(c => 
              c.id === contractId ? updatedContract : c
            )
          };
        } else {
          return {
            ...state,
            contractHistory: state.contractHistory.map(c => 
              c.id === contractId ? updatedContract : c
            )
          };
        }
      });
    },
    
    // AI 对话相关方法
    initializeChatSession: (coachId) => {
      const state = get();
      const userId = state.user?.id;
      if (!userId) return;
      
      // 检查是否已有当前教练的会话
      const existingSession = state.chatHistory.find(
        session => session.coachId === coachId && session.userId === userId
      );
      
      if (existingSession) {
        // 如果已有会话，加载它
        set({ currentChatSession: existingSession });
      } else {
        // 创建新会话
        const newSession: ChatSession = {
          id: Date.now().toString(),
          userId,
          coachId,
          messages: [],
          lastActiveAt: new Date(),
          createdAt: new Date()
        };
        
        set({ 
          currentChatSession: newSession,
          chatHistory: [...state.chatHistory, newSession]
        });
      }
    },
    
    addChatMessage: (messageData) => {
      const state = get();
      if (!state.currentChatSession) return;
      
      const message: ChatMessage = {
        ...messageData,
        id: Date.now().toString(),
      };
      
      const updatedSession: ChatSession = {
        ...state.currentChatSession,
        messages: [...state.currentChatSession.messages, message],
        lastActiveAt: new Date()
      };
      
      set({
        currentChatSession: updatedSession,
        chatHistory: state.chatHistory.map(session => 
          session.id === updatedSession.id ? updatedSession : session
        )
      });
    },
    
    clearCurrentChatSession: () => {
      set({ currentChatSession: null });
    },
    
    loadChatSession: (sessionId) => {
      const state = get();
      const session = state.chatHistory.find(s => s.id === sessionId);
      if (session) {
        set({ currentChatSession: session });
      }
    },
    

    
    // 通知设置相关方法
    updateNotificationSettings: (settings) => {
      set(state => ({
        notificationSettings: {
          ...state.notificationSettings,
          ...settings
        }
      }));
    },
    
    setLoading: (loading) => set({ loading }),
    
    setError: (error) => set({ error }),
    
    clearError: () => set({ error: null }),
  }),
  {
    name: 'fitness-contract-storage',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      user: state.user,
      isLoggedIn: state.isLoggedIn,
      aiCoach: state.aiCoach,
      currentContract: state.currentContract,
      contractHistory: state.contractHistory,
      checkInHistory: state.checkInHistory,
      todayCheckIns: state.todayCheckIns, // 添加今日打卡记录到持久化配置
      currentChatSession: state.currentChatSession,
      chatHistory: state.chatHistory,
      notificationSettings: state.notificationSettings,
    }),
    onRehydrateStorage: () => (state) => {
      // 数据恢复后的处理逻辑
      if (state) {
        // 清理过期的今日打卡记录
        const today = new Date().toDateString();
        const todayCheckIns = state.todayCheckIns?.filter(
          checkIn => {
            if (!checkIn || !checkIn.timestamp) return false;
            // 确保timestamp是Date对象
            const timestamp = checkIn.timestamp instanceof Date 
              ? checkIn.timestamp 
              : new Date(checkIn.timestamp);
            return timestamp.toDateString() === today;
          }
        ) || [];
        state.todayCheckIns = todayCheckIns;
        
        // 确保所有checkIn对象都有必要的属性
        state.checkInHistory = state.checkInHistory?.map(checkIn => ({
          ...checkIn,
          timestamp: checkIn.timestamp instanceof Date 
            ? checkIn.timestamp 
            : new Date(checkIn.timestamp),
          status: checkIn.status || 'pending'
        })) || [];
      }
    }
  }
));

// 选择器
export const useUser = () => useAppStore(state => state.user);
export const useIsLoggedIn = () => useAppStore(state => !!state.user);
export const useAICoach = () => useAppStore(state => state.aiCoach);
export const useCurrentContract = () => useAppStore(state => state.currentContract);
export const useTodayCheckIns = () => useAppStore(state => state.todayCheckIns);
export const useCurrentChatSession = () => useAppStore(state => state.currentChatSession);
export const useChatHistory = () => useAppStore(state => state.chatHistory);
export const useNotificationSettings = () => useAppStore(state => state.notificationSettings);
export const useLoading = () => useAppStore(state => state.loading);
export const useError = () => useAppStore(state => state.error);