import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

// MongoDB连接配置
const MONGODB_URI = 'mongodb://root:mkmb9qcb@test-db-mongodb.ns-8n3gdeov.svc:27017';
const DATABASE_NAME = 'fitness_coach'; // 数据库名称

// 全局变量存储连接实例
let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * 连接到MongoDB数据库
 */
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    if (client && db) {
      // 如果已经连接，直接返回现有连接
      return { client, db };
    }

    console.log('正在连接到MongoDB数据库...');
    
    // 创建新的MongoDB客户端
    client = new MongoClient(MONGODB_URI, {
      // 连接选项
      maxPoolSize: 10, // 连接池最大连接数
      serverSelectionTimeoutMS: 5000, // 服务器选择超时时间
      socketTimeoutMS: 45000, // Socket超时时间
    });

    // 连接到数据库
    await client.connect();
    
    // 选择数据库
    db = client.db(DATABASE_NAME);
    
    // 测试连接
    await db.admin().ping();
    
    console.log('✅ MongoDB数据库连接成功！');
    console.log(`📊 数据库名称: ${DATABASE_NAME}`);
    
    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB数据库连接失败:', error);
    throw new Error(`数据库连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 获取数据库实例
 */
export async function getDatabase(): Promise<Db> {
  if (!db) {
    const { db: database } = await connectToDatabase();
    return database;
  }
  return db;
}

/**
 * 获取指定集合
 */
export async function getCollection<T = any>(collectionName: string): Promise<Collection<T>> {
  const database = await getDatabase();
  return database.collection<T>(collectionName);
}

/**
 * 关闭数据库连接
 */
export async function closeDatabaseConnection(): Promise<void> {
  try {
    if (client) {
      await client.close();
      client = null;
      db = null;
      console.log('🔌 MongoDB数据库连接已关闭');
    }
  } catch (error) {
    console.error('❌ 关闭数据库连接时出错:', error);
  }
}

/**
 * 数据库健康检查
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const database = await getDatabase();
    await database.admin().ping();
    return true;
  } catch (error) {
    console.error('❌ 数据库健康检查失败:', error);
    return false;
  }
}

// 数据模型接口定义
export interface User {
  _id?: ObjectId | string;
  username: string;
  email: string;
  password: string;
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
  _id?: ObjectId | string;
  userId: ObjectId | string;
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

export interface Contract {
  _id?: ObjectId | string;
  userId: ObjectId | string;
  type: 'normal' | 'hero';
  title: string;
  description: string;
  rules: {
    dailyCheckIns: number;
    penaltyAmount: number;
    duration: number; // 天数
  };
  status: 'active' | 'completed' | 'failed';
  startDate: Date;
  endDate: Date;
  progress: {
    completedDays: number;
    totalPenalty: number;
    checkInHistory: Date[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AICoachSession {
  _id?: ObjectId | string;
  userId: ObjectId | string;
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }[];
  sessionType: 'general' | 'nutrition' | 'workout' | 'motivation';
  createdAt: Date;
  updatedAt: Date;
}

// 导出集合名称常量
export const COLLECTIONS = {
  USERS: 'users',
  CHECK_INS: 'checkIns',
  CONTRACTS: 'contracts',
  AI_COACH_SESSIONS: 'aiCoachSessions',
} as const;