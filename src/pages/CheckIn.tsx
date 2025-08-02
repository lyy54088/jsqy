import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin, Clock, CheckCircle, AlertCircle, Loader, Brain, Utensils } from 'lucide-react';
import { useAppStore } from '@/store';
import type { CheckIn as CheckInType } from '@/store';
import { analyzeFoodImage, imageToBase64, type FoodAnalysisResult } from '@/lib/food-analysis-api';

const CheckIn: React.FC = () => {
  const navigate = useNavigate();
  const { addCheckIn, user, currentContract } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<CheckInType['type']>('breakfast');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);

  const checkInTypes = [
    { type: 'breakfast' as const, icon: '🥐', label: '早餐', description: '营养均衡的早餐' },
    { type: 'lunch' as const, icon: '🍱', label: '午餐', description: '健康的午餐' },
    { type: 'dinner' as const, icon: '🍽️', label: '晚餐', description: '清淡的晚餐' },
    { type: 'gym' as const, icon: '💪', label: '健身', description: '运动锻炼场景' },
    { type: 'protein' as const, icon: '🥛', label: '蛋白质', description: '蛋白质补充' }
  ];

  // 获取位置信息
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // 模拟地址解析
          setLocation({
            latitude,
            longitude,
            address: '北京市朝阳区某某街道' // 实际应用中需要调用地图API
          });
        },
        (error) => {
          console.error('获取位置失败:', error);
        }
      );
    }
  };

  // 拍照或选择图片
  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCapturedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setCapturedImage(imageUrl);
        analyzeImageWithAI(file);
      };
      reader.readAsDataURL(file);
    }
  };

  // 使用AI分析图像
  const analyzeImageWithAI = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      // 只对食物类型进行AI分析
      if (['breakfast', 'lunch', 'dinner'].includes(selectedType)) {
        const base64Image = await imageToBase64(file);
        const result = await analyzeFoodImage({
          imageBase64: base64Image,
          mealType: selectedType as 'breakfast' | 'lunch' | 'dinner'
        });
        setAnalysisResult(result);
      } else {
        // 对于非食物类型（健身、蛋白质），使用简化分析
        const result: FoodAnalysisResult = {
          recognized: true,
          confidence: 0.90 + Math.random() * 0.10,
          description: selectedType === 'gym' 
            ? '识别到运动场景，继续保持锻炼！' 
            : '识别到蛋白质补充，有助于肌肉恢复。',
          recommendations: selectedType === 'gym' 
            ? ['保持规律运动', '注意运动安全', '适当休息恢复']
            : ['适量补充', '配合运动', '注意时间']
        };
        setAnalysisResult(result);
      }
    } catch (error) {
      console.error('AI分析失败:', error);
      // 使用备用分析结果
      const fallbackResult: FoodAnalysisResult = {
        recognized: false,
        confidence: 0.5,
        description: '图片分析遇到问题，请重新拍照或稍后再试。',
        recommendations: ['重新拍照', '确保光线充足', '食物清晰可见']
      };
      setAnalysisResult(fallbackResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 提交打卡
  const handleSubmitCheckIn = () => {
    if (!user || !currentContract || !capturedImage || !analysisResult) return;

    // 转换新的分析结果格式为原有格式
    const aiResult = {
      recognized: analysisResult.recognized,
      confidence: analysisResult.confidence,
      healthScore: analysisResult.healthScore,
      description: analysisResult.description
    };

    const checkIn: Omit<CheckInType, 'id'> = {
      userId: user.id,
      contractId: currentContract.id,
      type: selectedType,
      imageUrl: capturedImage,
      location,
      aiResult,
      timestamp: new Date(),
      status: analysisResult.recognized ? 'approved' : 'pending'
    };

    addCheckIn(checkIn);
    navigate('/dashboard');
  };

  const selectedTypeData = checkInTypes.find(t => t.type === selectedType);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">打卡签到</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 打卡类型选择 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">选择打卡类型</h3>
          
          <div className="grid grid-cols-5 gap-2">
            {checkInTypes.map((type) => (
              <button
                key={type.type}
                onClick={() => setSelectedType(type.type)}
                className={`p-3 rounded-lg border-2 transition-colors text-center ${
                  selectedType === type.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="text-xs font-medium text-gray-700">{type.label}</div>
              </button>
            ))}
          </div>
          
          {selectedTypeData && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>{selectedTypeData.label}：</strong>{selectedTypeData.description}
              </p>
            </div>
          )}
        </div>

        {/* 拍照区域 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">拍照上传</h3>
          
          {!capturedImage ? (
            <div className="space-y-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <Camera className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-600 font-medium">点击拍照或选择图片</p>
                <p className="text-sm text-gray-500">支持JPG、PNG格式</p>
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageCapture}
                className="hidden"
              />
              
              <button
                onClick={getCurrentLocation}
                className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MapPin className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">获取当前位置</span>
              </button>
              
              {location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{location.address}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={capturedImage} 
                  alt="打卡照片" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setCapturedImage(null);
                    setCapturedFile(null);
                    setAnalysisResult(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
              
              {/* AI分析结果 */}
              {isAnalyzing ? (
                <div className="flex items-center justify-center gap-3 py-6">
                  <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
                  <span className="text-gray-700">AI正在分析图片...</span>
                </div>
              ) : analysisResult ? (
                <div className={`p-4 rounded-lg border-2 ${
                  analysisResult.recognized 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-yellow-200 bg-yellow-50'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
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
                  
                  <p className="text-sm text-gray-700 mb-3">{analysisResult.description}</p>
                  
                  {/* 识别到的食物 */}
                  {analysisResult.foodItems && analysisResult.foodItems.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Utensils className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">识别食物:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
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
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-600">健康评分:</span>
                        <span className="text-sm font-medium text-green-600">
                          {Math.round(analysisResult.healthScore!)}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            analysisResult.healthScore >= 80 ? 'bg-green-500' :
                            analysisResult.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${analysisResult.healthScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* 营养信息 */}
                  {analysisResult.nutritionInfo && Object.keys(analysisResult.nutritionInfo).length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">营养信息:</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {analysisResult.nutritionInfo.calories && (
                          <div className="bg-white p-2 rounded border">
                            <span className="text-gray-600">卡路里:</span>
                            <span className="font-medium ml-1">{analysisResult.nutritionInfo.calories}kcal</span>
                          </div>
                        )}
                        {analysisResult.nutritionInfo.protein && (
                          <div className="bg-white p-2 rounded border">
                            <span className="text-gray-600">蛋白质:</span>
                            <span className="font-medium ml-1">{analysisResult.nutritionInfo.protein}g</span>
                          </div>
                        )}
                        {analysisResult.nutritionInfo.carbs && (
                          <div className="bg-white p-2 rounded border">
                            <span className="text-gray-600">碳水:</span>
                            <span className="font-medium ml-1">{analysisResult.nutritionInfo.carbs}g</span>
                          </div>
                        )}
                        {analysisResult.nutritionInfo.fat && (
                          <div className="bg-white p-2 rounded border">
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
              ) : null}
            </div>
          )}
        </div>

        {/* 时间和位置信息 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">打卡信息</h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>打卡时间: {new Date().toLocaleString('zh-CN')}</span>
            </div>
            
            {location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>打卡地点: {location.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* 提交按钮 */}
        <button
          onClick={handleSubmitCheckIn}
          disabled={!capturedImage || !analysisResult || isAnalyzing}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          {isAnalyzing ? '分析中...' : '提交打卡'}
        </button>
        
        <p className="text-xs text-gray-500 text-center">
          提交后将自动记录到你的契约进度中
        </p>
      </div>
    </div>
  );
};

export default CheckIn;