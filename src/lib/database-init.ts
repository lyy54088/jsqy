import { 
  connectToDatabase, 
  getDatabase, 
  checkDatabaseHealth,
  COLLECTIONS 
} from './mongodb';
import { 
  UserService, 
  CheckInService, 
  ContractService, 
  AICoachService,
  DatabaseService 
} from './database-service';

/**
 * 初始化数据库
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🚀 开始初始化数据库...');
    
    // 连接到数据库
    await connectToDatabase();
    
    // 检查数据库健康状态
    const isHealthy = await checkDatabaseHealth();
    if (!isHealthy) {
      throw new Error('数据库健康检查失败');
    }
    
    // 创建索引
    await createIndexes();
    
    // 创建示例数据（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      await createSampleData();
    }
    
    console.log('✅ 数据库初始化完成！');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  }
}

/**
 * 创建数据库索引
 */
async function createIndexes(): Promise<void> {
  try {
    console.log('📊 正在创建数据库索引...');
    
    const db = await getDatabase();
    
    // 用户集合索引
    const userCollection = db.collection(COLLECTIONS.USERS);
    await userCollection.createIndex({ email: 1 }, { unique: true });
    await userCollection.createIndex({ username: 1 }, { unique: true });
    await userCollection.createIndex({ createdAt: 1 });
    
    // 打卡记录集合索引
    const checkInCollection = db.collection(COLLECTIONS.CHECK_INS);
    await checkInCollection.createIndex({ userId: 1 });
    await checkInCollection.createIndex({ timestamp: -1 });
    await checkInCollection.createIndex({ userId: 1, timestamp: -1 });
    await checkInCollection.createIndex({ type: 1 });
    
    // 契约集合索引
    const contractCollection = db.collection(COLLECTIONS.CONTRACTS);
    await contractCollection.createIndex({ userId: 1 });
    await contractCollection.createIndex({ status: 1 });
    await contractCollection.createIndex({ userId: 1, status: 1 });
    await contractCollection.createIndex({ startDate: 1, endDate: 1 });
    
    // AI教练会话集合索引
    const sessionCollection = db.collection(COLLECTIONS.AI_COACH_SESSIONS);
    await sessionCollection.createIndex({ userId: 1 });
    await sessionCollection.createIndex({ updatedAt: -1 });
    await sessionCollection.createIndex({ sessionType: 1 });
    
    console.log('✅ 数据库索引创建完成');
  } catch (error) {
    console.error('❌ 创建数据库索引失败:', error);
    throw error;
  }
}

/**
 * 创建示例数据（已禁用，等待真实数据）
 */
async function createSampleData(): Promise<void> {
  // TODO: 移除示例数据创建，等待真实用户注册和数据
  console.log('📊 示例数据创建已禁用，等待真实用户数据');
  return;
}

/**
 * 验证数据库连接和基本操作
 */
export async function testDatabaseConnection(): Promise<void> {
  try {
    console.log('🔗 开始验证数据库连接...');
    
    // 验证连接
    await connectToDatabase();
    console.log('✅ 数据库连接验证通过');
    
    // 验证健康检查
    const isHealthy = await checkDatabaseHealth();
    if (!isHealthy) {
      throw new Error('数据库健康检查失败');
    }
    console.log('✅ 数据库健康检查通过');
    
    // 获取基本统计信息
    const stats = await DatabaseService.getDatabaseStats();
    console.log('📊 数据库统计信息:', stats);
    
    console.log('✅ 数据库验证完成！');
  } catch (error) {
    console.error('❌ 数据库验证失败:', error);
    throw error;
  }
}

/**
 * 重置数据库（仅用于开发环境）
 */
export async function resetDatabase(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('生产环境不允许重置数据库');
  }
  
  try {
    console.log('🔄 开始重置数据库...');
    
    const db = await getDatabase();
    
    // 删除所有集合
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.collection(collection.name).drop();
      console.log(`🗑️ 已删除集合: ${collection.name}`);
    }
    
    // 重新初始化
    await initializeDatabase();
    
    console.log('✅ 数据库重置完成！');
  } catch (error) {
    console.error('❌ 数据库重置失败:', error);
    throw error;
  }
}

// 导出所有服务
export {
  UserService,
  CheckInService,
  ContractService,
  AICoachService,
  DatabaseService
};