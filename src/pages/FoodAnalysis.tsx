import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, Brain, Utensils, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { analyzeFoodImage, imageToBase64, type FoodAnalysisResult } from '@/lib/food-analysis-api';

const FoodAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);

  const mealTypes = [
    { value: 'breakfast' as const, label: '早餐', icon: '🥐', description: '营养均衡的早餐' },
    { value: 'lunch' as const, label: '午餐', icon: '🍽️', description: '丰富的午餐' },
    { value: 'dinner' as const, label: '晚餐', icon: '🍲', description: '清淡的晚餐' },
  ];

  // 处理图片选择
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setAnalysisResult(null); // 清除之前的分析结果
      };
      reader.readAsDataURL(file);
    }
  };

  // 分析图片
  const analyzeImage = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const base64Image = await imageToBase64(selectedFile);
      const result = await analyzeFoodImage({
        imageBase64: base64Image,
        mealType: mealType
      });
      setAnalysisResult(result);
    } catch (error) {
      console.error('分析失败:', error);
      // 显示错误信息
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 重新选择图片
  const resetSelection = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">AI食物分析</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 餐食类型选择 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-blue-600" />
            选择餐食类型
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {mealTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setMealType(type.value)}
                className={`p-3 rounded-lg border-2 transition-colors text-center ${
                  mealType === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="text-sm font-medium">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 图片上传区域 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            上传食物图片
          </h2>
          
          {!selectedImage ? (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">点击上传食物图片</p>
                <p className="text-sm text-gray-500">支持 JPG、PNG 格式</p>
              </div>
              
              <input
                ref={fileInputRef}
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
                  src={selectedImage} 
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
              
              <button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    AI分析中...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    开始AI分析
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* 分析结果 */}
        {analysisResult && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              AI分析结果
            </h2>
            
            <div className="space-y-4">
              {/* 识别状态 */}
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                {analysisResult.recognized ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
                <span className={`font-semibold ${
                  analysisResult.recognized ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {analysisResult.recognized ? 'AI识别成功' : '需要人工审核'}
                </span>
                <span className="text-sm text-gray-600">
                  置信度: {Math.round(analysisResult.confidence * 100)}%
                </span>
              </div>
              
              <p className="text-sm text-gray-700">{analysisResult.description}</p>
              
              {/* 识别到的食物 */}
              {analysisResult.foodItems && analysisResult.foodItems.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">识别到的食物:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.foodItems.map((food, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                      >
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 健康评分 */}
              {analysisResult.healthScore && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-600">健康评分:</span>
                    <span className="text-sm font-medium text-green-600">
                      {Math.round(analysisResult.healthScore!)}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${analysisResult.healthScore}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* 营养信息 */}
              {analysisResult.nutritionInfo && Object.keys(analysisResult.nutritionInfo).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">营养信息:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {analysisResult.nutritionInfo.calories && (
                      <div className="bg-gray-50 p-2 rounded border">
                        <span className="text-gray-600">卡路里:</span>
                        <span className="font-medium ml-1">{analysisResult.nutritionInfo.calories}kcal</span>
                      </div>
                    )}
                    {analysisResult.nutritionInfo.protein && (
                      <div className="bg-gray-50 p-2 rounded border">
                        <span className="text-gray-600">蛋白质:</span>
                        <span className="font-medium ml-1">{analysisResult.nutritionInfo.protein}g</span>
                      </div>
                    )}
                    {analysisResult.nutritionInfo.carbs && (
                      <div className="bg-gray-50 p-2 rounded border">
                        <span className="text-gray-600">碳水:</span>
                        <span className="font-medium ml-1">{analysisResult.nutritionInfo.carbs}g</span>
                      </div>
                    )}
                    {analysisResult.nutritionInfo.fat && (
                      <div className="bg-gray-50 p-2 rounded border">
                        <span className="text-gray-600">脂肪:</span>
                        <span className="font-medium ml-1">{analysisResult.nutritionInfo.fat}g</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* 健康建议 */}
              {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">健康建议:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {analysisResult.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">使用说明</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• 选择对应的餐食类型以获得更准确的分析</li>
            <li>• 确保图片清晰，食物占据画面主要部分</li>
            <li>• AI会识别食物种类并提供营养分析和健康建议</li>
            <li>• 分析结果仅供参考，具体营养需求请咨询专业营养师</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FoodAnalysis;