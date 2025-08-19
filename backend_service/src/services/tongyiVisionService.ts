import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// 强制重新加载.env文件
dotenv.config({ path: path.join(__dirname, '../../.env') });

// 从环境变量中获取API Key
// 强烈建议将API Key存储在.env文件中，而不是硬编码在代码里
// 强制从 .env 文件读取 API Key，忽略系统环境变量
const envPath = path.join(__dirname, '../../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envMatch = envContent.match(/DASHSCOPE_API_KEY=(.+)/);
const API_KEY = envMatch ? envMatch[1]?.trim() : process.env['DASHSCOPE_API_KEY'];
const API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

interface VisionApiResponse {
  output: {
    choices: { message: { content: string } }[];
  };
}

/**
 * 调用通义千问VL-Plus模型分析图片
 * @param imageUrl 图片的公开URL或Base64编码的数据URI
 * @param prompt 用户的提问
 * @returns 模型的回答
 */
export async function analyzeImageWithTongyi(imageUrl: string, prompt: string): Promise<string> {
  console.log('🔍 API Key check:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'undefined');
  console.log('🔍 API Key length:', API_KEY?.length);
  console.log('🔍 Is test key:', API_KEY === 'sk-349d012baff7437391357dbc66bb35f0');
  console.log('🔍 Image URL format:', imageUrl.substring(0, 50) + '...');
  
  if (!API_KEY) {
    throw new Error('DASHSCOPE_API_KEY is not set in environment variables.');
  }

  // 检查是否为测试Key，如果是则使用模拟模式
  const testKeys = [
    'sk-349d012baff7437391357dbc66bb35f0',  // 原始测试Key
    // 真实API Key已移除，将使用真实的通义千问API
  ];
  
  const isTestKey = testKeys.includes(API_KEY);
  
  if (isTestKey) {
    console.log('🎭 Using mock mode for testing (detected test key)');
    return `这是一张健身相关的图片。我可以看到图片中包含了健身元素。

**分析结果：**
- 图片类型：健身/运动相关
- 建议：这是一个很好的健身示例，建议继续保持规律的运动习惯
- 注意事项：请注意运动安全，适量运动

*注：这是模拟响应，用于测试目的。如果您有真实的阿里云百炼 API Key，请替换 .env 文件中的 DASHSCOPE_API_KEY。*`;
  }

  // 验证图片URL格式
  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error('Invalid image URL provided');
  }

  // 检查是否为base64格式，如果是则验证格式
  if (imageUrl.startsWith('data:image/')) {
    const base64Match = imageUrl.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!base64Match || !base64Match[1] || !base64Match[2]) {
      throw new Error('Invalid base64 image format. Expected format: data:image/{type};base64,{data}');
    }
    
    const imageType = base64Match[1].toLowerCase();
    const base64Data = base64Match[2];
    
    // 增加对 base64Data 的有效性检查
    if (!base64Data) {
      throw new Error('Could not extract base64 data from image URI.');
    }
    
    // 验证支持的图片格式
    const supportedFormats = ['jpeg', 'jpg', 'png', 'webp'];
    if (!supportedFormats.includes(imageType)) {
      throw new Error(`Unsupported image format: ${imageType}. Supported formats: ${supportedFormats.join(', ')}`);
    }
    
    // 验证base64数据的有效性
    try {
      // 检查base64数据长度是否合理
      if (base64Data.length < 100) {
        throw new Error('Base64 data too short, possibly corrupted');
      }
      
      // 尝试解码base64以验证其有效性
      const buffer = Buffer.from(base64Data, 'base64');
      if (buffer.length === 0) {
        throw new Error('Invalid base64 data');
      }
      
      // 检查文件大小（限制为10MB）
      if (buffer.length > 10 * 1024 * 1024) {
        throw new Error('Image file too large (max 10MB)');
      }
      
      console.log('🖼️ Detected base64 image format:', imageType);
      console.log('🖼️ Image size:', buffer.length, 'bytes');
      
    } catch (decodeError: unknown) {
      if (decodeError instanceof Error) {
        throw new Error('Invalid base64 image data: ' + decodeError.message);
      } else if (typeof decodeError === 'string') {
        throw new Error('Invalid base64 image data: ' + decodeError);
      } else {
        throw new Error('An unknown error occurred during base64 decoding.');
      }
    }
    
  } else if (imageUrl.startsWith('http')) {
    console.log('🌐 Detected URL image format');
  } else {
    throw new Error('Image must be either a valid URL or base64 data URI');
  }

  try {
    console.log('🚀 发送请求到通义千问API...');
    const response = await axios.post<VisionApiResponse>(
      API_URL,
      {
        model: 'qwen-vl-plus', // 指定使用qwen-vl-plus模型
        input: {
          messages: [
            {
              role: 'user',
              content: [
                {
                  text: prompt,
                },
                {
                  image: imageUrl,
                },
              ],
            },
          ],
        },
        parameters: {
          result_format: 'message',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'X-DashScope-SSE': 'disable',
        },
      }
    );

    console.log('✅ 通义千问API响应状态:', response.status);
    console.log('📄 API响应数据:', JSON.stringify(response.data, null, 2));

    if (response.data.output?.choices && response.data.output.choices.length > 0 && response.data.output.choices[0]?.message?.content) {
      const content = response.data.output.choices[0].message.content;
      console.log('🎯 提取到的内容:', content);
      return content;
    } else {
      console.error('❌ API响应格式异常:', response.data);
      throw new Error('API response did not contain expected data.');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ 通义千问API调用失败:');
      console.error('状态码:', error.response?.status);
      console.error('响应头:', error.response?.headers);
      console.error('响应数据:', error.response?.data);
      
      // 提供更详细的错误信息
      if (error.response?.data?.message) {
        throw new Error(`Tongyi API Error: ${error.response.data.message}`);
      } else if (error.response?.data?.error) {
        throw new Error(`Tongyi API Error: ${error.response.data.error}`);
      } else {
        throw new Error(`Tongyi API Error: HTTP ${error.response?.status}`);
      }
    } else {
      console.error('❌ 网络或其他错误:', error);
    }
    throw new Error('Failed to analyze image with Tongyi Vision API.');
  }
}