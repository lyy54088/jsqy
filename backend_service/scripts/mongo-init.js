// MongoDB 初始化脚本
// 在 Docker 容器启动时自动执行

// 切换到应用数据库
db = db.getSiblingDB('fitness_coach');

// 创建应用用户
db.createUser({
  user: 'fitness_app',
  pwd: 'fitness_app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'fitness_coach'
    }
  ]
});

// 创建集合和索引
print('Creating collections and indexes...');

// 用户集合
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });
db.users.createIndex({ isActive: 1 });

// 打卡记录集合
db.createCollection('checkins');
db.checkins.createIndex({ userId: 1 });
db.checkins.createIndex({ date: 1 });
db.checkins.createIndex({ userId: 1, date: 1 }, { unique: true });
db.checkins.createIndex({ createdAt: 1 });
db.checkins.createIndex({ type: 1 });

// 契约集合
db.createCollection('contracts');
db.contracts.createIndex({ userId: 1 });
db.contracts.createIndex({ status: 1 });
db.contracts.createIndex({ startDate: 1 });
db.contracts.createIndex({ endDate: 1 });
db.contracts.createIndex({ createdAt: 1 });
db.contracts.createIndex({ userId: 1, status: 1 });

// AI教练会话集合
db.createCollection('ai_coach_sessions');
db.ai_coach_sessions.createIndex({ userId: 1 });
db.ai_coach_sessions.createIndex({ createdAt: 1 });
db.ai_coach_sessions.createIndex({ updatedAt: 1 });
db.ai_coach_sessions.createIndex({ userId: 1, createdAt: -1 });

// 插入示例数据（仅开发环境）
if (db.getName() === 'fitness_coach_dev') {
  print('Inserting sample data for development...');
  
  // 示例用户
  const sampleUser = {
    _id: ObjectId(),
    username: 'demo_user',
    email: 'demo@example.com',
    password: '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQq', // 'password123'
    profile: {
      nickname: '演示用户',
      avatar: '',
      age: 25,
      gender: 'male',
      height: 175,
      weight: 70,
      fitnessGoal: 'muscle_gain',
      activityLevel: 'moderate',
      preferences: {
        workoutTypes: ['strength', 'cardio'],
        workoutDuration: 60,
        workoutFrequency: 4
      }
    },
    settings: {
      notifications: {
        email: true,
        push: true,
        reminder: true
      },
      privacy: {
        profileVisible: true,
        dataSharing: false
      }
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  db.users.insertOne(sampleUser);
  
  // 示例打卡记录
  const sampleCheckins = [
    {
      _id: ObjectId(),
      userId: sampleUser._id,
      date: new Date().toISOString().split('T')[0],
      type: 'workout',
      data: {
        exercises: [
          {
            name: '俯卧撑',
            sets: 3,
            reps: 15,
            weight: 0,
            duration: 0
          },
          {
            name: '深蹲',
            sets: 3,
            reps: 20,
            weight: 0,
            duration: 0
          }
        ],
        duration: 45,
        calories: 200,
        notes: '今天的训练感觉不错'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  db.checkins.insertMany(sampleCheckins);
  
  // 示例契约
  const sampleContract = {
    _id: ObjectId(),
    userId: sampleUser._id,
    title: '30天健身挑战',
    description: '每天至少运动30分钟，坚持30天',
    rules: [
      '每天至少运动30分钟',
      '记录运动内容和时长',
      '不能连续缺席超过2天'
    ],
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    penalty: {
      amount: 100,
      description: '未完成挑战需要支付100元'
    },
    status: 'active',
    progress: {
      completedDays: 1,
      totalDays: 30,
      currentStreak: 1,
      longestStreak: 1
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  db.contracts.insertOne(sampleContract);
  
  // 示例AI教练会话
  const sampleSession = {
    _id: ObjectId(),
    userId: sampleUser._id,
    title: '健身计划咨询',
    messages: [
      {
        role: 'user',
        content: '我想制定一个适合初学者的健身计划',
        timestamp: new Date()
      },
      {
        role: 'assistant',
        content: '很好！作为初学者，我建议你从基础动作开始...',
        timestamp: new Date()
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  db.ai_coach_sessions.insertOne(sampleSession);
  
  print('Sample data inserted successfully!');
}

print('MongoDB initialization completed!');

// 显示数据库状态
print('Database status:');
print('Collections:', db.getCollectionNames());
print('Users collection count:', db.users.countDocuments());
print('Checkins collection count:', db.checkins.countDocuments());
print('Contracts collection count:', db.contracts.countDocuments());
print('AI Coach Sessions collection count:', db.ai_coach_sessions.countDocuments());