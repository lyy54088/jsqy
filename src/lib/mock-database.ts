// 模拟数据库服务 - 用于前端演示
// 注意：实际的MongoDB连接应该在后端服务器中实现

export interface DatabaseStats {
  users: number;
  checkIns: number;
  contracts: number;
  aiSessions: number;
  timestamp: Date;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  profile?: {
    name?: string;
    age?: number;
    height?: number;
    weight?: number;
    goal?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckInRecord {
  _id: string;
  userId: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'workout' | 'protein';
  image?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  aiAnalysis?: {
    foodItems?: string[];
    healthScore?: number;
    calories?: number;
    nutritionInfo?: {
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
    };
    recommendations?: string[];
    description?: string;
  };
  timestamp: Date;
  createdAt: Date;
}

// 模拟数据存储
let mockData = {
  users: [] as User[],
  checkIns: [] as CheckInRecord[],
  contracts: [] as any[],
  aiSessions: [] as any[],
  isConnected: false,
  connectionTime: null as Date | null,
};

/**
 * 模拟数据库连接
 */
export async function connectToMockDatabase(): Promise<{ success: boolean; message: string }> {
  // 模拟连接延迟
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // 模拟连接成功率（90%）
  const success = Math.random() > 0.1;
  
  if (success) {
    mockData.isConnected = true;
    mockData.connectionTime = new Date();
    return {
      success: true,
      message: '✅ MongoDB数据库连接成功！'
    };
  } else {
    mockData.isConnected = false;
    return {
      success: false,
      message: '❌ 数据库连接失败: 连接超时或服务器不可用'
    };
  }
}

/**
 * 检查数据库健康状态
 */
export async function checkMockDatabaseHealth(): Promise<boolean> {
  // 模拟健康检查延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockData.isConnected && Math.random() > 0.05; // 95%健康率
}

/**
 * 获取数据库统计信息
 */
export async function getMockDatabaseStats(): Promise<DatabaseStats> {
  // 模拟查询延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!mockData.isConnected) {
    throw new Error('数据库未连接');
  }
  
  return {
    users: mockData.users.length,
    checkIns: mockData.checkIns.length,
    contracts: mockData.contracts.length,
    aiSessions: mockData.aiSessions.length,
    timestamp: new Date(),
  };
}

/**
 * 初始化模拟数据库
 */
export async function initializeMockDatabase(): Promise<void> {
  // 模拟初始化延迟
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (!mockData.isConnected) {
    throw new Error('数据库未连接，无法初始化');
  }
  
  // 创建索引（模拟）
  console.log('📊 正在创建数据库索引...');
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 创建示例数据
  if (mockData.users.length === 0) {
    console.log('🎭 正在创建示例数据...');
    await createMockSampleData();
  }
  
  console.log('✅ 数据库初始化完成');
}

/**
 * 创建示例数据
 */
async function createMockSampleData(): Promise<void> {
  // 创建示例用户
  const sampleUser: User = {
    _id: generateMockId(),
    username: 'demo_user',
    email: 'demo@example.com',
    profile: {
      name: '演示用户',
      age: 25,
      height: 170,
      weight: 65,
      goal: '减脂塑形'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockData.users.push(sampleUser);
  
  // 创建示例打卡记录
  const sampleCheckIn: CheckInRecord = {
    _id: generateMockId(),
    userId: sampleUser._id,
    type: 'breakfast',
    timestamp: new Date(),
    aiAnalysis: {
      foodItems: ['燕麦粥', '香蕉', '牛奶'],
      healthScore: 85,
      calories: 350,
      nutritionInfo: {
        protein: 12,
        carbs: 45,
        fat: 8,
        fiber: 6
      },
      recommendations: ['营养搭配均衡', '建议增加蛋白质摄入'],
      description: '健康的早餐选择，营养均衡'
    },
    createdAt: new Date(),
  };
  
  mockData.checkIns.push(sampleCheckIn);
  
  // 创建示例契约
  const sampleContract = {
    _id: generateMockId(),
    userId: sampleUser._id,
    type: 'normal',
    title: '21天健康饮食挑战',
    description: '坚持21天健康饮食，养成良好习惯',
    status: 'active',
    createdAt: new Date(),
  };
  
  mockData.contracts.push(sampleContract);
  
  // 创建示例AI会话
  const sampleSession = {
    _id: generateMockId(),
    userId: sampleUser._id,
    sessionType: 'general',
    messages: [
      {
        role: 'user',
        content: '你好，我想开始健身计划',
        timestamp: new Date()
      },
      {
        role: 'assistant',
        content: '你好！很高兴为你制定健身计划。首先，请告诉我你的健身目标是什么？',
        timestamp: new Date()
      }
    ],
    createdAt: new Date(),
  };
  
  mockData.aiSessions.push(sampleSession);
}

/**
 * 创建测试数据
 */
export async function createMockTestData(): Promise<void> {
  // 模拟创建延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (!mockData.isConnected) {
    throw new Error('数据库未连接');
  }
  
  // 创建测试用户
  const testUser: User = {
    _id: generateMockId(),
    username: `test_user_${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    profile: {
      name: '测试用户',
      age: 25,
      height: 170,
      weight: 65,
      goal: '健身测试'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockData.users.push(testUser);
  
  // 创建测试打卡记录
  const testCheckIn: CheckInRecord = {
    _id: generateMockId(),
    userId: testUser._id,
    type: 'breakfast',
    timestamp: new Date(),
    aiAnalysis: {
      foodItems: ['测试食物'],
      healthScore: 80,
      calories: 300,
      description: '测试打卡记录'
    },
    createdAt: new Date(),
  };
  
  mockData.checkIns.push(testCheckIn);
  
  console.log(`👤 创建测试用户: ${testUser.username}`);
  console.log('📝 创建测试打卡记录');
}

/**
 * 重置模拟数据库
 */
export async function resetMockDatabase(): Promise<void> {
  // 模拟重置延迟
  await new Promise(resolve => setTimeout(resolve, 800));
  
  mockData.users = [];
  mockData.checkIns = [];
  mockData.contracts = [];
  mockData.aiSessions = [];
  
  console.log('🔄 数据库已重置');
  
  // 重新初始化
  await initializeMockDatabase();
}

/**
 * 生成模拟ID
 */
function generateMockId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

/**
 * 获取连接状态
 */
export function getMockConnectionStatus(): { isConnected: boolean; connectionTime: Date | null } {
  return {
    isConnected: mockData.isConnected,
    connectionTime: mockData.connectionTime,
  };
}

/**
 * 断开连接
 */
export function disconnectMockDatabase(): void {
  mockData.isConnected = false;
  mockData.connectionTime = null;
}

/**
 * 模拟数据库配置信息
 */
export const MOCK_DATABASE_CONFIG = {
  uri: 'mongodb://root:mkmb9qcb@test-db-mongodb.ns-8n3gdeov.svc:27017',
  database: 'fitness_coach',
  description: '这是一个模拟的数据库连接演示。在实际应用中，MongoDB连接应该在后端服务器中实现。',
};