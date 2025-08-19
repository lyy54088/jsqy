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
const API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

interface ChatApiResponse {
  output: {
    choices: { message: { content: string } }[];
  };
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * 调用通义千问Plus模型进行文本对话
 * @param messages 对话消息历史
 * @param systemPrompt 系统提示词（可选）
 * @returns 模型的回答
 */
export async function chatWithTongyi(messages: ChatMessage[], systemPrompt?: string): Promise<string> {
  console.log('🔍 API Key check:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'undefined');
  console.log('🔍 API Key length:', API_KEY?.length);
  console.log('💬 Chat messages count:', messages.length);
  
  if (!API_KEY) {
    throw new Error('DASHSCOPE_API_KEY is not set in environment variables.');
  }

  // 构建完整的消息数组
  const fullMessages: ChatMessage[] = [];
  
  // 如果有系统提示词，添加到消息开头
  if (systemPrompt) {
    fullMessages.push({
      role: 'system',
      content: systemPrompt
    });
  }
  
  // 添加用户消息
  fullMessages.push(...messages);

  try {
    const response = await axios.post<ChatApiResponse>(
      API_URL,
      {
        model: 'qwen-plus', // 使用qwen-plus模型进行文本对话
        input: {
          messages: fullMessages,
        },
        parameters: {
          result_format: 'message',
          temperature: 0.7, // 控制回复的创造性
          max_tokens: 1000, // 限制回复长度
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

    if (response.data.output?.choices && response.data.output.choices.length > 0 && response.data.output.choices[0]?.message?.content) {
      return response.data.output.choices[0].message.content;
    } else {
      throw new Error('API response did not contain expected data.');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error calling Tongyi Chat API:', error.response?.data);
      // 提供更详细的错误信息
      if (error.response?.data?.message) {
        throw new Error(`Tongyi API Error: ${error.response.data.message}`);
      }
    } else {
      console.error('Error calling Tongyi Chat API:', error);
    }
    throw new Error('Failed to chat with Tongyi API.');
  }
}

/**
 * 简化的单轮对话接口
 * @param userMessage 用户消息
 * @param systemPrompt 系统提示词（可选）
 * @returns 模型的回答
 */
export async function simpleChatWithTongyi(userMessage: string, systemPrompt?: string): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: userMessage
    }
  ];
  
  return chatWithTongyi(messages, systemPrompt);
}