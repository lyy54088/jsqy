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
 * 创建示例数据（仅用于开发和测试）
 */
async function createSampleData(): Promise<void> {
  try {
    console.log('🎭 正在创建示例数据...');
    
    // 检查是否已有数据
    const stats = await DatabaseService.getDatabaseStats();
    if (stats.users > 0) {
      console.log('📊 数据库中已有数据，跳过示例数据创建');
      return;
    }
    
    // 创建示例用户
    const sampleUser = await UserService.createUser({
      username: 'demo_user',
      email: 'demo@example.com',
      password: 'hashed_password_here', // 在实际应用中应该是加密后的密码
      profile: {
        name: '演示用户',
        age: 25,
        height: 170,
        weight: 65,
        goal: '减脂塑形'
      }
    });
    
    console.log('👤 示例用户创建成功:', sampleUser.username);
    
    // 创建示例打卡记录
    const sampleCheckIn = await CheckInService.createCheckIn({
      userId: sampleUser._id!.toString(),
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
      }
    });
    
    console.log('📝 示例打卡记录创建成功');
    
    // 创建示例契约
    const sampleContract = await ContractService.createContract({
      userId: sampleUser._id!.toString(),
      type: 'normal',
      title: '21天健康饮食挑战',
      description: '坚持21天健康饮食，养成良好习惯',
      rules: {
        dailyCheckIns: 3,
        penaltyAmount: 3,
        duration: 21
      },
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      progress: {
        completedDays: 1,
        totalPenalty: 0,
        checkInHistory: [new Date()]
      }
    });
    
    console.log('📋 示例契约创建成功');
    
    // 创建示例AI教练会话
    const sampleSession = await AICoachService.createSession({
      userId: sampleUser._id!.toString(),
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
      ]
    });
    
    console.log('🤖 示例AI教练会话创建成功');
    
    console.log('✅ 示例数据创建完成');
  } catch (error) {
    console.error('❌ 创建示例数据失败:', error);
    // 不抛出错误，因为示例数据创建失败不应该影响应用启动
  }
}

/**
 * 测试数据库连接和基本操作
 */
export async function testDatabaseConnection(): Promise<void> {
  try {
    console.log('🧪 开始测试数据库连接...');
    
    // 测试连接
    await connectToDatabase();
    console.log('✅ 数据库连接测试通过');
    
    // 测试健康检查
    const isHealthy = await checkDatabaseHealth();
    if (!isHealthy) {
      throw new Error('数据库健康检查失败');
    }
    console.log('✅ 数据库健康检查通过');
    
    // 测试基本操作
    const stats = await DatabaseService.getDatabaseStats();
    console.log('📊 数据库统计信息:', stats);
    
    console.log('✅ 数据库测试完成！');
  } catch (error) {
    console.error('❌ 数据库测试失败:', error);
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