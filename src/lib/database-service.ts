import { ObjectId } from 'mongodb';
import { 
  getCollection, 
  User, 
  CheckInRecord, 
  Contract, 
  AICoachSession,
  COLLECTIONS 
} from './mongodb';

/**
 * 用户相关数据库操作
 */
export class UserService {
  /**
   * 创建新用户
   */
  static async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const collection = await getCollection<User>(COLLECTIONS.USERS);
    
    const newUser: User = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await collection.insertOne(newUser);
    return { ...newUser, _id: result.insertedId.toString() };
  }

  /**
   * 根据邮箱查找用户
   */
  static async findUserByEmail(email: string): Promise<User | null> {
    const collection = await getCollection<User>(COLLECTIONS.USERS);
    return await collection.findOne({ email });
  }

  /**
   * 根据用户名查找用户
   */
  static async findUserByUsername(username: string): Promise<User | null> {
    const collection = await getCollection<User>(COLLECTIONS.USERS);
    return await collection.findOne({ username });
  }

  /**
   * 根据ID查找用户
   */
  static async findUserById(userId: string): Promise<User | null> {
    const collection = await getCollection<User>(COLLECTIONS.USERS);
    return await collection.findOne({ _id: new ObjectId(userId) });
  }

  /**
   * 更新用户信息
   */
  static async updateUser(userId: string, updateData: Partial<User>): Promise<boolean> {
    const collection = await getCollection<User>(COLLECTIONS.USERS);
    
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        } 
      }
    );
    
    return result.modifiedCount > 0;
  }
}

/**
 * 打卡记录相关数据库操作
 */
export class CheckInService {
  /**
   * 创建打卡记录
   */
  static async createCheckIn(checkInData: Omit<CheckInRecord, '_id' | 'createdAt'>): Promise<CheckInRecord> {
    const collection = await getCollection<CheckInRecord>(COLLECTIONS.CHECK_INS);
    
    const newCheckIn: CheckInRecord = {
      ...checkInData,
      createdAt: new Date(),
    };
    
    const result = await collection.insertOne(newCheckIn);
    return { ...newCheckIn, _id: result.insertedId.toString() };
  }

  /**
   * 获取用户的打卡记录
   */
  static async getUserCheckIns(userId: string, limit: number = 50): Promise<CheckInRecord[]> {
    const collection = await getCollection<CheckInRecord>(COLLECTIONS.CHECK_INS);
    
    return await collection
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * 获取用户今日打卡记录
   */
  static async getTodayCheckIns(userId: string): Promise<CheckInRecord[]> {
    const collection = await getCollection<CheckInRecord>(COLLECTIONS.CHECK_INS);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await collection
      .find({
        userId,
        timestamp: {
          $gte: today,
          $lt: tomorrow
        }
      })
      .sort({ timestamp: -1 })
      .toArray();
  }

  /**
   * 获取用户指定日期范围的打卡记录
   */
  static async getCheckInsByDateRange(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<CheckInRecord[]> {
    const collection = await getCollection<CheckInRecord>(COLLECTIONS.CHECK_INS);
    
    return await collection
      .find({
        userId,
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .sort({ timestamp: -1 })
      .toArray();
  }
}

/**
 * 契约相关数据库操作
 */
export class ContractService {
  /**
   * 创建新契约
   */
  static async createContract(contractData: Omit<Contract, '_id' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
    const collection = await getCollection<Contract>(COLLECTIONS.CONTRACTS);
    
    const newContract: Contract = {
      ...contractData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await collection.insertOne(newContract);
    return { ...newContract, _id: result.insertedId.toString() };
  }

  /**
   * 获取用户的契约列表
   */
  static async getUserContracts(userId: string): Promise<Contract[]> {
    const collection = await getCollection<Contract>(COLLECTIONS.CONTRACTS);
    
    return await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  /**
   * 获取用户的活跃契约
   */
  static async getActiveContract(userId: string): Promise<Contract | null> {
    const collection = await getCollection<Contract>(COLLECTIONS.CONTRACTS);
    
    return await collection.findOne({
      userId,
      status: 'active'
    });
  }

  /**
   * 更新契约状态
   */
  static async updateContract(contractId: string, updateData: Partial<Contract>): Promise<boolean> {
    const collection = await getCollection<Contract>(COLLECTIONS.CONTRACTS);
    
    const result = await collection.updateOne(
      { _id: new ObjectId(contractId) },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        } 
      }
    );
    
    return result.modifiedCount > 0;
  }

  /**
   * 更新契约进度
   */
  static async updateContractProgress(
    contractId: string, 
    completedDays: number, 
    totalPenalty: number, 
    checkInDate: Date
  ): Promise<boolean> {
    const collection = await getCollection<Contract>(COLLECTIONS.CONTRACTS);
    
    const result = await collection.updateOne(
      { _id: new ObjectId(contractId) },
      { 
        $set: {
          'progress.completedDays': completedDays,
          'progress.totalPenalty': totalPenalty,
          updatedAt: new Date()
        },
        $push: {
          'progress.checkInHistory': checkInDate
        }
      }
    );
    
    return result.modifiedCount > 0;
  }
}

/**
 * AI教练会话相关数据库操作
 */
export class AICoachService {
  /**
   * 创建新的AI教练会话
   */
  static async createSession(sessionData: Omit<AICoachSession, '_id' | 'createdAt' | 'updatedAt'>): Promise<AICoachSession> {
    const collection = await getCollection<AICoachSession>(COLLECTIONS.AI_COACH_SESSIONS);
    
    const newSession: AICoachSession = {
      ...sessionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await collection.insertOne(newSession);
    return { ...newSession, _id: result.insertedId.toString() };
  }

  /**
   * 获取用户的AI教练会话列表
   */
  static async getUserSessions(userId: string, limit: number = 20): Promise<AICoachSession[]> {
    const collection = await getCollection<AICoachSession>(COLLECTIONS.AI_COACH_SESSIONS);
    
    return await collection
      .find({ userId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * 获取指定会话
   */
  static async getSession(sessionId: string): Promise<AICoachSession | null> {
    const collection = await getCollection<AICoachSession>(COLLECTIONS.AI_COACH_SESSIONS);
    
    return await collection.findOne({ _id: new ObjectId(sessionId) });
  }

  /**
   * 添加消息到会话
   */
  static async addMessageToSession(
    sessionId: string, 
    message: { role: 'user' | 'assistant'; content: string }
  ): Promise<boolean> {
    const collection = await getCollection<AICoachSession>(COLLECTIONS.AI_COACH_SESSIONS);
    
    const result = await collection.updateOne(
      { _id: new ObjectId(sessionId) },
      { 
        $push: {
          messages: {
            ...message,
            timestamp: new Date()
          }
        },
        $set: {
          updatedAt: new Date()
        }
      }
    );
    
    return result.modifiedCount > 0;
  }

  /**
   * 删除会话
   */
  static async deleteSession(sessionId: string): Promise<boolean> {
    const collection = await getCollection<AICoachSession>(COLLECTIONS.AI_COACH_SESSIONS);
    
    const result = await collection.deleteOne({ _id: new ObjectId(sessionId) });
    return result.deletedCount > 0;
  }
}

/**
 * 通用数据库操作
 */
export class DatabaseService {
  /**
   * 获取数据库统计信息
   */
  static async getDatabaseStats() {
    const userCollection = await getCollection(COLLECTIONS.USERS);
    const checkInCollection = await getCollection(COLLECTIONS.CHECK_INS);
    const contractCollection = await getCollection(COLLECTIONS.CONTRACTS);
    const sessionCollection = await getCollection(COLLECTIONS.AI_COACH_SESSIONS);
    
    const [userCount, checkInCount, contractCount, sessionCount] = await Promise.all([
      userCollection.countDocuments(),
      checkInCollection.countDocuments(),
      contractCollection.countDocuments(),
      sessionCollection.countDocuments(),
    ]);
    
    return {
      users: userCount,
      checkIns: checkInCount,
      contracts: contractCount,
      aiSessions: sessionCount,
      timestamp: new Date(),
    };
  }

  /**
   * 清理过期数据
   */
  static async cleanupExpiredData(daysToKeep: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const checkInCollection = await getCollection(COLLECTIONS.CHECK_INS);
    const sessionCollection = await getCollection(COLLECTIONS.AI_COACH_SESSIONS);
    
    // 删除过期的打卡记录
    await checkInCollection.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
    
    // 删除过期的AI会话
    await sessionCollection.deleteMany({
      updatedAt: { $lt: cutoffDate }
    });
    
    console.log(`🧹 已清理 ${daysToKeep} 天前的过期数据`);
  }
}