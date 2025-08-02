import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Target, Calendar, Trophy, Settings, LogOut, Edit3, Save, X, Database, Camera, Upload } from 'lucide-react';
import { useAppStore } from '@/store';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, setUser, currentContract, checkInHistory, contractHistory } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: user?.nickname || '',
    age: user?.age?.toString() || '',
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || '',
    fitnessGoal: user?.fitnessGoal || 'lose_weight'
  });
  
  // 头像相关状态
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在跳转到登录页面...</p>
        </div>
      </div>
    );
  }

  // 计算统计数据
  const totalCheckIns = checkInHistory.length;
  const approvedCheckIns = checkInHistory.filter(c => c.status === 'approved').length;
  const completedContracts = contractHistory.filter(c => c.status === 'completed').length;
  const totalContractDays = contractHistory.reduce((sum, contract) => {
    const days = Math.ceil((new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24));
    return sum + contract.completedDays;
  }, 0);

  // 头像处理函数
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
      }
      
      // 检查文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB');
        return;
      }
      
      setIsAvatarUploading(true);
      
      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setIsAvatarUploading(false);
        
        // 直接保存头像到用户信息
        if (user) {
          const updatedUser = {
            ...user,
            avatar: result
          };
          setUser(updatedUser);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      nickname: editForm.nickname,
      age: parseInt(editForm.age),
      height: parseInt(editForm.height),
      weight: parseInt(editForm.weight),
      fitnessGoal: editForm.fitnessGoal as 'lose_weight' | 'gain_muscle'
    };
    
    setUser(updatedUser);
    setIsEditing(false);
    setAvatarPreview(null);
  };

  const handleCancelEdit = () => {
    setEditForm({
      nickname: user.nickname,
      age: user.age.toString(),
      height: user.height.toString(),
      weight: user.weight.toString(),
      fitnessGoal: user.fitnessGoal
    });
    setIsEditing(false);
    setAvatarPreview(null); // 重置头像预览
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
      navigate('/auth');
    }
  };

  const calculateBMI = () => {
    const heightInM = user.height / 100;
    const bmi = user.weight / (heightInM * heightInM);
    return bmi.toFixed(1);
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: '偏瘦', color: 'text-blue-600' };
    if (bmi < 24) return { text: '正常', color: 'text-green-600' };
    if (bmi < 28) return { text: '偏胖', color: 'text-yellow-600' };
    return { text: '肥胖', color: 'text-red-600' };
  };

  const bmi = parseFloat(calculateBMI());
  const bmiStatus = getBMIStatus(bmi);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">个人中心</h1>
            </div>
            
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit3 className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 用户信息卡片 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-4 mb-6">
            {/* 头像区域 */}
            <div className="relative">
              <div 
                className="w-16 h-16 rounded-full overflow-hidden cursor-pointer group relative"
                onClick={handleAvatarClick}
              >
                {avatarPreview || user?.avatar ? (
                  <img 
                    src={avatarPreview || user?.avatar} 
                    alt="头像" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {user.nickname.charAt(0)}
                  </div>
                )}
                
                {/* 悬停遮罩 */}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isAvatarUploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
              
              {/* 编辑按钮 */}
              <button
                onClick={handleAvatarClick}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-colors"
              >
                <Upload className="w-3 h-3" />
              </button>
            </div>
            
            {/* 隐藏的文件输入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.nickname}
                  onChange={(e) => setEditForm(prev => ({ ...prev, nickname: e.target.value }))}
                  className="text-xl font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 w-full"
                  placeholder="昵称"
                />
              ) : (
                <h2 className="text-xl font-bold text-gray-900">{user.nickname}</h2>
              )}
              
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{user.phone}</span>
              </div>
            </div>
          </div>
          
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">年龄</label>
              {isEditing ? (
                <input
                  type="number"
                  value={editForm.age}
                  onChange={(e) => setEditForm(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="16"
                  max="80"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900">{user.age} 岁</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">身高</label>
              {isEditing ? (
                <input
                  type="number"
                  value={editForm.height}
                  onChange={(e) => setEditForm(prev => ({ ...prev, height: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="140"
                  max="220"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900">{user.height} cm</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">体重</label>
              {isEditing ? (
                <input
                  type="number"
                  value={editForm.weight}
                  onChange={(e) => setEditForm(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="30"
                  max="200"
                  step="0.1"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900">{user.weight} kg</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">BMI</label>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-gray-900">{calculateBMI()}</p>
                <span className={`text-sm font-medium ${bmiStatus.color}`}>{bmiStatus.text}</span>
              </div>
            </div>
          </div>
          
          {/* 健身目标 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">健身目标</label>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEditForm(prev => ({ ...prev, fitnessGoal: 'lose_weight' }))}
                  className={`p-3 rounded-lg border-2 transition-colors text-center ${
                    editForm.fitnessGoal === 'lose_weight'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Target className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">减脂塑形</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setEditForm(prev => ({ ...prev, fitnessGoal: 'gain_muscle' }))}
                  className={`p-3 rounded-lg border-2 transition-colors text-center ${
                    editForm.fitnessGoal === 'gain_muscle'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Target className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">增肌强体</div>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">
                  {user.fitnessGoal === 'lose_weight' ? '减脂塑形' : '增肌强体'}
                </span>
              </div>
            )}
          </div>
          
          {/* 编辑按钮 */}
          {isEditing && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                取消
              </button>
              
              <button
                onClick={handleSaveProfile}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          )}
        </div>

        {/* 统计数据 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">我的成就</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{totalCheckIns}</div>
              <div className="text-sm text-gray-600">总打卡次数</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{approvedCheckIns}</div>
              <div className="text-sm text-gray-600">成功打卡</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">{completedContracts}</div>
              <div className="text-sm text-gray-600">完成契约</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="text-2xl font-bold text-yellow-600">{totalContractDays}</div>
              <div className="text-sm text-gray-600">坚持天数</div>
            </div>
          </div>
        </div>

        {/* 当前契约状态 */}
        {currentContract && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">当前契约</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-blue-100 text-sm">类型</p>
                <p className="font-semibold">
                  {currentContract.type === 'normal' ? '普通契约' : 
                   currentContract.type === 'brave' ? '勇者契约' : '自定义契约'}
                </p>
              </div>
              
              <div>
                <p className="text-blue-100 text-sm">保证金</p>
                <p className="font-semibold">¥{currentContract.amount}</p>
              </div>
              
              <div>
                <p className="text-blue-100 text-sm">已完成</p>
                <p className="font-semibold">{currentContract.completedDays} 天</p>
              </div>
              
              <div>
                <p className="text-blue-100 text-sm">剩余金额</p>
                <p className="font-semibold">¥{currentContract.remainingAmount}</p>
              </div>
            </div>
          </div>
        )}

        {/* 功能菜单 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <button 
            onClick={() => navigate('/ai-coach')}
            className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">AI教练设置</p>
              <p className="text-sm text-gray-600">调整教练性格和提醒频率</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/history')}
            className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">历史记录</p>
              <p className="text-sm text-gray-600">查看打卡和契约历史</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/food-analysis')}
            className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">食物分析</p>
              <p className="text-sm text-gray-600">AI智能识别食物营养成分</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/database-test')}
            className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">数据库测试</p>
              <p className="text-sm text-gray-600">测试MongoDB连接状态</p>
            </div>
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-4 hover:bg-red-50 transition-colors text-red-600"
          >
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium">退出登录</p>
              <p className="text-sm text-red-500">退出当前账户</p>
            </div>
          </button>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>注册时间: {new Date(user.createdAt).toLocaleDateString('zh-CN')}</p>
          <p className="mt-1">健身契约 v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;