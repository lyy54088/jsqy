import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  personality: 'strict' | 'gentle' | 'humorous';
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
    deepSeekEnabled: boolean;
    deepSeekApiKey?: string;
  };
}

// 契约接口
export interface Contract {
  id: string;
  userId: string;
  type: 'normal' | 'brave' | 'custom';
  amount: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  dailyTasks: string[];
  completedDays: number;
  violationDays: number;
  remainingAmount: number;
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
  
  // DeepSeek API 相关
  deepSeekApiKey: string | null;
  deepSeekEnabled: boolean;
  
  // UI状态
  loading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User) => void;
  logout: () => void;
  setAICoach: (coach: AICoach) => void;
  createContract: (contract: Omit<Contract, 'id'>) => void;
  addCheckIn: (checkIn: Omit<CheckIn, 'id'>) => void;
  updateCheckInStatus: (checkInId: string, status: CheckIn['status']) => void;
  
  // AI 对话相关方法
  initializeChatSession: (coachId: string) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id'>) => void;
  clearCurrentChatSession: () => void;
  loadChatSession: (sessionId: string) => void;
  
  setDeepSeekConfig: (apiKey: string, enabled: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}



// 创建store
export const useAppStore = create<AppState>()(persist(
  (set, get) => ({
    // 初始状态 - 添加测试数据
    user: {
      id: 'test-user-1',
      phone: '13800138000',
      nickname: '测试用户',
      age: 25,
      height: 170,
      weight: 65,
      fitnessGoal: 'lose_weight' as const,
      createdAt: new Date(),
      loginType: 'phone' as const
    },
    isLoggedIn: true,
    aiCoach: {
      id: 'test-coach-1',
      name: '小美教练',
      personality: 'gentle' as const,
      avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNzUiIHI9Ijc1IiBmaWxsPSJ1cmwoI2dyYWRpZW50MCkiLz4KPGNpcmNsZSBjeD0iNzUiIGN5PSI2MCIgcj0iMjUiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOSIvPgo8ZWxsaXBzZSBjeD0iNzUiIGN5PSIxMjAiIHJ4PSI0MCIgcnk9IjMwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjkiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQwIiB4MT0iMCIgeTE9IjAiIHgyPSIxNTAiIHkyPSIxNTAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzk5NTVGRiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGRjU1REQiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K',
      userId: 'test-user-1',
      customIdentity: {
        role: '专业健身教练',
        description: '拥有5年健身指导经验，专注于科学健身和营养搭配',
        speakingStyle: '温和耐心，善于鼓励，用简单易懂的方式解释专业知识',
        traits: ['耐心', '专业', '鼓励', '温和']
      },
      config: {
        voiceEnabled: true,
        reminderFrequency: 'medium' as const,
        deepSeekEnabled: false,
        deepSeekApiKey: undefined
      }
    },
    currentContract: {
      id: 'test-contract-1',
      userId: 'test-user-1',
      type: 'normal' as const,
      amount: 500,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
      status: 'active' as const,
      dailyTasks: ['早餐', '午餐', '晚餐', '健身', '蛋白质'],
      completedDays: 0,
      violationDays: 0,
      remainingAmount: 500
    },
    contractHistory: [],
    todayCheckIns: [],
    checkInHistory: [],
    currentChatSession: null,
    chatHistory: [],
    deepSeekApiKey: null,
    deepSeekEnabled: false,
    loading: false,
    error: null,
    
    // Actions
    setUser: (user) => set({ user, isLoggedIn: true }),
    
    logout: () => set({ 
      user: null, 
      isLoggedIn: false, 
      aiCoach: null, 
      currentContract: null,
      todayCheckIns: [],
    }),
    
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
              todayCheckInsBeforeThis.some(c => c.type === type && c.status === 'approved')
            );
            
            if (!wasAlreadyComplete) {
              updatedContract = {
                ...state.currentContract,
                completedDays: state.currentContract.completedDays + 1
              };
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
    
    setDeepSeekConfig: (apiKey, enabled) => {
      set({ deepSeekApiKey: apiKey, deepSeekEnabled: enabled });
      // 同时更新 AI 教练的配置
      const currentCoach = get().aiCoach;
      if (currentCoach) {
        set({
          aiCoach: {
            ...currentCoach,
            config: {
              ...currentCoach.config,
              deepSeekEnabled: enabled,
              deepSeekApiKey: apiKey
            }
          }
        });
      }
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
      currentChatSession: state.currentChatSession,
      chatHistory: state.chatHistory,
      deepSeekApiKey: state.deepSeekApiKey,
      deepSeekEnabled: state.deepSeekEnabled,
    }),
  }
));

// 选择器
export const useUser = () => useAppStore(state => state.user);
export const useIsLoggedIn = () => useAppStore(state => state.isLoggedIn);
export const useAICoach = () => useAppStore(state => state.aiCoach);
export const useCurrentContract = () => useAppStore(state => state.currentContract);
export const useTodayCheckIns = () => useAppStore(state => state.todayCheckIns);
export const useCurrentChatSession = () => useAppStore(state => state.currentChatSession);
export const useChatHistory = () => useAppStore(state => state.chatHistory);
export const useDeepSeekApiKey = () => useAppStore(state => state.deepSeekApiKey);
export const useDeepSeekEnabled = () => useAppStore(state => state.deepSeekEnabled);
export const useLoading = () => useAppStore(state => state.loading);
export const useError = () => useAppStore(state => state.error);