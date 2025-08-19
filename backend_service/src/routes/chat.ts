import express, { Request, Response } from 'express';
import { simpleChatWithTongyi } from '../services/tongyiChatService';

const router = express.Router();

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: 使用通义千问Plus模型进行文本对话
 *     description: 接收用户消息和可选的系统提示词，返回AI的回复。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: 用户的消息内容
 *                 example: '你好，我想了解一些健身知识'
 *               systemPrompt:
 *                 type: string
 *                 description: 系统提示词，用于设定AI的角色和行为
 *                 example: '你是一个专业的健身教练，性格活泼可爱'
 *               coachType:
 *                 type: string
 *                 description: 教练类型
 *                 example: 'loli'
 *     responses:
 *       200:
 *         description: 成功返回AI的回复
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 请求是否成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     reply:
 *                       type: string
 *                       description: AI的回复内容
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器内部错误或调用API失败
 */
router.post('/', async (req: Request, res: Response) => {
  const { message, systemPrompt, coachType } = req.body;

  if (!message) {
    return res.status(400).json({ 
      success: false,
      error: 'message is required.' 
    });
  }

  try {
    // 根据教练类型构建系统提示词
    let finalSystemPrompt = systemPrompt;
    
    if (coachType && !systemPrompt) {
      const coachPrompts = {
        loli: '你是一个可爱活泼的萝莉健身教练，说话时会使用"呢"、"哦"、"呀"等语气词，性格天真烂漫，但在健身指导方面非常专业。你会用可爱的方式鼓励用户坚持健身，给出专业的建议。',
        queen: '你是一个高冷女王范的健身教练，说话简洁有力，充满自信和权威感。你会用严格但关爱的方式指导用户，不容许懈怠，但内心深处关心用户的健康和进步。',
        mambo: '你是一个健身教练，名叫曼波，你在每次说话的开头都会来一句：曼波曼波，噢吗几礼，曼波。结尾的时候会来一句：呵呵呵呵，呵呵呵呵【私人笑声】'
      };
      
      finalSystemPrompt = coachPrompts[coachType as keyof typeof coachPrompts] || coachPrompts.loli;
    }
    
    if (!finalSystemPrompt) {
      finalSystemPrompt = '你是一个专业的健身教练，会根据用户的问题提供专业、实用的健身建议和指导。';
    }

    const reply = await simpleChatWithTongyi(message, finalSystemPrompt);
    
    return res.json({ 
      success: true,
      data: {
        reply: reply
      }
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    
    let errorMessage = 'Failed to get AI response.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      const errorMsg = error.message;
      
      if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
        errorMessage = 'API密钥无效或已过期';
        statusCode = 401;
      } else if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
        errorMessage = 'API调用频率过高，请稍后重试';
        statusCode = 429;
      } else if (errorMsg.includes('network') || errorMsg.includes('timeout')) {
        errorMessage = '网络连接超时，请检查网络连接';
        statusCode = 503;
      } else if (errorMsg.includes('DASHSCOPE_API_KEY')) {
        errorMessage = 'API密钥未配置';
        statusCode = 500;
      }
    }
    
    return res.status(statusCode).json({ 
      success: false,
      error: errorMessage,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;