import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store';
import type { CheckIn as CheckInType } from '@/store';
import { getSafeImageUrl } from '@/lib/image-proxy';
import { analyzeImage, type AIVisionResult } from '@/lib/ai-vision-service';
import { defaultWeeklyPlan } from '@/data/workoutPlans';

const CheckIn: React.FC = () => {
  const navigate = useNavigate();
  const { addCheckIn, user, currentContract } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<CheckInType['type']>('gym');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [aiResult, setAiResult] = useState<{ recognized: boolean; confidence: number; description: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 根据训练计划动态确定今日可用的打卡类型
  const getTodayAvailableCheckInTypes = () => {
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = dayNames[today.getDay()];
    const todayWorkout = defaultWeeklyPlan.days.find(day => day.id === todayKey);

    const allTypes = [
      { type: 'gym' as const, icon: '💪', label: '健身', description: '运动锻炼场景' },
      { type: 'protein' as const, icon: '🥛', label: '蛋白质', description: '蛋白质补充' }
    ];

    if (!todayWorkout) {
      // 休息日，不需要打卡
      return [];
    }

    if (todayWorkout.type === 'workout') {
      // 训练日，需要健身和蛋白质打卡
      return allTypes;
    } else if (todayWorkout.type === 'active_recovery') {
      // 主动恢复日，只需要蛋白质打卡
      return allTypes.filter(type => type.type === 'protein');
    } else {
      // 完全休息日，不需要打卡
      return [];
    }
  };

  const checkInTypes = getTodayAvailableCheckInTypes();

  // 组件初始化时清除状态，防止显示历史数据
  useEffect(() => {
    console.log('🔥 CheckIn组件初始化，清除所有状态');
    setCapturedImage(null);
    setCapturedFile(null);
    setAiResult(null);
    setIsAnalyzing(false);
    setLocation(null);
  }, []);

  // 确保selectedType始终是有效的打卡类型
  useEffect(() => {
    if (checkInTypes.length > 0 && !checkInTypes.some(type => type.type === selectedType)) {
      setSelectedType(checkInTypes[0].type);
    }
  }, [checkInTypes, selectedType]);

  // 监听selectedType变化，清除之前的识别结果
  useEffect(() => {
    console.log('🔥 打卡类型变更为:', selectedType, '清除之前的AI识别结果');
    setAiResult(null);
    setIsAnalyzing(false);
  }, [selectedType]);

  // 获取位置信息
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // TODO: 集成真实的地址解析服务（如高德地图、百度地图API）
          setLocation({
            latitude,
            longitude,
            address: '位置获取成功，地址解析服务待集成'
          });
        },
        (error) => {
          console.error('获取位置失败:', error);
          // 如果获取位置失败，提示用户
          setLocation({
            latitude: 0,
            longitude: 0,
            address: '位置获取失败，请检查定位权限'
          });
        }
      );
    } else {
      // 如果浏览器不支持地理定位，提示用户
      setLocation({
        latitude: 0,
        longitude: 0,
        address: '浏览器不支持地理定位功能'
      });
    }
  };

  // 拍照或选择图片
  const handleImageCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('🔥 新图片上传开始:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        timestamp: new Date().toISOString()
      });
      
      // 立即清除所有之前的状态，防止显示历史结果
      setCapturedFile(null);
      setCapturedImage(null);
      setAiResult(null);
      setIsAnalyzing(false);
      
      // 强制等待一个渲染周期，确保状态清除
      await new Promise(resolve => setTimeout(resolve, 10));
      
      setCapturedFile(file);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        console.log('🔥 图片读取完成，Data URL长度:', imageUrl.length);
        
        setCapturedImage(imageUrl);
        
        // 立即进行AI识别
        setIsAnalyzing(true);
        setAiResult(null); // 再次确保清除
        
        try {
          console.log('🔥 开始AI识别，文件信息:', {
            fileName: file.name,
            fileSize: file.size,
            selectedType: selectedType,
            timestamp: new Date().toISOString()
          });
          
          const visionResult: AIVisionResult = await analyzeImage(
            file, 
            selectedType as 'breakfast' | 'lunch' | 'dinner' | 'gym' | 'protein'
          );
          
          console.log('🔥 AI识别完成，结果:', visionResult);
          
          if (visionResult.recognized) {
            let description = `AI识别结果（置信度: ${Math.round(visionResult.confidence * 100)}%）: ${visionResult.description}`;
            
            // 如果有详细信息，添加到结果中
            if (visionResult.details?.foodItems && visionResult.details.foodItems.length > 0) {
              description += `\n识别到的食物: ${visionResult.details.foodItems.join(', ')}`;
            }
            
            if (visionResult.details?.calories) {
              description += `\n估计卡路里: ${visionResult.details.calories} 卡`;
            }
            
            const newAiResult = {
              recognized: true,
              confidence: visionResult.confidence,
              description
            };
            
            console.log('🔥 设置新的AI识别结果:', newAiResult);
            setAiResult(newAiResult);
          } else {
            const newAiResult = {
              recognized: false,
              confidence: 0,
              description: `AI识别失败: ${visionResult.description}`
            };
            
            console.log('🔥 设置AI识别失败结果:', newAiResult);
            setAiResult(newAiResult);
          }
          
        } catch (aiError) {
          console.error('🔥 AI识别过程中出错:', aiError);
          const errorResult = {
            recognized: false,
            confidence: 0,
            description: `AI识别错误: ${aiError instanceof Error ? aiError.message : '未知错误'}`
          };
          
          console.log('🔥 设置AI识别错误结果:', errorResult);
          setAiResult(errorResult);
        } finally {
          setIsAnalyzing(false);
          console.log('🔥 AI识别流程结束');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 提交打卡
  const handleSubmitCheckIn = async () => {
    // 首先检查用户登录状态
    if (!user) {
      alert('用户未登录，请先登录');
      navigate('/auth');
      return;
    }

    if (!currentContract) {
      alert('没有有效的契约，请先创建契约');
      navigate('/contract/create');
      return;
    }

    if (!capturedImage) {
      alert('请先拍照或选择图片');
      return;
    }

    // 严格验证健身房打卡要求
    if (selectedType === 'gym') {
      // 检查是否有位置信息
      if (!location) {
        alert('健身房打卡失败：必须获取位置信息才能完成健身房打卡！请点击"获取当前位置"按钮。');
        return;
      }

      // 检查AI识别结果
      if (!aiResult || !aiResult.recognized) {
        alert('健身房打卡失败：AI必须识别出这是健身房相关的图片才能完成打卡！请确保拍摄的是健身房内的运动器械、运动场景或运动过程。');
        return;
      }

      // 检查AI识别内容是否包含健身房相关关键词
      const gymKeywords = ['健身', '运动', '锻炼', '器械', '训练', '跑步机', '哑铃', '杠铃', '健身房', 'gym', 'fitness', 'workout', 'exercise'];
      const description = aiResult.description.toLowerCase();
      const hasGymKeywords = gymKeywords.some(keyword => description.includes(keyword.toLowerCase()));
      
      if (!hasGymKeywords) {
        alert('健身房打卡失败：AI识别结果显示这不是健身房相关的图片！请拍摄健身房内的运动器械、运动场景或运动过程。');
        return;
      }

      // 检查置信度
      if (aiResult.confidence < 0.3) {
        alert('健身房打卡失败：AI识别置信度过低，无法确认这是健身房相关的图片！请重新拍摄更清晰的健身房场景。');
        return;
      }
    }

    // 严格验证蛋白质打卡要求
    if (selectedType === 'protein') {
      // 检查AI识别结果
      if (!aiResult || !aiResult.recognized) {
        alert('蛋白质打卡失败：AI必须识别出这是蛋白质相关的食物才能完成打卡！请确保拍摄的是蛋白粉、鸡胸肉、牛肉等蛋白质食物。');
        return;
      }

      // 检查AI识别内容是否包含蛋白质相关关键词
      const proteinKeywords = ['蛋白质', '蛋白粉', '鸡胸肉', '牛肉', '鸡肉', '鱼肉', '瘦肉', '肉类', '蛋白', 'protein', '乳清', '酪蛋白', '鸡蛋', '豆腐', '豆类'];
      const description = aiResult.description.toLowerCase();
      const hasProteinKeywords = proteinKeywords.some(keyword => description.includes(keyword.toLowerCase()));
      
      if (!hasProteinKeywords) {
        alert('蛋白质打卡失败：AI识别结果显示这不是蛋白质相关的食物！请拍摄蛋白粉、鸡胸肉、牛肉等富含蛋白质的食物。');
        return;
      }

      // 检查置信度
      if (aiResult.confidence < 0.3) {
        alert('蛋白质打卡失败：AI识别置信度过低，无法确认这是蛋白质食物！请重新拍摄更清晰的蛋白质食物图片。');
        return;
      }
    }

    try {
      console.log('🔥 开始提交打卡...');
      console.log('🔥 用户信息:', user);
      console.log('🔥 契约信息:', currentContract);
      
      // 使用已经获得的AI识别结果，如果没有则使用默认值
      const finalAiResult = aiResult || {
        recognized: false,
        confidence: 0,
        description: '手动打卡记录（AI识别未启用）'
      };

      const checkIn: Omit<CheckInType, 'id'> = {
        userId: user.id,
        contractId: currentContract.id,
        type: selectedType,
        imageUrl: capturedImage,
        location,
        aiResult: finalAiResult,
        timestamp: new Date(),
        status: 'approved' // 直接设置为已审批状态，立即更新进度
      };

      console.log('🔥 添加打卡记录:', checkIn);
      addCheckIn(checkIn);
      
      // 根据打卡类型显示不同的成功消息
      let successMessage = '打卡成功！';
      if (selectedType === 'gym') {
        successMessage = '健身房打卡成功！AI已确认这是健身相关内容，位置信息已记录。';
      } else if (selectedType === 'protein') {
        successMessage = '蛋白质打卡成功！AI已确认这是蛋白质相关食物。';
      }
      
      alert(successMessage);
      console.log('🔥 准备导航到 dashboard...');
      
      // 使用更可靠的导航方式
      try {
        console.log('🔥 尝试使用 navigate...');
        navigate('/dashboard', { replace: true });
        console.log('🔥 navigate 调用成功');
      } catch (navError) {
        console.error('🔥 navigate 失败，使用备用方案:', navError);
        // 备用方案：直接修改 URL
        window.location.replace('/dashboard');
      }
      
    } catch (error) {
      console.error('提交打卡失败:', error);
      alert(`提交失败：${error.message || '未知错误'}，请重试`);
    }
  };

  const selectedTypeData = checkInTypes.find(t => t.type === selectedType);

  // 如果今日是休息日，显示休息日提示
  if (checkInTypes.length === 0) {
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

        <div className="max-w-md mx-auto px-4 py-6">
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
            <div className="text-6xl mb-4">😴</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">今日是休息日</h2>
            <p className="text-gray-600 mb-6">
              根据你的训练计划，今天是完全休息日。<br/>
              好好放松，让身体充分恢复，为明天的训练储备能量！
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/workout-tutorial')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                查看训练教程
              </button>
              <button 
                onClick={() => navigate('/workout-plan')}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                调整训练计划
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          
          <div className="grid grid-cols-2 gap-4">
            {checkInTypes.map((type) => (
              <button
                key={type.type}
                onClick={() => setSelectedType(type.type)}
                className={`p-4 rounded-lg border-2 transition-colors text-center ${
                  selectedType === type.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <div className="text-sm font-medium text-gray-700">{type.label}</div>
              </button>
            ))}
          </div>
          
          {selectedTypeData && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>{selectedTypeData.label}：</strong>{selectedTypeData.description}
              </p>
              
              {/* 健身房打卡特殊要求 */}
              {selectedType === 'gym' && (
                <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                  <p className="text-xs text-orange-700">
                    <strong>⚠️ 健身房打卡严格要求：</strong><br/>
                    1. 必须拍摄健身房内的器械、运动场景或运动过程<br/>
                    2. 必须获取位置信息证明在健身房<br/>
                    3. AI必须识别出这是健身相关内容才能通过
                  </p>
                </div>
              )}
              
              {/* 蛋白质打卡特殊要求 */}
              {selectedType === 'protein' && (
                <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                  <p className="text-xs text-orange-700">
                    <strong>⚠️ 蛋白质打卡严格要求：</strong><br/>
                    1. 必须拍摄蛋白粉、鸡胸肉、牛肉等蛋白质食物<br/>
                    2. AI必须识别出这是蛋白质相关食物才能通过<br/>
                    3. 不接受其他类型的食物或非食物图片
                  </p>
                </div>
              )}
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
              
              {/* 拍照提醒 */}
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <p className="text-sm text-orange-700">
                  <strong>注意：</strong>拍照打卡只可以拍照的形式完成，不可以从相册中选择
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageCapture}
                className="hidden"
              />
              
              {/* 只有健身房打卡才显示获取位置按钮 */}
              {selectedType === 'gym' && (
                <>
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
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={getSafeImageUrl(capturedImage || '', '打卡照片')} 
                  alt="打卡照片" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setCapturedImage(null);
                    setCapturedFile(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>

            </div>
          )}
        </div>

        {/* AI识别结果显示 */}
        {(isAnalyzing || aiResult) && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">AI识别结果</h3>
            
            {isAnalyzing ? (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-700">正在分析图片...</span>
              </div>
            ) : aiResult && (
              <div className={`p-3 rounded-lg ${
                aiResult.recognized 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-orange-50 border border-orange-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {aiResult.recognized ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">AI识别成功</span>
                      {aiResult.confidence > 0 && (
                        <span className="text-sm text-green-600">
                          (置信度: {Math.round(aiResult.confidence * 100)}%)
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-orange-800">手动记录</span>
                    </>
                  )}
                </div>
                <p className={`text-sm whitespace-pre-line ${
                  aiResult.recognized ? 'text-green-700' : 'text-orange-700'
                }`}>
                  {aiResult.description}
                </p>
              </div>
            )}
          </div>
        )}

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
          disabled={!capturedImage || (selectedType === 'gym' && !location)}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          提交打卡
        </button>
        
        {/* 提交按钮状态提示 */}
        {!capturedImage && (
          <p className="text-xs text-gray-500 text-center">
            请先拍照才能提交打卡
          </p>
        )}
        {capturedImage && selectedType === 'gym' && !location && (
          <p className="text-xs text-orange-600 text-center">
            健身房打卡需要获取位置信息才能提交
          </p>
        )}
        
        <p className="text-xs text-gray-500 text-center">
          提交后将自动记录到你的契约进度中
        </p>
      </div>
    </div>
  );
};

export default CheckIn;