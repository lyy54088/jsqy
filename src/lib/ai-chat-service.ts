/**
 * AI聊天服务 - 通过后端服务调用通义千问Plus模型
 */

// API配置 - 使用本地后端服务
const API_CONFIG = {
  baseUrl: 'http://localhost:3000/api/chat',
  model: 'qwen-plus'
};

// 聊天回复结果接口
export interface AIChatResult {
  success: boolean;
  reply: string;
  error?: string;
}

// 教练类型定义
export type CoachType = 'loli' | 'queen' | 'mambo' | 'strict' | 'gentle';

// 教练性格配置
export const COACH_PERSONALITIES = {
  loli: {
    name: '萝莉教练',
    avatar: '',
    systemPrompt: `你是一个可爱的萝莉健身教练，说话要用可爱的语气，多用"呢"、"哦"、"嘛"等语气词。你很关心用户的健康，会用温柔可爱的方式鼓励用户坚持锻炼。记住要保持萝莉的可爱特质，但同时要专业地给出健身建议。`
  },
  queen: {
    name: '女王教练',
    avatar: '',
    systemPrompt: `你是一个霸气的女王健身教练，说话要有威严感，会用"给我"、"必须"、"不许"等强势的词汇。你对用户要求严格，不允许偷懒，会用强势但关爱的方式督促用户完成训练。记住要保持女王的霸气特质，同时给出专业的健身指导。`
  },
  mambo: {
    name: '曼波教练',
    avatar: '/mambo-coach-avatar.svg',
    systemPrompt: `你是曼波教练，一个充满活力和热情的健身教练。你说话幽默风趣，喜欢用积极正面的语言鼓励用户。你会用"加油"、"太棒了"、"继续保持"等激励性的词汇，让用户感受到运动的快乐。记住要保持热情活泼的特质，给出实用的健身建议。`
  },
  strict: {
    name: '严格教练',
    avatar: '',
    systemPrompt: `你是一个严格的健身教练，注重纪律和规范。你会用严肃认真的语气，强调训练的重要性和正确性。你不会容忍用户的懈怠，会用严厉但负责任的方式指导用户。记住要保持严格专业的特质，确保用户得到最有效的训练。`
  },
  gentle: {
    name: '温和教练',
    avatar: '',
    systemPrompt: `你是一个温和耐心的健身教练，说话温柔体贴，善于倾听用户的困难和担忧。你会用鼓励和理解的方式帮助用户克服困难，从不批评或指责。记住要保持温和包容的特质，给用户温暖的支持和专业的指导。`
  }
};

/**
 * 调用后端AI聊天API
 */
async function callBackendChatAPI(message: string, coachType: CoachType, customSystemPrompt?: string): Promise<any> {
  const requestBody = {
    message: message,
    coachType: coachType,
    systemPrompt: customSystemPrompt
  };

  console.log('🤖 发送聊天请求:', {
    message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
    coachType,
    hasCustomPrompt: !!customSystemPrompt
  });

  try {
    const response = await fetch(API_CONFIG.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 后端API调用失败:', response.status, response.statusText, errorText);
      throw new Error(`后端API调用失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ 收到AI回复:', result.success ? '成功' : '失败');
    return result;
  } catch (error) {
    console.error('❌ 网络请求失败:', error);
    throw error;
  }
}

/**
 * 与AI教练聊天
 * @param message 用户消息
 * @param coachType 教练类型
 * @param customSystemPrompt 自定义系统提示词（可选）
 * @returns AI回复结果
 */
export async function chatWithAICoach(
  message: string, 
  coachType: CoachType, 
  customSystemPrompt?: string
): Promise<AIChatResult> {
  try {
    // 验证输入参数
    if (!message || message.trim().length === 0) {
      return {
        success: false,
        reply: '',
        error: '消息不能为空'
      };
    }

    if (!coachType || !COACH_PERSONALITIES[coachType]) {
      return {
        success: false,
        reply: '',
        error: '无效的教练类型'
      };
    }

    // 调用后端API
    const apiResponse = await callBackendChatAPI(message, coachType, customSystemPrompt);
    
    // 解析API响应
    if (apiResponse.success && apiResponse.data?.reply) {
      return {
        success: true,
        reply: apiResponse.data.reply
      };
    } else {
      return {
        success: false,
        reply: '',
        error: apiResponse.error || 'AI回复失败'
      };
    }
  } catch (error) {
    console.error('❌ AI聊天服务错误:', error);
    
    let errorMessage = 'AI聊天服务暂时不可用';
    
    if (error instanceof Error) {
      const errorMsg = error.message;
      
      if (errorMsg.includes('网络') || errorMsg.includes('fetch')) {
        errorMessage = '网络连接失败，请检查网络连接';
      } else if (errorMsg.includes('401')) {
        errorMessage = 'API密钥无效，请联系管理员';
      } else if (errorMsg.includes('429')) {
        errorMessage = 'API调用频率过高，请稍后重试';
      } else if (errorMsg.includes('500')) {
        errorMessage = '服务器内部错误，请稍后重试';
      }
    }
    
    return {
      success: false,
      reply: '',
      error: errorMessage
    };
  }
}

/**
 * 获取教练性格信息
 * @param coachType 教练类型
 * @returns 教练性格配置
 */
export function getCoachPersonality(coachType: CoachType) {
  return COACH_PERSONALITIES[coachType] || COACH_PERSONALITIES.loli;
}

/**
 * 获取所有可用的教练类型
 * @returns 教练类型数组
 */
export function getAvailableCoachTypes(): CoachType[] {
  return Object.keys(COACH_PERSONALITIES) as CoachType[];
}

/**
 * 生成欢迎消息（保持与原有逻辑兼容）
 * @param coachType 教练类型
 * @param customIdentity 自定义身份信息
 * @returns 欢迎消息
 */
export function generateWelcomeMessage(coachType: CoachType, customIdentity?: string): string {
  const personality = getCoachPersonality(coachType);
  
  const welcomeMessages = {
    loli: `你好呀！我是你的${customIdentity || '萝莉'}健身教练呢～ 今天想要一起运动吗？我会陪着你一起加油的哦！💪✨`,
    queen: `我是你的${customIdentity || '女王'}健身教练。准备好接受我的指导了吗？我不会允许你偷懒的。`,
    mambo: `曼波曼波，噢吗几礼，曼波。我是你的${customIdentity || '曼波'}健身教练！准备好开始健身了吗？呵呵呵呵，呵呵呵呵【私人笑声】`
  };
  
  return welcomeMessages[coachType] || welcomeMessages.loli;
}