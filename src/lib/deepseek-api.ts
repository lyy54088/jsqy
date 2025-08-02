// DeepSeek API 集成服务
export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class DeepSeekAPI {
  private apiKey: string;
  private baseURL: string = 'https://api.deepseek.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(messages: DeepSeekMessage[], options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
  }): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options?.model || 'deepseek-chat',
          messages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.max_tokens || 1000,
          stream: options?.stream || false,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const data: DeepSeekResponse = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }
      
      throw new Error('No response from DeepSeek API');
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      throw error;
    }
  }

  async streamChat(
    messages: DeepSeekMessage[], 
    onChunk: (chunk: string) => void,
    options?: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
    }
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options?.model || 'deepseek-chat',
          messages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.max_tokens || 1000,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('DeepSeek Stream API Error:', error);
      throw error;
    }
  }
}

// 创建 DeepSeek API 实例
let deepSeekInstance: DeepSeekAPI | null = null;

export const initializeDeepSeek = (apiKey: string) => {
  deepSeekInstance = new DeepSeekAPI(apiKey);
  return deepSeekInstance;
};

export const getDeepSeekInstance = (): DeepSeekAPI | null => {
  return deepSeekInstance;
};

// 健身教练专用的 AI 助手
export class FitnessCoachAI {
  private deepSeek: DeepSeekAPI;
  private coachPersonality: 'strict' | 'gentle' | 'humorous';
  private userContext: {
    name: string;
    goals: string[];
    currentProgress: string;
    todayCheckIns: number;
    totalCheckIns: number;
  };

  constructor(
    deepSeek: DeepSeekAPI, 
    personality: 'strict' | 'gentle' | 'humorous',
    userContext: any
  ) {
    this.deepSeek = deepSeek;
    this.coachPersonality = personality;
    this.userContext = userContext;
  }

  private getSystemPrompt(): string {
    const personalityPrompts = {
      strict: `你是一位严格但专业的健身教练。你的特点是：
- 对用户要求严格，不允许偷懒
- 说话直接，有时会有点严厉
- 非常注重纪律和执行力
- 会督促用户完成目标
- 用词坚定有力，经常使用"必须"、"一定要"等词汇`,
      
      gentle: `你是一位温和耐心的健身教练。你的特点是：
- 语气温和，充满鼓励
- 理解用户的困难，给予支持
- 注重用户的感受和身体状况
- 会给出建设性的建议
- 用词温暖，经常使用"慢慢来"、"没关系"等安慰性词汇`,
      
      humorous: `你是一位幽默风趣的健身教练。你的特点是：
- 喜欢用幽默的方式激励用户
- 会用有趣的比喻和段子
- 让健身变得轻松有趣
- 偶尔开玩笑，但不失专业性
- 用词活泼，经常使用表情符号和网络用语`
    };

    return `${personalityPrompts[this.coachPersonality]}

用户信息：
- 姓名：${this.userContext.name}
- 健身目标：${this.userContext.goals.join('、')}
- 当前进度：${this.userContext.currentProgress}
- 今日打卡：${this.userContext.todayCheckIns}/${this.userContext.totalCheckIns}

请根据你的性格特点和用户的具体情况，给出专业的健身建议和鼓励。回复要简洁明了，一般控制在100字以内。`;
  }

  async getResponse(userMessage: string, conversationHistory: DeepSeekMessage[] = []): Promise<string> {
    const messages: DeepSeekMessage[] = [
      { role: 'system', content: this.getSystemPrompt() },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    try {
      const response = await this.deepSeek.chat(messages, {
        temperature: 0.8,
        max_tokens: 200
      });
      return response;
    } catch (error) {
      console.error('获取AI回复失败:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  async getStreamResponse(
    userMessage: string, 
    onChunk: (chunk: string) => void,
    conversationHistory: DeepSeekMessage[] = []
  ): Promise<void> {
    const messages: DeepSeekMessage[] = [
      { role: 'system', content: this.getSystemPrompt() },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    try {
      await this.deepSeek.streamChat(messages, onChunk, {
        temperature: 0.8,
        max_tokens: 200
      });
    } catch (error) {
      console.error('获取AI流式回复失败:', error);
      onChunk(this.getFallbackResponse(userMessage));
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('累') || lowerMessage.includes('疲劳')) {
      const responses = {
        strict: '累是正常的！但是不能因为累就放弃，休息5分钟后继续！',
        gentle: '感觉累了就适当休息一下吧～身体健康最重要。',
        humorous: '累了？那说明你的肌肉在成长呢！💪'
      };
      return responses[this.coachPersonality];
    }
    
    if (lowerMessage.includes('饮食') || lowerMessage.includes('吃')) {
      const responses = {
        strict: '饮食控制是成功的关键！严格按照计划执行！',
        gentle: '饮食方面要注意营养均衡哦～',
        humorous: '民以食为天！但是我们要做聪明的"吃货"～'
      };
      return responses[this.coachPersonality];
    }
    
    const defaultResponses = {
      strict: '说得对！保持这种积极的态度，严格执行计划！',
      gentle: '嗯嗯，我理解你的想法～有什么具体问题可以详细说说。',
      humorous: '哈哈，有趣！和你聊天让我觉得当教练真是太有意思了！'
    };
    
    return defaultResponses[this.coachPersonality];
  }
}