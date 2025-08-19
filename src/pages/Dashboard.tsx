import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Trophy, Target, AlertCircle, CreditCard, Camera, Calendar, Users, Settings, Dumbbell, Download, Moon, Sun } from 'lucide-react';
import UIverseButton from '../components/UIverseButton';
import { useUser, useCurrentContract, useTodayCheckIns, useAppStore, useAICoach } from '@/store';
import { DataCleaner } from '@/utils/data-cleaner';
import { DevTools } from '@/utils/dev-tools';
import { defaultWeeklyPlan } from '../data/workoutPlans';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useUser();
  const currentContract = useCurrentContract();
  const todayCheckIns = useTodayCheckIns();
  const aiCoach = useAICoach();
  const { resetAllData } = useAppStore();
  const [coachName, setCoachName] = useState('小美教练');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 检查是否有无效的契约数据（没有用户但有契约）
  useEffect(() => {
    if (!user && currentContract) {
      console.warn('检测到无效状态：没有用户但存在契约数据，正在清理...');
      resetAllData();
    }
  }, [user, currentContract, resetAllData]);

  // 加载保存的教练名字
  useEffect(() => {
    const savedCoachName = localStorage.getItem('coachName');
    if (savedCoachName) {
      setCoachName(savedCoachName);
    }
  }, []);

  const today = new Date();
  const todayStr = today.toLocaleDateString('zh-CN', { 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });

  // 获取今日是星期几
  const todayDayOfWeek = today.getDay(); // 0=周日, 1=周一, ..., 6=周六
  const dayMapping = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayDayId = dayMapping[todayDayOfWeek];

  // 检查今日是否需要训练
  const workoutPlan = currentContract?.workoutPlan;
  const selectedDays = workoutPlan?.selectedDays || ['monday', 'tuesday', 'thursday', 'friday']; // 默认训练日
  const isTodayWorkoutDay = selectedDays.includes(todayDayId);

  // 获取今日训练内容
  const todayWorkout = defaultWeeklyPlan.days.find(day => day.id === todayDayId);

  // 调试信息
  console.log('🔍 Dashboard 调试信息:');
  console.log('📅 今日:', todayDayId, '(', todayDayOfWeek, ')');
  console.log('👤 用户:', user ? '已登录' : '未登录');
  console.log('📋 当前契约:', currentContract ? '存在' : '不存在');
  console.log('🏋️ 训练计划:', workoutPlan);
  console.log('📆 选择的训练日:', selectedDays);
  console.log('✅ 今日是否为训练日:', isTodayWorkoutDay);
  console.log('💪 今日训练内容:', todayWorkout);
  
  // 计算今日完成进度
  let requiredCheckIns = 0;
  if (isTodayWorkoutDay) {
    // 只有在用户选择的训练日才需要打卡
    if (todayWorkout?.type === 'workout') {
      requiredCheckIns = 2; // 健身、蛋白质
    } else if (todayWorkout?.type === 'active_recovery') {
      requiredCheckIns = 1; // 只需要蛋白质
    } else {
      // 如果用户选择了这一天但训练计划是休息日，默认需要蛋白质打卡
      requiredCheckIns = 1;
    }
  }
  // 如果不是用户选择的训练日，requiredCheckIns = 0，即完全休息日
  
  const completedCheckIns = todayCheckIns.filter(c => c.status === 'approved').length;
  const progressPercentage = requiredCheckIns > 0 ? (completedCheckIns / requiredCheckIns) * 100 : 100;

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
                onClick={() => window.open('/install.html', '_blank')}
                className="p-2 bg-green-100 rounded-full hover:bg-green-200 transition-colors"
                title="安装应用到手机"
              >
                <Download className="w-5 h-5 text-green-600" />
              </button>
              <button 
                onClick={() => {
                  setIsDarkMode(!isDarkMode);
                  document.documentElement.classList.toggle('dark', !isDarkMode);
                }}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode 
                    ? 'bg-yellow-100 hover:bg-yellow-200' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                title={isDarkMode ? '切换到浅色模式' : '切换到深色模式'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-600" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button 
                onClick={() => navigate('/ai-coach')}
                className="p-2 bg-blue-100 rounded-full"
              >
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </button>
              <div 
                className="w-8 h-8 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
                onClick={() => navigate('/profile')}
              >
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="头像" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                    {user?.nickname?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 契约状态卡片 */}
        {currentContract && currentContract.paymentStatus === 'paid' ? (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">当前契约</h2>
              <Trophy 
                className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform" 
                onClick={() => {
                  console.log('🏆 Trophy图标被点击');
                  console.log('🔥 用户状态:', user);
                  if (!user) {
                    console.error('❌ 用户未登录');
                    alert('请先登录');
                    return;
                  }
                  console.log('🚀 导航到 /history');
                  navigate('/history');
                }}
              />
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
        ) : currentContract && currentContract.paymentStatus === 'pending' ? (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">待支付契约</h2>
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-orange-100 text-sm">契约类型</p>
                <p className="text-xl font-bold">{currentContract.type === 'normal' ? '普通契约' : currentContract.type === 'brave' ? '勇者契约' : '自定义契约'}</p>
              </div>
              <div>
                <p className="text-orange-100 text-sm">保证金</p>
                <p className="text-2xl font-bold">¥{currentContract.amount}</p>
              </div>
            </div>
            
            <div className="bg-white/20 rounded-lg p-3 mb-4">
              <p className="text-sm">
                ⚠️ 您的契约已创建，但保证金尚未支付。请尽快完成支付以激活契约。
              </p>
            </div>
            
            <button 
              onClick={() => navigate('/payment', {
                state: {
                  contractData: currentContract,
                  amount: currentContract.amount,
                  contractType: currentContract.type === 'normal' ? '普通契约' : currentContract.type === 'brave' ? '勇者契约' : '自定义契约',
                  duration: Math.ceil((new Date(currentContract.endDate).getTime() - new Date(currentContract.startDate).getTime()) / (1000 * 60 * 60 * 24)).toString()
                }
              })}
              className="w-full bg-white text-orange-600 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              立即支付保证金
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="text-center">
              <div 
                className="relative flex items-center justify-center mx-auto mb-4"
                style={{
                  width: '180px',
                  height: '180px',
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '1.2em',
                  fontWeight: 300,
                  color: 'white',
                  borderRadius: '50%',
                  backgroundColor: 'transparent',
                  userSelect: 'none'
                }}
              >
                <div 
                  className="absolute top-0 left-0 w-full h-full rounded-full loader-rotate"
                  style={{
                    backgroundColor: 'transparent',
                    zIndex: 0
                  }}
                />
                <Target 
                  className="w-12 h-12 text-white relative z-10" 
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))'
                  }}
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">开始你的健身契约</h3>
              <p className="text-gray-600 mb-4">用契约的力量，让坚持变得更容易</p>
              <UIverseButton 
                variant="primary"
                onClick={(e) => {
                  console.log('🔥 创建契约按钮被点击');
                  console.log('🔥 事件对象:', e);
                  console.log('🔥 用户状态:', user);
                  console.log('🔥 当前路径:', window.location.pathname);
                  
                  // 检查用户登录状态
                  if (!user) {
                    console.error('❌ 用户未登录，无法创建契约');
                    alert('请先登录后再创建契约');
                    return;
                  }
                  
                  try {
                    console.log('🚀 准备调用navigate("/contract/create")');
                    navigate('/contract/create');
                    console.log('✅ navigate函数调用成功');
                    
                    // 延迟检查路径是否改变
                    setTimeout(() => {
                      console.log('🔍 检查路径变化:', window.location.pathname);
                      if (window.location.pathname !== '/contract/create') {
                        console.warn('⚠️ 路径没有改变，可能被路由保护拦截');
                      }
                    }, 100);
                  } catch (error) {
                    console.error('❌ navigate函数调用失败:', error);
                    alert(`导航失败: ${error.message}`);
                  }
                }}
              >
                创建契约
              </UIverseButton>
            </div>
          </div>
        )}

        {/* 今日训练计划 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">今日训练</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/workout-plan')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Settings className="w-4 h-4 text-gray-500" />
              </button>
              <span className="text-sm text-gray-600">{completedCheckIns}/{requiredCheckIns}</span>
            </div>
          </div>



          {/* 今日训练状态 */}
          {todayWorkout ? (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {todayWorkout.type === 'workout' ? '💪' : 
                   todayWorkout.type === 'active_recovery' ? '🧘' : '😴'}
                </span>
                <h4 className="font-medium text-gray-800">{todayWorkout.name}</h4>
              </div>
              
              {todayWorkout.type === 'workout' && (
                <div className="text-sm text-gray-600 mb-3">
                  <div>目标肌群：{todayWorkout.targetMuscles.join('、')}</div>
                  <div>预计时长：{todayWorkout.estimatedDuration}分钟</div>
                </div>
              )}
              
              {todayWorkout.type === 'active_recovery' && (
                <div className="text-sm text-gray-600 mb-3">
                  今日是主动恢复日，进行轻松的有氧活动促进恢复
                </div>
              )}
              
              {todayWorkout.type === 'rest' && (
                <div className="text-sm text-gray-600 mb-3">
                  今日是完全休息日，让身体充分恢复
                </div>
              )}
            </div>
          ) : (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700 text-center">
                请先设置你的训练计划
              </p>
            </div>
          )}

          {/* 保证金扣除提醒 - 只在需要打卡的日子显示 */}
          {requiredCheckIns > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 text-center">
                ⚠️ 如果今天没有完成打卡就扣保证金的1/3
              </p>
            </div>
          )}
          
          {/* 进度条 */}
          {requiredCheckIns > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
          
          {/* 打卡项目 */}
          {requiredCheckIns > 0 ? (
            <div className="grid grid-cols-2 gap-6 mb-4">
              {/* 健身打卡 - 只在训练日显示 */}
              {todayWorkout?.type === 'workout' && (
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    todayCheckIns.some(c => c.type === 'gym' && c.status === 'approved') 
                      ? 'bg-green-100 border-2 border-green-500' 
                      : 'bg-gray-100 border-2 border-gray-200'
                  }`}>
                    <span className="text-lg">💪</span>
                  </div>
                  <p className="text-xs text-gray-600 text-center">健身</p>
                </div>
              )}
              
              {/* 蛋白质打卡 - 训练日和恢复日都显示 */}
              {(todayWorkout?.type === 'workout' || todayWorkout?.type === 'active_recovery') && (
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    todayCheckIns.some(c => c.type === 'protein' && c.status === 'approved') 
                      ? 'bg-green-100 border-2 border-green-500' 
                      : 'bg-gray-100 border-2 border-gray-200'
                  }`}>
                    <span className="text-lg">🥛</span>
                  </div>
                  <p className="text-xs text-gray-600 text-center">蛋白质</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <span className="text-4xl mb-2 block">😴</span>
              <p className="text-gray-600">今日是休息日，好好放松吧！</p>
            </div>
          )}
          
          {/* 操作按钮 */}
          <div className="space-y-2">
            {requiredCheckIns > 0 && (
              <div className="w-full flex justify-center">
                <UIverseButton 
                  variant="primary"
                  onClick={() => {
                    console.log('🔥 立即打卡按钮被点击');
                    console.log('🔥 用户状态:', user);
                    
                    if (!user) {
                      console.error('❌ 用户未登录，无法打卡');
                      alert('请先登录后再进行打卡');
                      return;
                    }
                    
                    navigate('/checkin');
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    立即打卡
                  </div>
                </UIverseButton>
              </div>
            )}
            
            {/* 查看训练教程按钮 */}
            {todayWorkout?.type === 'workout' && (
              <div className="w-full flex justify-center">
                <UIverseButton 
                  variant="secondary"
                  onClick={() => navigate('/workout-tutorial')}
                >
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" />
                    查看训练教程
                  </div>
                </UIverseButton>
              </div>
            )}
          </div>
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
                  <h4 className="font-semibold text-gray-900">{coachName}</h4>
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
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => {
              console.log('🔥 历史记录按钮被点击');
              console.log('🔥 用户状态:', user);
              if (!user) {
                console.error('❌ 用户未登录');
                alert('请先登录');
                return;
              }
              console.log('🚀 导航到 /history');
              navigate('/history');
            }}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <Calendar className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">历史记录</p>
            <p className="text-xs text-gray-600">查看打卡历史</p>
          </button>
          
          <button 
            onClick={() => {
              console.log('🔥 健身社群按钮被点击');
              console.log('🔥 用户状态:', user);
              if (!user) {
                console.error('❌ 用户未登录');
                alert('请先登录');
                return;
              }
              console.log('🚀 导航到 /community');
              navigate('/community');
            }}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <Users className="w-6 h-6 text-orange-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">健身社群</p>
            <p className="text-xs text-gray-600">加入附近社群</p>
          </button>
          
          <button 
            onClick={() => {
              console.log('🔥 个人中心按钮被点击');
              console.log('🔥 用户状态:', user);
              if (!user) {
                console.error('❌ 用户未登录');
                alert('请先登录');
                return;
              }
              console.log('🚀 导航到 /profile');
              navigate('/profile');
            }}
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