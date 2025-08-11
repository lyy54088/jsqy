import express, { Request, Response } from 'express';
import { analyzeImageWithTongyi } from '../services/tongyiVisionService';

const router = express.Router();

/**
 * @swagger
 * /api/vision/analyze:
 *   post:
 *     summary: 使用通义千问VL-Plus模型分析图片
 *     description: 接收一个图片URL和一段文字提示，返回模型的分析结果。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: 要分析的图片的公开URL。
 *                 example: 'https://img.alicdn.com/tfs/TB1_uT8a5ERMeJjSspiXXbZLFXa-143-59.png'
 *               prompt:
 *                 type: string
 *                 description: 希望模型对图片做什么，例如描述图片、回答关于图片的问题等。
 *                 example: '这张图片里有什么？'
 *     responses:
 *       200:
 *         description: 成功返回模型的分析结果。
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analysis:
 *                   type: string
 *                   description: 模型的文本回答。
 *       400:
 *         description: 请求参数错误。
 *       500:
 *         description: 服务器内部错误或调用API失败。
 */
router.post('/analyze', async (req: Request, res: Response) => {
  const { imageUrl, prompt } = req.body;

  if (!imageUrl || !prompt) {
    return res.status(400).json({ error: 'imageUrl and prompt are required.' });
  }

  try {
    const analysis: any = await analyzeImageWithTongyi(imageUrl, prompt);
    
    // 处理通义千问API返回的数据格式
    let description = '';
    if (typeof analysis === 'string') {
      description = analysis;
    } else if (Array.isArray(analysis) && analysis.length > 0) {
      // 如果是数组，取第一个元素的text字段或直接转换为字符串
      const firstItem = analysis[0];
      if (typeof firstItem === 'object' && firstItem !== null && firstItem.text) {
        description = firstItem.text;
      } else {
        description = String(firstItem);
      }
    } else if (typeof analysis === 'object' && analysis !== null) {
      // 如果是对象，尝试提取text字段
      description = analysis.text || JSON.stringify(analysis);
    } else {
      description = String(analysis);
    }
    
    return res.json({ 
      success: true,
      data: {
        description: description
      }
    });
  } catch (error) {
    console.error('Error in vision analysis endpoint:', error);
    
    let errorMessage = 'Failed to analyze image.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      const errorMsg = error.message;
      
      // 检查是否是图片尺寸问题
      if (errorMsg.includes('image length and width') || errorMsg.includes('must be larger than 10')) {
        errorMessage = '图片尺寸不符合要求，请确保图片的宽度和高度都大于10像素';
        statusCode = 400;
      } else if (errorMsg.includes('InvalidParameter')) {
        errorMessage = '图片参数无效，请检查图片格式和尺寸';
        statusCode = 400;
      } else if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
        errorMessage = 'API密钥无效或已过期';
        statusCode = 401;
      } else if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
        errorMessage = 'API调用频率过高，请稍后重试';
        statusCode = 429;
      } else if (errorMsg.includes('network') || errorMsg.includes('timeout')) {
        errorMessage = '网络连接超时，请检查网络连接';
        statusCode = 503;
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