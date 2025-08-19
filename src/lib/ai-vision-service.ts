/**
 * AI图片识别服务 - 通过后端服务调用通义千问VL-Plus模型
 */

// API配置 - 使用本地后端服务
const API_CONFIG = {
  baseUrl: 'http://localhost:3000/api/vision/analyze',
  model: 'qwen-vl-plus'
};

// 图片识别结果接口
export interface AIVisionResult {
  recognized: boolean;
  confidence: number;
  description: string;
  details?: {
    foodItems?: string[];
    calories?: number;
    nutrition?: {
      protein?: number;
      carbs?: number;
      fat?: number;
    };
  };
}

// 打卡类型映射
const CHECK_IN_TYPE_PROMPTS = {
  breakfast: '这是一张早餐照片，请识别图片中的食物种类、营养成分和大概的卡路里含量。',
  lunch: '这是一张午餐照片，请识别图片中的食物种类、营养成分和大概的卡路里含量。',
  dinner: '这是一张晚餐照片，请识别图片中的食物种类、营养成分和大概的卡路里含量。',
  gym: '这是一张健身房打卡照片。请仔细识别图片中是否包含以下健身相关内容：1）健身器械（如跑步机、哑铃、杠铃、健身器材等）；2）健身房环境（如健身房内部场景、镜子墙、器械区等）；3）运动过程（如正在锻炼的场景、运动姿势等）。如果图片确实是健身相关内容，请详细描述看到的器械类型、运动类型或健身房环境特征。如果不是健身相关内容，请明确说明这不是健身房相关的图片。',
  protein: '这是一张蛋白质补充打卡照片。请仔细识别图片中是否包含以下蛋白质相关食物：1）蛋白粉产品（如乳清蛋白粉、酪蛋白粉等）；2）高蛋白肉类（如鸡胸肉、牛肉、鱼肉、瘦肉等）；3）其他蛋白质食物（如鸡蛋、豆腐、豆类等）。如果图片确实包含蛋白质食物，请详细描述食物类型和蛋白质含量。如果不是蛋白质相关食物，请明确说明这不是蛋白质食物。'
};

/**
 * 将图片文件转换为base64格式，并进行压缩和格式标准化
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        // 计算压缩后的尺寸，保持宽高比
        const maxSize = 1024; // 最大尺寸限制
        const minSize = 100;  // 最小尺寸限制，确保符合通义千问API要求（至少10像素，建议100像素以上）
        let { width, height } = img;
        
        // 确保原始图片尺寸不为0
        if (width <= 0 || height <= 0) {
          throw new Error('图片尺寸无效');
        }
        
        // 计算缩放比例
        let scale = 1;
        
        // 如果图片太大，需要缩小
        if (width > maxSize || height > maxSize) {
          scale = Math.min(maxSize / width, maxSize / height);
        }
        
        // 如果图片太小，需要放大
        if (width < minSize || height < minSize) {
          scale = Math.max(minSize / width, minSize / height);
        }
        
        // 应用缩放
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        
        // 再次确保尺寸符合要求
        width = Math.max(minSize, Math.min(maxSize, width));
        height = Math.max(minSize, Math.min(maxSize, height));
        
        // 设置canvas尺寸
        canvas.width = width;
        canvas.height = height;
        
        // 绘制图片到canvas
        ctx?.drawImage(img, 0, 0, width, height);
        
        // 转换为JPEG格式的base64，质量设为0.8
        const dataUri = canvas.toDataURL('image/jpeg', 0.8);
        
        console.log(`图片处理完成: 原始尺寸 ${img.width}x${img.height} -> 压缩尺寸 ${width}x${height}`);
        console.log(`缩放比例: ${scale.toFixed(3)}`);
        console.log(`Data URI 长度: ${dataUri.length} 字符`);
        console.log(`Data URI 前缀: ${dataUri.substring(0, 50)}...`);
        
        // 验证生成的图片数据
        if (dataUri.length < 100) {
          throw new Error('生成的图片数据异常短，可能处理失败');
        }
        
        resolve(dataUri);
      } catch (error) {
        console.error('图片处理失败:', error);
        reject(new Error('图片处理失败'));
      }
    };
    
    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };
    
    // 创建图片URL
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * 调用后端API进行图片识别
 */
async function callBackendVisionAPI(imageDataUri: string, prompt: string): Promise<any> {
  const requestBody = {
    imageUrl: imageDataUri,
    prompt: prompt + ' 请用中文回答，并尽量提供详细的营养信息。'
  };

  const response = await fetch(API_CONFIG.baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `后端API调用失败: ${response.status} ${response.statusText}`;
    
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // 如果不是JSON格式，使用原始错误文本
      if (errorText) {
        errorMessage += ` - ${errorText}`;
      }
    }
    
    throw new Error(errorMessage);
  }

  return await response.json();
}

/**
 * 解析AI识别结果
 */
function parseAIResponse(apiResponse: any, checkInType: string): AIVisionResult {
  try {
    // 后端API返回格式: { success: boolean, data: { description: string } }
    if (!apiResponse.success || !apiResponse.data?.description) {
      // 检查是否有错误信息
      const errorMsg = apiResponse.error || apiResponse.message || '无法获取识别结果';
      return {
        recognized: false,
        confidence: 0,
        description: `AI识别失败：${errorMsg}`
      };
    }
    
    const content = apiResponse.data.description;
    const lowerContent = content.toLowerCase();

    // 基于内容长度和关键词判断置信度
    let confidence = 0.5;
    let recognized = true;
    
    // 针对不同打卡类型使用不同的验证逻辑
    if (checkInType === 'gym') {
      // 健身房打卡的严格验证
      const gymKeywords = [
        '健身', '运动', '锻炼', '器械', '训练', '跑步机', '哑铃', '杠铃', '健身房',
        'gym', 'fitness', 'workout', 'exercise', 'treadmill', 'dumbbell', 'barbell',
        '举重', '力量训练', '有氧', '无氧', '肌肉', '体能', '器材', '设备'
      ];
      
      const negativeKeywords = [
        '不是健身', '不是运动', '不是器械', '不是健身房', '非健身', '非运动',
        'not fitness', 'not gym', 'not exercise', 'not workout'
      ];
      
      // 检查是否包含否定关键词
      const hasNegativeKeywords = negativeKeywords.some(keyword => 
        lowerContent.includes(keyword.toLowerCase())
      );
      
      if (hasNegativeKeywords) {
        return {
          recognized: false,
          confidence: 0,
          description: `AI识别结果：${content}\n\n❌ 这不是健身房相关的图片，无法完成健身房打卡。`
        };
      }
      
      // 检查健身房相关关键词
      const gymKeywordCount = gymKeywords.filter(keyword => 
        lowerContent.includes(keyword.toLowerCase())
      ).length;
      
      if (gymKeywordCount === 0) {
        return {
          recognized: false,
          confidence: 0,
          description: `AI识别结果：${content}\n\n❌ 未识别到健身房相关内容，无法完成健身房打卡。请拍摄健身器械、健身房环境或运动过程。`
        };
      }
      
      confidence = Math.min(0.95, 0.4 + (gymKeywordCount * 0.15) + (content.length > 100 ? 0.2 : 0));
      
    } else if (checkInType === 'protein') {
      // 蛋白质打卡的严格验证
      const proteinKeywords = [
        '蛋白质', '蛋白粉', '鸡胸肉', '牛肉', '鸡肉', '鱼肉', '瘦肉', '肉类', '蛋白',
        'protein', '乳清', '酪蛋白', '鸡蛋', '豆腐', '豆类', '大豆', '牛奶', '奶制品',
        '三文鱼', '金枪鱼', '虾', '蟹', '贝类', '坚果', '杏仁', '核桃'
      ];
      
      const negativeKeywords = [
        '不是蛋白质', '不是肉类', '不含蛋白质', '非蛋白质', '非肉类',
        'not protein', 'no protein', '碳水化合物', '脂肪', '糖类', '甜品'
      ];
      
      // 检查是否包含否定关键词
      const hasNegativeKeywords = negativeKeywords.some(keyword => 
        lowerContent.includes(keyword.toLowerCase())
      );
      
      if (hasNegativeKeywords) {
        return {
          recognized: false,
          confidence: 0,
          description: `AI识别结果：${content}\n\n❌ 这不是蛋白质相关的食物，无法完成蛋白质打卡。`
        };
      }
      
      // 检查蛋白质相关关键词
      const proteinKeywordCount = proteinKeywords.filter(keyword => 
        lowerContent.includes(keyword.toLowerCase())
      ).length;
      
      if (proteinKeywordCount === 0) {
        return {
          recognized: false,
          confidence: 0,
          description: `AI识别结果：${content}\n\n❌ 未识别到蛋白质相关食物，无法完成蛋白质打卡。请拍摄蛋白粉、肉类或其他高蛋白食物。`
        };
      }
      
      confidence = Math.min(0.95, 0.4 + (proteinKeywordCount * 0.15) + (content.length > 100 ? 0.2 : 0));
      
    } else {
      // 其他类型（早餐、午餐、晚餐）的常规验证
      const foodKeywords = ['食物', '营养', '卡路里', '蛋白质', '碳水', '脂肪', 'food', 'nutrition', 'calorie', 'protein'];
      const keywordCount = foodKeywords.filter(keyword => 
        lowerContent.includes(keyword.toLowerCase())
      ).length;
      
      if (keywordCount === 0) {
        const expectedType = '食物';
        return {
          recognized: true,
          confidence: 0.2,
          description: `AI识别成功，但图片内容可能不是${expectedType}相关：\n\n${content}`,
          details: {
            foodItems: extractFoodItems(content),
            calories: extractCalories(content)
          }
        };
      }
      
      confidence = Math.min(0.9, 0.3 + (keywordCount * 0.1) + (content.length > 50 ? 0.2 : 0));
    }

    return {
      recognized,
      confidence,
      description: content,
      details: {
        foodItems: extractFoodItems(content),
        calories: extractCalories(content)
      }
    };
  } catch (error) {
    console.error('解析AI响应失败:', error);
    return {
      recognized: false,
      confidence: 0,
      description: 'AI识别失败：响应解析错误'
    };
  }
}

/**
 * 从文本中提取食物项目
 */
function extractFoodItems(text: string): string[] {
  const foodItems: string[] = [];
  
  // 简单的食物识别正则表达式
  const foodPatterns = [
    /([\u4e00-\u9fa5]+(?:肉|鱼|蛋|奶|豆|菜|果|饭|面|粥|汤))/g,
    /([\u4e00-\u9fa5]{2,4}(?:类|品))/g
  ];
  
  foodPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      foodItems.push(...matches);
    }
  });
  
  return [...new Set(foodItems)].slice(0, 5); // 去重并限制数量
}

/**
 * 从文本中提取卡路里信息
 */
function extractCalories(text: string): number | undefined {
  const caloriePattern = /(\d+)\s*(?:卡路里|卡|kcal|大卡)/i;
  const match = text.match(caloriePattern);
  return match ? parseInt(match[1]) : undefined;
}

/**
 * 主要的图片识别函数
 */
export async function analyzeImage(
  imageFile: File, 
  checkInType: 'breakfast' | 'lunch' | 'dinner' | 'gym' | 'protein'
): Promise<AIVisionResult> {
  try {
    // 验证文件类型
    if (!imageFile.type.startsWith('image/')) {
      return {
        recognized: false,
        confidence: 0,
        description: '错误：请上传有效的图片文件'
      };
    }

    // 验证文件大小（限制为5MB）
    if (imageFile.size > 5 * 1024 * 1024) {
      return {
        recognized: false,
        confidence: 0,
        description: '错误：图片文件过大，请选择小于5MB的图片'
      };
    }

    console.log(`开始AI识别 - 类型: ${checkInType}, 文件大小: ${imageFile.size} bytes`);

    // 转换图片为data URI格式
    const imageDataUri = await fileToBase64(imageFile);
    
    // 获取对应的提示词
    const prompt = CHECK_IN_TYPE_PROMPTS[checkInType];
    
    // 调用后端API
    const apiResponse = await callBackendVisionAPI(imageDataUri, prompt);
    
    // 解析结果
    const result = parseAIResponse(apiResponse, checkInType);
    
    console.log('AI识别完成:', result);
    
    return result;
    
  } catch (error) {
    console.error('AI图片识别失败:', error);
    
    // 根据错误类型返回不同的错误信息
    let errorMessage = 'AI识别服务暂时不可用';
    
    if (error instanceof Error) {
      if (error.message.includes('网络')) {
        errorMessage = '网络连接失败，请检查网络设置';
      } else if (error.message.includes('API')) {
        errorMessage = 'AI服务调用失败，请稍后重试';
      } else if (error.message.includes('401')) {
        errorMessage = 'API密钥无效，请联系管理员';
      } else if (error.message.includes('429')) {
        errorMessage = 'API调用频率过高，请稍后重试';
      }
    }
    
    return {
      recognized: false,
      confidence: 0,
      description: `AI识别失败：${errorMessage}`
    };
  }
}

/**
 * 测试AI识别服务是否可用
 */
export async function testAIVisionService(): Promise<boolean> {
  try {
    // 测试后端健康检查接口
    const response = await fetch('http://localhost:3000/health', {
      method: 'GET'
    });
    
    return response.ok;
  } catch (error) {
    console.error('AI服务测试失败:', error);
    return false;
  }
}