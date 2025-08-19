import React, { useState } from 'react';
import { ArrowLeft, Camera, Upload, Info, Utensils, Loader2, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analyzeImage, AIVisionResult } from '../lib/ai-vision-service';

interface NutritionInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
}

interface FoodAnalysisResult {
  foodName: string;
  nutrition: NutritionInfo;
  healthScore: number;
  healthDescription: string;
  confidence: number;
  aiDescription: string;
}

const FoodAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mealType, setMealType] = useState<string>('breakfast');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mealTypes = [
    { value: 'breakfast' as const, label: '早餐', icon: '🥐' },
    { value: 'lunch' as const, label: '午餐', icon: '🍽️' },
    { value: 'dinner' as const, label: '晚餐', icon: '🍲' },
    { value: 'snack' as const, label: '健身', icon: '💪' },
    { value: 'protein' as const, label: '蛋白质', icon: '🥛' },
  ];

  // 处理图片选择
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      // 清除之前的结果和错误
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleCameraCapture = () => {
    // 触发文件选择
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        setAnalysisResult(null);
        setError(null);
      }
    };
    input.click();
  };

  // AI分析食物功能
  const handleAnalyzeFood = async () => {
    if (!selectedImage) {
      setError('请先选择一张食物图片');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // 使用AI识别服务分析图片
      const aiResult: AIVisionResult = await analyzeImage(selectedImage, mealType as any);
      
      if (aiResult.recognized) {
        // 解析AI结果并提取营养信息
        const analysisResult = parseAIResultForNutrition(aiResult);
        setAnalysisResult(analysisResult);
      } else {
        setError(aiResult.description || 'AI无法识别图片中的食物，请尝试更清晰的图片');
      }
    } catch (error) {
      console.error('食物分析失败:', error);
      setError('分析失败，请检查网络连接后重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 解析AI结果为营养信息
  const parseAIResultForNutrition = (aiResult: AIVisionResult): FoodAnalysisResult => {
    const description = aiResult.description;
    
    // 从AI描述中提取食物名称
    const foodNameMatch = description.match(/(?:识别到|这是|包含)([\u4e00-\u9fa5]+(?:肉|鱼|蛋|奶|豆|菜|果|饭|面|粥|汤|类))/)
      || description.match(/([\u4e00-\u9fa5]{2,8})/);
    const foodName = foodNameMatch ? foodNameMatch[1] : '未知食物';
    
    // 提取卡路里信息
    const calories = aiResult.details?.calories || extractNumberFromText(description, /([0-9]+)\s*(?:卡路里|卡|kcal|大卡)/) || 200;
    
    // 估算营养成分（基于常见食物的营养比例）
    const nutrition: NutritionInfo = {
      calories,
      protein: Math.round(calories * 0.15 / 4), // 蛋白质约占15%热量
      carbs: Math.round(calories * 0.55 / 4),   // 碳水化合物约占55%热量
      fat: Math.round(calories * 0.30 / 9),     // 脂肪约占30%热量
      fiber: Math.round(calories * 0.02),       // 纤维素估算
      sugar: Math.round(calories * 0.10 / 4)    // 糖分估算
    };
    
    // 计算健康评分（基于营养平衡）
    const healthScore = calculateHealthScore(nutrition, description);
    const healthDescription = getHealthDescription(healthScore, description);
    
    return {
      foodName,
      nutrition,
      healthScore,
      healthDescription,
      confidence: aiResult.confidence,
      aiDescription: description
    };
  };

  // 从文本中提取数字
  const extractNumberFromText = (text: string, pattern: RegExp): number | undefined => {
    const match = text.match(pattern);
    return match ? parseInt(match[1]) : undefined;
  };

  // 计算健康评分
  const calculateHealthScore = (nutrition: NutritionInfo, description: string): number => {
    let score = 50; // 基础分数
    
    // 根据营养成分调整分数
    if (nutrition.protein && nutrition.protein > 10) score += 15;
    if (nutrition.fiber && nutrition.fiber > 3) score += 10;
    if (nutrition.sugar && nutrition.sugar < 10) score += 10;
    
    // 根据AI描述中的关键词调整
    const healthyKeywords = ['新鲜', '蔬菜', '水果', '瘦肉', '鱼类', '全谷物', '坚果'];
    const unhealthyKeywords = ['油炸', '高糖', '高盐', '加工', '甜品', '快餐'];
    
    healthyKeywords.forEach(keyword => {
      if (description.includes(keyword)) score += 5;
    });
    
    unhealthyKeywords.forEach(keyword => {
      if (description.includes(keyword)) score -= 10;
    });
    
    return Math.max(0, Math.min(100, score));
  };

  // 获取健康描述
  const getHealthDescription = (score: number, description: string): string => {
    if (score >= 80) return '非常健康的食物选择！富含营养，建议经常食用。';
    if (score >= 60) return '比较健康的食物，营养均衡，适量食用。';
    if (score >= 40) return '一般健康水平，建议搭配其他营养食物。';
    return '建议少量食用，可以选择更健康的替代品。';
  };

  // 重新分析
  const handleReAnalyze = () => {
    setAnalysisResult(null);
    setError(null);
  };

  // 重新选择图片
  const resetSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <Camera className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">食物记录</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 餐食类型选择 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-blue-600" />
            选择打卡类型
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {mealTypes.slice(0, 3).map((type) => (
              <button
                key={type.value}
                onClick={() => setMealType(type.value)}
                className={`p-3 rounded-lg border-2 transition-colors text-center ${
                  mealType === type.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-900 dark:text-gray-100'
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="text-sm font-medium">{type.label}</div>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {mealTypes.slice(3).map((type) => (
              <button
                key={type.value}
                onClick={() => setMealType(type.value)}
                className={`p-3 rounded-lg border-2 transition-colors text-center ${
                  mealType === type.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-900 dark:text-gray-100'
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="text-sm font-medium">{type.label}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-blue-600 mt-2">
            蛋白质: 蛋白质补充
          </p>
        </div>

        {/* 图片上传区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            拍照上传
          </h2>
          
          {!selectedImage ? (
            <div className="space-y-4">
              <div
                onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">点击上传食物图片</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">支持 JPG、PNG 格式</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleCameraCapture}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  拍照
                </button>
                <button
                  onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  相册
                </button>
              </div>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="选择的食物图片" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={resetSelection}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* AI分析按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={handleAnalyzeFood}
                  disabled={isAnalyzing}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      AI分析中...
                    </>
                  ) : (
                    <>
                      <Utensils className="w-5 h-5" />
                      开始AI分析
                    </>
                  )}
                </button>
                
                {analysisResult && (
                  <button
                    onClick={handleReAnalyze}
                    className="bg-gray-600 dark:bg-gray-700 text-white py-3 px-4 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    重新分析
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">分析失败</span>
            </div>
            <p className="text-red-700 dark:text-red-400 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* AI分析结果 */}
        {analysisResult && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">分析结果</h2>
            </div>
            
            {/* 食物名称和健康评分 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{analysisResult.foodName}</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  analysisResult.healthScore >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                  analysisResult.healthScore >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                  'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                }`}>
                  健康评分: {analysisResult.healthScore}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{analysisResult.healthDescription}</p>
            </div>
            
            {/* 营养信息 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analysisResult.nutrition.calories}</div>
                <div className="text-sm text-blue-800 dark:text-blue-300">卡路里</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{analysisResult.nutrition.protein}g</div>
                <div className="text-sm text-green-800 dark:text-green-300">蛋白质</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analysisResult.nutrition.carbs}g</div>
                <div className="text-sm text-orange-800 dark:text-orange-300">碳水化合物</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analysisResult.nutrition.fat}g</div>
                <div className="text-sm text-purple-800 dark:text-purple-300">脂肪</div>
              </div>
            </div>
            
            {/* AI描述 */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">AI分析描述</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{analysisResult.aiDescription}</p>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                识别置信度: {Math.round(analysisResult.confidence * 100)}%
              </div>
            </div>
            
            {/* 保存按钮 */}
            <button
              onClick={() => {
                // 这里可以添加保存到数据库的逻辑
                alert('营养记录已保存！');
              }}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              保存营养记录
            </button>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            使用说明
          </h3>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• 选择对应的打卡类型</li>
            <li>• 拍照或上传清晰的食物图片</li>
            <li>• 点击"开始AI分析"获取营养信息</li>
            <li>• 查看分析结果并保存记录</li>
            <li>• AI会识别食物并估算营养成分</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FoodAnalysis;