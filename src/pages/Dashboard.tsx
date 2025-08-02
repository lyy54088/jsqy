import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Camera, MessageCircle, Trophy, Target, Clock, DollarSign } from 'lucide-react';
import { useUser, useCurrentContract, useTodayCheckIns, useAICoach } from '@/store';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useUser();
  const currentContract = useCurrentContract();
  const todayCheckIns = useTodayCheckIns();
  const aiCoach = useAICoach();

  const today = new Date();
  const todayStr = today.toLocaleDateString('zh-CN', { 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });

  // 计算今日完成进度
  const requiredCheckIns = 5; // 早餐、午餐、晚餐、健身、蛋白质
  const completedCheckIns = todayCheckIns.filter(c => c.status === 'approved').length;
  const progressPercentage = (completedCheckIns / requiredCheckIns) * 100;

  // 契约剩余天数
  const contractDaysLeft = currentContract 
    ? Math.ceil((new Date(currentContract.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">健身契约</h1>
              <p className="text-sm text-gray-600">{todayStr}</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/ai-coach')}
                className="p-2 bg-blue-100 rounded-full"
              >
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.nickname?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 契约状态卡片 */}
        {currentContract ? (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">当前契约</h2>
              <Trophy className="w-6 h-6" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-blue-100 text-sm">剩余天数</p>
                <p className="text-2xl font-bold">{contractDaysLeft}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">保证金</p>
                <p className="text-2xl font-bold">¥{currentContract.remainingAmount}</p>
              </div>
            </div>
            
            <div className="bg-white/20 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>完成进度</span>
                <span>{currentContract.completedDays}/{Math.ceil((new Date(currentContract.endDate).getTime() - new Date(currentContract.startDate).getTime()) / (1000 * 60 * 60 * 24))}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentContract.completedDays / Math.ceil((new Date(currentContract.endDate).getTime() - new Date(currentContract.startDate).getTime()) / (1000 * 60 * 60 * 24))) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">开始你的健身契约</h3>
              <p className="text-gray-600 mb-4">用契约的力量，让坚持变得更容易</p>
              <button 
                onClick={() => navigate('/contract/create')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                创建契约
              </button>
            </div>
          </div>
        )}

        {/* 今日打卡进度 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">今日打卡</h3>
            <span className="text-sm text-gray-600">{completedCheckIns}/{requiredCheckIns}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {[
              { type: 'breakfast', icon: '🥐', label: '早餐' },
              { type: 'lunch', icon: '🍱', label: '午餐' },
              { type: 'dinner', icon: '🍽️', label: '晚餐' },
              { type: 'gym', icon: '💪', label: '健身' },
              { type: 'protein', icon: '🥛', label: '蛋白质' }
            ].map((item) => {
              const isCompleted = todayCheckIns.some(c => c.type === item.type && c.status === 'approved');
              return (
                <div key={item.type} className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg mb-1 ${
                    isCompleted ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100 border-2 border-gray-200'
                  }`}>
                    {item.icon}
                  </div>
                  <p className="text-xs text-gray-600">{item.label}</p>
                </div>
              );
            })}
          </div>
          
          <button 
            onClick={() => navigate('/checkin')}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            立即打卡
          </button>
        </div>

        {/* AI教练消息 */}
        {aiCoach && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                AI
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{aiCoach.name}</h4>
                  <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">
                    {aiCoach.personality === 'strict' ? '严格型' : aiCoach.personality === 'gentle' ? '温和型' : '幽默型'}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {progressPercentage === 100 
                    ? "太棒了！今天的打卡任务全部完成，继续保持这个节奏！" 
                    : progressPercentage >= 60 
                    ? "不错的进度！还有几个打卡任务等着你完成。" 
                    : "加油！今天的打卡才刚开始，相信你能做到的！"
                  }
                </p>
                <button 
                  onClick={() => navigate('/ai-coach')}
                  className="mt-2 text-purple-600 text-sm font-medium hover:text-purple-700"
                >与教练对话 →</button>
              </div>
            </div>
          </div>
        )}

        {/* 快捷功能 */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/history')}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <Calendar className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">历史记录</p>
            <p className="text-xs text-gray-600">查看打卡历史</p>
          </button>
          
          <button 
            onClick={() => navigate('/profile')}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <Target className="w-6 h-6 text-green-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">个人中心</p>
            <p className="text-xs text-gray-600">设置与统计</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;