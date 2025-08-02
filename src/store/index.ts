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
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
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
        deepSeekEnabled: true,
        deepSeekApiKey: 'sk-0834a814d7dd43049b8f2757f3f3554f'
      }
    },
    currentContract: null,
    contractHistory: [],
    todayCheckIns: [],
    checkInHistory: [],
    deepSeekApiKey: 'sk-0834a814d7dd43049b8f2757f3f3554f',
    deepSeekEnabled: true,
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
      
      set(state => ({
        todayCheckIns: isToday ? [...state.todayCheckIns, checkIn] : state.todayCheckIns,
        checkInHistory: [...state.checkInHistory, checkIn]
      }));
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
export const useDeepSeekApiKey = () => useAppStore(state => state.deepSeekApiKey);
export const useDeepSeekEnabled = () => useAppStore(state => state.deepSeekEnabled);
export const useLoading = () => useAppStore(state => state.loading);
export const useError = () => useAppStore(state => state.error);