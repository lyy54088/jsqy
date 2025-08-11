import express, { Request, Response } from 'express';
import { CommunityService } from '../services/communityService';
import { MessageService } from '../services/messageService';

const router = express.Router();
const communityService = new CommunityService();
const messageService = new MessageService();

// 获取附近的社群
router.get('/nearby', async (req: Request, res: Response): Promise<void> => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    
    if (!latitude || !longitude) {
      res.status(400).json({
        success: false,
        message: '缺少位置参数'
      });
      return;
    }

    const communities = await communityService.getNearbyCommunities(
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      parseFloat(radius as string)
    );

    res.json({
      success: true,
      data: communities
    });
  } catch (error) {
    console.error('获取附近社群失败:', error);
    res.status(500).json({
      success: false,
      message: '获取附近社群失败'
    });
  }
});

// 获取推荐社群
router.get('/recommended', async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const communities = await communityService.getRecommendedCommunities(
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: communities
    });
  } catch (error) {
    console.error('获取推荐社群失败:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐社群失败'
    });
  }
});

// 创建社群
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      avatar,
      isPublic = true,
      maxMembers = 100,
      location,
      settings = {}
    } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({
        success: false,
        message: '社群名称不能为空'
      });
      return;
    }

    // TODO: 从认证中间件获取用户ID
    const creatorId = req.body.userId || 'temp_user_' + Date.now();

    const community = await communityService.createCommunity({
      name: name.trim(),
      description: description || '',
      avatar: avatar || '🏃‍♂️',
      creatorId,
      isPublic,
      maxMembers,
      location,
      settings
    });

    res.status(201).json({
      success: true,
      data: community
    });
  } catch (error) {
    console.error('创建社群失败:', error);
    res.status(500).json({
      success: false,
      message: '创建社群失败'
    });
  }
});

// 获取社群详情
router.get('/:communityId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { communityId } = req.params;
    
    if (!communityId) {
      res.status(400).json({
        success: false,
        message: '社群ID不能为空'
      });
      return;
    }
    
    const community = await communityService.getCommunityById(communityId);
    
    if (!community) {
      res.status(404).json({
        success: false,
        message: '社群不存在'
      });
      return;
    }

    res.json({
      success: true,
      data: community
    });
  } catch (error) {
    console.error('获取社群详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取社群详情失败'
    });
  }
});

// 加入社群
router.post('/:communityId/join', async (req: Request, res: Response): Promise<void> => {
  try {
    const { communityId } = req.params;
    // TODO: 从认证中间件获取用户ID
    const userId = req.body.userId || 'temp_user_' + Date.now();

    if (!communityId) {
      res.status(400).json({
        success: false,
        message: '社群ID不能为空'
      });
      return;
    }

    const result = await communityService.joinCommunity(communityId, userId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('加入社群失败:', error);
    res.status(500).json({
      success: false,
      message: (error as Error).message || '加入社群失败'
    });
  }
});

// 离开社群
router.post('/:communityId/leave', async (req: Request, res: Response): Promise<void> => {
  try {
    const { communityId } = req.params;
    // TODO: 从认证中间件获取用户ID
    const userId = req.body.userId || 'temp_user_' + Date.now();

    if (!communityId) {
      res.status(400).json({
        success: false,
        message: '社群ID不能为空'
      });
      return;
    }

    const result = await communityService.leaveCommunity(communityId, userId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('离开社群失败:', error);
    res.status(500).json({
      success: false,
      message: (error as Error).message || '离开社群失败'
    });
  }
});

// 获取社群消息
router.get('/:communityId/messages', async (req: Request, res: Response): Promise<void> => {
  try {
    const { communityId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    if (!communityId) {
      res.status(400).json({
        success: false,
        message: '社群ID不能为空'
      });
      return;
    }

    const messages = await messageService.getCommunityMessages(
      communityId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('获取社群消息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取社群消息失败'
    });
  }
});

// 发送消息
router.post('/:communityId/messages', async (req: Request, res: Response): Promise<void> => {
  try {
    const { communityId } = req.params;
    const { content, type = 'text', image, location } = req.body;
    // TODO: 从认证中间件获取用户ID
    const userId = req.body.userId || 'temp_user_' + Date.now();

    if (!communityId) {
      res.status(400).json({
        success: false,
        message: '社群ID不能为空'
      });
      return;
    }

    if (!content && !image && !location) {
      res.status(400).json({
        success: false,
        message: '消息内容不能为空'
      });
      return;
    }

    const message = await messageService.createMessage({
      communityId: communityId,
      userId: userId,
      content: content || '',
      type,
      image,
      location
    });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({
      success: false,
      message: '发送消息失败'
    });
  }
});

// 删除社群（仅群主可操作）
router.delete('/:communityId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { communityId } = req.params;
    // TODO: 从认证中间件获取用户ID
    const userId = req.body.userId || 'temp_user_' + Date.now();

    if (!communityId) {
      res.status(400).json({
        success: false,
        message: '社群ID不能为空'
      });
      return;
    }

    const result = await communityService.deleteCommunity(communityId, userId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('删除社群失败:', error);
    res.status(500).json({
      success: false,
      message: (error as Error).message || '删除社群失败'
    });
  }
});

export default router;