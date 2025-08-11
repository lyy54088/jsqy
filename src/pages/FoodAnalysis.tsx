import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, Utensils } from 'lucide-react';

const FoodAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | 'protein'>('lunch');

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
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 重新选择图片
  const resetSelection = () => {
    setSelectedImage(null);
    setSelectedFile(null);
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
              <Camera className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">食物记录</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 餐食类型选择 */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
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
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
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
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
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
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            拍照上传
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
                onClick={() => {
                  // 简单的保存功能，暂时只是显示成功消息
                  alert('图片已保存！');
                }}
                className="w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                <Camera className="w-5 h-5" />
                保存记录
              </button>
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">使用说明</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• 选择对应的打卡类型</li>
            <li>• 上传清晰的食物图片</li>
            <li>• 点击保存记录完成打卡</li>
            <li>• 记录将保存到您的健身日志中</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FoodAnalysis;