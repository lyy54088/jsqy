# 社群功能后端代码结构方案

## 概述

本文档定义了AI健身教练应用社群功能的后端代码组织结构，采用模块化设计，确保代码的可维护性、可扩展性和团队协作效率。

## 项目目录结构

```
backend_service/
├── src/
│   ├── config/                 # 配置文件
│   │   ├── database.js         # 数据库配置
│   │   ├── redis.js           # Redis配置
│   │   ├── storage.js         # 文件存储配置
│   │   ├── socket.js          # Socket.IO配置
│   │   └── index.js           # 配置入口
│   │
│   ├── models/                # 数据模型
│   │   ├── Community.js       # 社群模型
│   │   ├── CommunityMember.js # 社群成员模型
│   │   ├── Message.js         # 消息模型
│   │   ├── UserLocation.js    # 用户位置模型
│   │   ├── Invitation.js      # 邀请模型
│   │   └── index.js           # 模型导出
│   │
│   ├── controllers/           # 控制器
│   │   ├── communityController.js    # 社群管理控制器
│   │   ├── messageController.js      # 消息控制器
│   │   ├── locationController.js     # 位置服务控制器
│   │   ├── uploadController.js       # 文件上传控制器
│   │   └── invitationController.js   # 邀请控制器
│   │
│   ├── services/              # 业务逻辑服务
│   │   ├── communityService.js       # 社群业务逻辑
│   │   ├── messageService.js         # 消息业务逻辑
│   │   ├── locationService.js        # 位置服务逻辑
│   │   ├── uploadService.js          # 文件上传逻辑
│   │   ├── notificationService.js    # 通知服务
│   │   ├── cacheService.js           # 缓存服务
│   │   └── index.js                  # 服务导出
│   │
│   ├── routes/                # 路由定义
│   │   ├── communities.js     # 社群路由
│   │   ├── messages.js        # 消息路由
│   │   ├── locations.js       # 位置路由
│   │   ├── uploads.js         # 上传路由
│   │   ├── invitations.js     # 邀请路由
│   │   └── index.js           # 路由汇总
│   │
│   ├── middleware/            # 中间件
│   │   ├── auth.js           # 认证中间件
│   │   ├── validation.js     # 数据验证中间件
│   │   ├── rateLimit.js      # 速率限制中间件
│   │   ├── upload.js         # 文件上传中间件
│   │   ├── errorHandler.js   # 错误处理中间件
│   │   ├── logger.js         # 日志中间件
│   │   └── index.js          # 中间件导出
│   │
│   ├── socket/               # WebSocket处理
│   │   ├── handlers/         # Socket事件处理器
│   │   │   ├── messageHandler.js     # 消息处理
│   │   │   ├── communityHandler.js   # 社群处理
│   │   │   ├── locationHandler.js    # 位置处理
│   │   │   └── index.js              # 处理器导出
│   │   ├── middleware/       # Socket中间件
│   │   │   ├── auth.js       # Socket认证
│   │   │   └── rateLimit.js  # Socket速率限制
│   │   └── index.js          # Socket入口
│   │
│   ├── utils/                # 工具函数
│   │   ├── validation.js     # 数据验证工具
│   │   ├── encryption.js     # 加密工具
│   │   ├── fileHelper.js     # 文件处理工具
│   │   ├── geoHelper.js      # 地理位置工具
│   │   ├── dateHelper.js     # 日期处理工具
│   │   ├── logger.js         # 日志工具
│   │   └── constants.js      # 常量定义
│   │
│   ├── validators/           # 数据验证规则
│   │   ├── communityValidators.js    # 社群验证规则
│   │   ├── messageValidators.js      # 消息验证规则
│   │   ├── locationValidators.js     # 位置验证规则
│   │   └── index.js                  # 验证器导出
│   │
│   ├── jobs/                 # 定时任务
│   │   ├── cleanupMessages.js        # 清理过期消息
│   │   ├── updateCommunityStats.js   # 更新社群统计
│   │   ├── locationCleanup.js        # 清理位置数据
│   │   └── index.js                  # 任务调度
│   │
│   └── app.js                # 应用入口
│
├── tests/                    # 测试文件
│   ├── unit/                 # 单元测试
│   │   ├── services/         # 服务测试
│   │   ├── models/           # 模型测试
│   │   └── utils/            # 工具测试
│   ├── integration/          # 集成测试
│   │   ├── api/              # API测试
│   │   └── socket/           # Socket测试
│   ├── fixtures/             # 测试数据
│   └── setup.js              # 测试配置
│
├── docs/                     # 文档
│   ├── api/                  # API文档
│   ├── deployment/           # 部署文档
│   └── development/          # 开发文档
│
├── scripts/                  # 脚本文件
│   ├── seed.js              # 数据初始化
│   ├── migrate.js           # 数据迁移
│   └── deploy.js            # 部署脚本
│
├── .env.example             # 环境变量示例
├── .gitignore              # Git忽略文件
├── package.json            # 项目依赖
├── package-lock.json       # 依赖锁定
├── Dockerfile              # Docker配置
├── docker-compose.yml      # Docker Compose配置
├── nginx.conf              # Nginx配置
└── README.md               # 项目说明
```

## 核心模块详细设计

### 1. 数据模型 (Models)

#### Community.js
```javascript
const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 500
  },
  avatar: {
    type: String,
    default: '🏃‍♂️'
  },
  memberCount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxMembers: {
    type: Number,
    default: 1000,
    min: 1
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String,
    city: String,
    district: String,
    poi: String
  },
  settings: {
    allowImageUpload: {
      type: Boolean,
      default: true
    },
    allowLocationShare: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    autoDeleteMessages: {
      type: Boolean,
      default: false
    },
    messageRetentionDays: {
      type: Number,
      default: 90
    }
  },
  tags: [String],
  category: {
    type: String,
    enum: ['running', 'fitness', 'yoga', 'cycling', 'swimming', 'other'],
    default: 'fitness'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 地理位置索引
communitySchema.index({ location: '2dsphere' });

// 复合索引
communitySchema.index({ 
  isPublic: 1, 
  isActive: 1, 
  lastActivityAt: -1 
});

// 文本搜索索引
communitySchema.index({ 
  name: 'text', 
  description: 'text', 
  tags: 'text' 
});

module.exports = mongoose.model('Community', communitySchema);
```

#### Message.js
```javascript
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['text', 'image', 'location', 'system'],
    default: 'text'
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'file']
    },
    url: String,
    filename: String,
    size: Number,
    mimeType: String,
    metadata: {
      width: Number,
      height: Number,
      duration: Number
    }
  }],
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    accuracy: Number
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  systemData: {
    action: String,
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    metadata: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// 索引设计
messageSchema.index({ communityId: 1, createdAt: -1 });
messageSchema.index({ userId: 1, createdAt: -1 });
messageSchema.index({ location: '2dsphere' });
messageSchema.index({ replyTo: 1 });

// TTL索引 - 自动删除过期消息
messageSchema.index({ createdAt: 1 }, { 
  expireAfterSeconds: 7776000  // 90天
});

module.exports = mongoose.model('Message', messageSchema);
```

### 2. 服务层 (Services)

#### communityService.js
```javascript
const Community = require('../models/Community');
const CommunityMember = require('../models/CommunityMember');
const cacheService = require('./cacheService');
const locationService = require('./locationService');

class CommunityService {
  // 获取附近社群
  async getNearbyCommunities(latitude, longitude, radius = 10000, options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    const communities = await Community.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius
        }
      },
      isPublic: true,
      isActive: true
    })
    .select('-settings -createdBy')
    .limit(limit)
    .skip(offset)
    .sort({ lastActivityAt: -1 });

    // 计算距离并添加到结果中
    const communitiesWithDistance = communities.map(community => {
      const distance = locationService.calculateDistance(
        { lat: latitude, lng: longitude },
        { 
          lat: community.location.coordinates[1], 
          lng: community.location.coordinates[0] 
        }
      );
      
      return {
        ...community.toObject(),
        distance: Math.round(distance * 100) / 100 // 保留两位小数
      };
    });

    return communitiesWithDistance;
  }

  // 搜索社群
  async searchCommunities(query, location = null, options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    let searchQuery = {
      $text: { $search: query },
      isPublic: true,
      isActive: true
    };

    // 如果提供了位置，添加地理位置过滤
    if (location) {
      searchQuery.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          $maxDistance: 50000 // 50km
        }
      };
    }

    const communities = await Community.find(searchQuery)
      .select('-settings -createdBy')
      .limit(limit)
      .skip(offset)
      .sort({ score: { $meta: 'textScore' }, lastActivityAt: -1 });

    return communities;
  }

  // 获取社群详情
  async getCommunityDetails(communityId, userId) {
    // 先从缓存获取
    let community = await cacheService.getCommunityInfo(communityId);
    
    if (!community) {
      community = await Community.findById(communityId);
      if (!community) {
        throw new Error('Community not found');
      }
    }

    // 检查用户是否已加入
    const membership = await CommunityMember.findOne({
      communityId,
      userId,
      status: 'active'
    });

    return {
      ...community.toObject(),
      isJoined: !!membership,
      userRole: membership ? membership.role : null
    };
  }

  // 加入社群
  async joinCommunity(communityId, userId, message = '') {
    const community = await Community.findById(communityId);
    if (!community) {
      throw new Error('Community not found');
    }

    // 检查是否已加入
    const existingMember = await CommunityMember.findOne({
      communityId,
      userId
    });

    if (existingMember && existingMember.status === 'active') {
      throw new Error('Already joined this community');
    }

    // 检查社群是否已满
    if (community.memberCount >= community.maxMembers) {
      throw new Error('Community is full');
    }

    const memberData = {
      communityId,
      userId,
      role: 'member',
      status: community.settings.requireApproval ? 'pending' : 'active',
      joinedAt: new Date()
    };

    // 如果是重新加入，更新现有记录
    if (existingMember) {
      await CommunityMember.findByIdAndUpdate(existingMember._id, memberData);
    } else {
      await CommunityMember.create(memberData);
    }

    // 如果不需要审批，立即更新成员数量
    if (!community.settings.requireApproval) {
      await Community.findByIdAndUpdate(communityId, {
        $inc: { memberCount: 1 },
        lastActivityAt: new Date()
      });

      // 清除缓存
      await cacheService.clearCommunityCache(communityId);
    }

    return {
      status: community.settings.requireApproval ? 'pending' : 'joined',
      message: community.settings.requireApproval ? 
        'Application submitted, waiting for approval' : 
        'Successfully joined community'
    };
  }

  // 退出社群
  async leaveCommunity(communityId, userId) {
    const membership = await CommunityMember.findOne({
      communityId,
      userId,
      status: 'active'
    });

    if (!membership) {
      throw new Error('Not a member of this community');
    }

    // 更新成员状态
    await CommunityMember.findByIdAndUpdate(membership._id, {
      status: 'left',
      leftAt: new Date()
    });

    // 更新社群成员数量
    await Community.findByIdAndUpdate(communityId, {
      $inc: { memberCount: -1 }
    });

    // 清除缓存
    await cacheService.clearCommunityCache(communityId);
    await cacheService.clearUserCommunitiesCache(userId);

    return { message: 'Successfully left community' };
  }

  // 获取用户已加入的社群
  async getUserCommunities(userId, options = {}) {
    const { limit = 20, offset = 0 } = options;
    
    // 先从缓存获取
    let communities = await cacheService.getUserCommunities(userId);
    
    if (!communities) {
      const memberships = await CommunityMember.find({
        userId,
        status: 'active'
      })
      .populate('communityId')
      .sort({ joinedAt: -1 })
      .limit(limit)
      .skip(offset);

      communities = memberships.map(membership => ({
        ...membership.communityId.toObject(),
        userRole: membership.role,
        joinedAt: membership.joinedAt
      }));

      // 缓存结果
      await cacheService.setUserCommunities(userId, communities);
    }

    return communities;
  }
}

module.exports = new CommunityService();
```

### 3. 控制器 (Controllers)

#### communityController.js
```javascript
const communityService = require('../services/communityService');
const { validationResult } = require('express-validator');

class CommunityController {
  // 获取附近社群
  async getNearbyCommunities(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid parameters',
            details: errors.array()
          }
        });
      }

      const { latitude, longitude, radius, limit, offset } = req.query;
      
      const communities = await communityService.getNearbyCommunities(
        parseFloat(latitude),
        parseFloat(longitude),
        radius ? parseInt(radius) * 1000 : 10000, // 转换为米
        {
          limit: limit ? parseInt(limit) : 20,
          offset: offset ? parseInt(offset) : 0
        }
      );

      res.json({
        success: true,
        data: {
          communities,
          total: communities.length,
          hasMore: communities.length === (limit ? parseInt(limit) : 20)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 搜索社群
  async searchCommunities(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid parameters',
            details: errors.array()
          }
        });
      }

      const { q, latitude, longitude, limit, offset } = req.query;
      
      const location = latitude && longitude ? {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      } : null;

      const communities = await communityService.searchCommunities(q, location, {
        limit: limit ? parseInt(limit) : 20,
        offset: offset ? parseInt(offset) : 0
      });

      res.json({
        success: true,
        data: {
          communities,
          total: communities.length,
          hasMore: communities.length === (limit ? parseInt(limit) : 20)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取社群详情
  async getCommunityDetails(req, res, next) {
    try {
      const { communityId } = req.params;
      const userId = req.user.id;

      const community = await communityService.getCommunityDetails(communityId, userId);

      res.json({
        success: true,
        data: community
      });
    } catch (error) {
      if (error.message === 'Community not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Community not found'
          }
        });
      }
      next(error);
    }
  }

  // 加入社群
  async joinCommunity(req, res, next) {
    try {
      const { communityId } = req.params;
      const userId = req.user.id;
      const { message } = req.body;

      const result = await communityService.joinCommunity(communityId, userId, message);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error.message === 'Community not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Community not found'
          }
        });
      }
      
      if (error.message === 'Already joined this community') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_JOINED',
            message: 'Already joined this community'
          }
        });
      }

      if (error.message === 'Community is full') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'COMMUNITY_FULL',
            message: 'Community is full'
          }
        });
      }

      next(error);
    }
  }

  // 退出社群
  async leaveCommunity(req, res, next) {
    try {
      const { communityId } = req.params;
      const userId = req.user.id;

      const result = await communityService.leaveCommunity(communityId, userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error.message === 'Not a member of this community') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'NOT_MEMBER',
            message: 'Not a member of this community'
          }
        });
      }
      next(error);
    }
  }

  // 获取用户已加入的社群
  async getUserCommunities(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit, offset } = req.query;

      const communities = await communityService.getUserCommunities(userId, {
        limit: limit ? parseInt(limit) : 20,
        offset: offset ? parseInt(offset) : 0
      });

      res.json({
        success: true,
        data: {
          communities,
          total: communities.length,
          hasMore: communities.length === (limit ? parseInt(limit) : 20)
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommunityController();
```

### 4. 路由定义 (Routes)

#### communities.js
```javascript
const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { authenticateToken, checkCommunityMembership } = require('../middleware/auth');
const { validateNearbyQuery, validateSearchQuery } = require('../validators/communityValidators');
const { apiLimiter } = require('../middleware/rateLimit');

// 应用速率限制
router.use(apiLimiter);

// 获取附近社群 (需要认证)
router.get('/nearby', 
  authenticateToken,
  validateNearbyQuery,
  communityController.getNearbyCommunities
);

// 搜索社群 (需要认证)
router.get('/search',
  authenticateToken,
  validateSearchQuery,
  communityController.searchCommunities
);

// 获取用户已加入的社群
router.get('/joined',
  authenticateToken,
  communityController.getUserCommunities
);

// 获取社群详情
router.get('/:communityId',
  authenticateToken,
  communityController.getCommunityDetails
);

// 加入社群
router.post('/:communityId/join',
  authenticateToken,
  communityController.joinCommunity
);

// 退出社群
router.delete('/:communityId/leave',
  authenticateToken,
  checkCommunityMembership,
  communityController.leaveCommunity
);

module.exports = router;
```

### 5. WebSocket 处理

#### socket/handlers/messageHandler.js
```javascript
const messageService = require('../../services/messageService');
const { authenticateSocket } = require('../middleware/auth');
const { rateLimitSocket } = require('../middleware/rateLimit');

class MessageHandler {
  constructor(io) {
    this.io = io;
    this.setupHandlers();
  }

  setupHandlers() {
    this.io.use(authenticateSocket);
    this.io.use(rateLimitSocket);

    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user.id} connected`);

      // 加入社群房间
      socket.on('join-community', async (data) => {
        try {
          const { communityId } = data;
          
          // 验证用户是否为社群成员
          const isMember = await messageService.checkCommunityMembership(
            communityId, 
            socket.user.id
          );
          
          if (isMember) {
            socket.join(`community:${communityId}`);
            socket.emit('joined-community', { communityId });
            
            // 通知其他成员用户上线
            socket.to(`community:${communityId}`).emit('user-online', {
              userId: socket.user.id,
              username: socket.user.username
            });
          } else {
            socket.emit('error', { message: 'Not a community member' });
          }
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // 离开社群房间
      socket.on('leave-community', (data) => {
        const { communityId } = data;
        socket.leave(`community:${communityId}`);
        
        // 通知其他成员用户离线
        socket.to(`community:${communityId}`).emit('user-offline', {
          userId: socket.user.id,
          username: socket.user.username
        });
      });

      // 发送消息
      socket.on('send-message', async (data) => {
        try {
          const { communityId, content, type = 'text' } = data;
          
          // 创建消息
          const message = await messageService.createMessage({
            communityId,
            userId: socket.user.id,
            content,
            type
          });

          // 广播消息到社群房间
          this.io.to(`community:${communityId}`).emit('new-message', {
            id: message._id,
            communityId: message.communityId,
            user: {
              id: socket.user.id,
              username: socket.user.username,
              avatar: socket.user.profile?.avatar || '👤'
            },
            content: message.content,
            type: message.type,
            createdAt: message.createdAt
          });

          // 确认消息发送成功
          socket.emit('message-sent', { messageId: message._id });
          
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // 发送位置消息
      socket.on('send-location', async (data) => {
        try {
          const { communityId, latitude, longitude, address, description } = data;
          
          const message = await messageService.createLocationMessage({
            communityId,
            userId: socket.user.id,
            location: {
              type: 'Point',
              coordinates: [longitude, latitude],
              address,
              description
            }
          });

          // 广播位置消息
          this.io.to(`community:${communityId}`).emit('new-message', {
            id: message._id,
            communityId: message.communityId,
            user: {
              id: socket.user.id,
              username: socket.user.username,
              avatar: socket.user.profile?.avatar || '👤'
            },
            content: '[位置信息]',
            type: 'location',
            location: {
              latitude,
              longitude,
              address,
              description
            },
            createdAt: message.createdAt
          });

          socket.emit('message-sent', { messageId: message._id });
          
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // 用户断开连接
      socket.on('disconnect', () => {
        console.log(`User ${socket.user.id} disconnected`);
        
        // 通知所有房间用户离线
        socket.rooms.forEach(room => {
          if (room.startsWith('community:')) {
            socket.to(room).emit('user-offline', {
              userId: socket.user.id,
              username: socket.user.username
            });
          }
        });
      });
    });
  }
}

module.exports = MessageHandler;
```

### 6. 中间件

#### middleware/auth.js
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CommunityMember = require('../models/CommunityMember');

// HTTP认证中间件
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access token required'
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token'
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Invalid token'
      }
    });
  }
};

// 社群成员权限检查
const checkCommunityMembership = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    const membership = await CommunityMember.findOne({
      communityId,
      userId,
      status: 'active'
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'NOT_MEMBER',
          message: 'Not a community member'
        }
      });
    }

    req.membership = membership;
    next();
  } catch (error) {
    next(error);
  }
};

// Socket认证中间件
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new Error('Authentication error'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

module.exports = {
  authenticateToken,
  checkCommunityMembership,
  authenticateSocket
};
```

## 开发规范

### 1. 代码风格
- 使用 ESLint + Prettier 进行代码格式化
- 遵循 JavaScript Standard Style
- 使用 async/await 而非 Promise.then()
- 统一的错误处理模式

### 2. 命名规范
- 文件名：小驼峰命名 (camelCase)
- 类名：大驼峰命名 (PascalCase)
- 变量和函数：小驼峰命名 (camelCase)
- 常量：全大写下划线分隔 (UPPER_SNAKE_CASE)

### 3. 注释规范
```javascript
/**
 * 获取附近社群列表
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 * @param {number} radius - 搜索半径(米)
 * @param {Object} options - 查询选项
 * @param {number} options.limit - 返回数量限制
 * @param {number} options.offset - 分页偏移量
 * @returns {Promise<Array>} 社群列表
 */
async getNearbyCommunities(latitude, longitude, radius = 10000, options = {}) {
  // 实现代码...
}
```

### 4. 错误处理
```javascript
// 统一错误响应格式
const sendErrorResponse = (res, statusCode, errorCode, message, details = null) => {
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      details
    },
    timestamp: new Date().toISOString()
  });
};

// 全局错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return sendErrorResponse(res, 400, 'VALIDATION_ERROR', err.message);
  }

  if (err.name === 'CastError') {
    return sendErrorResponse(res, 400, 'INVALID_ID', 'Invalid ID format');
  }

  sendErrorResponse(res, 500, 'INTERNAL_ERROR', 'Internal server error');
};
```

## 测试策略

### 1. 单元测试
```javascript
// tests/unit/services/communityService.test.js
const communityService = require('../../../src/services/communityService');
const Community = require('../../../src/models/Community');

describe('CommunityService', () => {
  describe('getNearbyCommunities', () => {
    it('should return nearby communities within radius', async () => {
      // Mock数据和测试逻辑
    });

    it('should handle invalid coordinates', async () => {
      // 错误处理测试
    });
  });
});
```

### 2. 集成测试
```javascript
// tests/integration/api/communities.test.js
const request = require('supertest');
const app = require('../../../src/app');

describe('Communities API', () => {
  describe('GET /api/communities/nearby', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/communities/nearby?latitude=39.9042&longitude=116.4074');
      
      expect(response.status).toBe(401);
    });
  });
});
```

这个代码结构方案提供了完整的社群功能实现框架，确保代码的模块化、可维护性和可扩展性。