import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Target, Users, CheckCircle, Info, Play } from 'lucide-react';
import { useUser, useCurrentContract, useAppStore } from '@/store';
import { defaultWeeklyPlan, weekendWeeklyPlan, intensityLevels, trainingGoals, type WeeklyPlan, type WorkoutDay } from '../data/workoutPlans';

// 训练动作视频映射
const exerciseVideos: Record<string, { title: string; url: string }> = {
  '杠铃深蹲': {
    title: '杠铃深蹲详细教学，教你如何做一个正确的深蹲',
    url: 'https://www.bilibili.com/video/BV1VG4y157S3/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  '杠铃卧推': {
    title: '练胸教程：杠铃卧推的动作模式、常见错误、发力技巧',
    url: 'https://www.bilibili.com/video/BV16i421h71B/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  '高位下拉': {
    title: '练背动作教学｜倒三角必练｜高位下拉 (保姆级教程)',
    url: 'https://www.bilibili.com/video/BV1oa4y1z73J/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  '硬拉': {
    title: '如何学会做一个标准硬拉！',
    url: 'https://www.bilibili.com/video/BV1ku411T7N5/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  'HIIT循环训练': {
    title: '12分钟HIIT高效燃脂训练',
    url: 'https://www.bilibili.com/video/BV1Nt421Q7Qs/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  '杠铃划船': {
    title: '杠铃划船标准动作教学 | 练背必备动作',
    url: 'https://www.bilibili.com/video/BV1aV4y1P7mK/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  '坐姿肩推': {
    title: '坐姿肩推标准动作教学 | 练肩必备',
    url: 'https://www.bilibili.com/video/BV1YP4y1b7Qg/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  }
};

const WorkoutPlan: React.FC = () => {
  const navigate = useNavigate();
  const user = useUser();
  const currentContract = useCurrentContract();
  const { updateContract } = useAppStore();
  
  const [selectedPlanType, setSelectedPlanType] = useState<'default' | 'weekend' | 'custom'>('default');
  const [customSelectedWeekdays, setCustomSelectedWeekdays] = useState<string[]>(['monday', 'tuesday']);
  const [selectedPlan, setSelectedPlan] = useState<WeeklyPlan>(defaultWeeklyPlan);
  const [selectedIntensity, setSelectedIntensity] = useState<keyof typeof intensityLevels>('intermediate');
  const [selectedGoal, setSelectedGoal] = useState<keyof typeof trainingGoals>('muscle_gain');
  const [selectedDays, setSelectedDays] = useState<string[]>(['monday', 'tuesday', 'thursday', 'friday']);

  // 星期映射
  const weekdayMap = {
    'monday': '周一',
    'tuesday': '周二', 
    'wednesday': '周三',
    'thursday': '周四',
    'friday': '周五',
    'saturday': '周六',
    'sunday': '周日'
  };

  const weekdayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // 生成自定义训练计划
  const generateCustomPlan = (selectedWeekdays: string[]): WeeklyPlan => {
    const days = selectedWeekdays.length;
    
    if (days === 2) {
      // 2天使用周末计划内容
      const weekendDays = weekendWeeklyPlan.days.filter(day => day.type === 'workout');
      const customDays = selectedWeekdays.map((weekday, index) => ({
        ...weekendDays[index % weekendDays.length],
        id: weekday,
        name: weekdayMap[weekday as keyof typeof weekdayMap]
      }));
      
      // 添加休息日
      const restWeekdays = weekdayOrder.filter(day => !selectedWeekdays.includes(day));
      const restDays = restWeekdays.map(weekday => ({
        id: weekday,
        name: weekdayMap[weekday as keyof typeof weekdayMap],
        type: 'rest' as const,
        targetMuscles: [],
        estimatedDuration: 0,
        warmup: { duration: 0, activities: [] },
        exercises: [],
        cooldown: { duration: 0, stretches: [] }
      }));
      
      return {
        ...weekendWeeklyPlan,
        id: `custom-${selectedWeekdays.length}day`,
        name: `自定义${selectedWeekdays.length}天计划`,
        description: `每周${selectedWeekdays.length}天高强度训练，适合时间有限的人群`,
        days: [...customDays, ...restDays]
      };
    } else {
      // 3天以上借鉴标准计划内容
      const standardDays = defaultWeeklyPlan.days.filter(day => day.type === 'workout');
      const customDays = selectedWeekdays.map((weekday, index) => ({
        ...standardDays[index % standardDays.length],
        id: weekday,
        name: weekdayMap[weekday as keyof typeof weekdayMap]
      }));
      
      // 添加休息日
      const restWeekdays = weekdayOrder.filter(day => !selectedWeekdays.includes(day));
      const restDays = restWeekdays.map(weekday => ({
        id: weekday,
        name: weekdayMap[weekday as keyof typeof weekdayMap],
        type: 'rest' as const,
        targetMuscles: [],
        estimatedDuration: 0,
        warmup: { duration: 0, activities: [] },
        exercises: [],
        cooldown: { duration: 0, stretches: [] }
      }));
      
      return {
        id: `custom-${selectedWeekdays.length}day`,
        name: `自定义${selectedWeekdays.length}天计划`,
        description: `每周${selectedWeekdays.length}天训练，平衡强度与恢复`,
        frequency: `每周训练${selectedWeekdays.length}天`,
        totalDays: 7,
        // workoutDays: selectedWeekdays.length, // 移除不存在的属性
        estimatedDuration: customDays.reduce((total, day) => total + day.estimatedDuration, 0),
        days: [...customDays, ...restDays]
      };
    }
  };

  // 根据计划类型获取对应的训练计划
  const getSelectedPlan = () => {
    if (selectedPlanType === 'custom') {
      return generateCustomPlan(customSelectedWeekdays);
    }
    return selectedPlanType === 'weekend' ? weekendWeeklyPlan : defaultWeeklyPlan;
  };

  // 根据选择的计划类型更新计划和默认选择的天数
  useEffect(() => {
    const newPlan = getSelectedPlan();
    setSelectedPlan(newPlan);
    
    if (selectedPlanType === 'weekend') {
      setSelectedDays(['saturday', 'sunday']);
    } else if (selectedPlanType === 'custom') {
      // 自定义计划使用用户选择的星期
      setSelectedDays(customSelectedWeekdays);
    } else {
      setSelectedDays(['monday', 'tuesday', 'thursday', 'friday']);
    }
  }, [selectedPlanType, customSelectedWeekdays]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const handleDayToggle = (dayId: string) => {
    const day = selectedPlan.days.find(d => d.id === dayId);
    if (!day || day.type === 'rest') return; // 休息日不能取消
    
    setSelectedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(id => id !== dayId)
        : [...prev, dayId]
    );
  };

  const handleSavePlan = () => {
    // 添加调试信息
    console.log('Debug - handleSavePlan 开始执行');
    console.log('Debug - currentContract 状态:', currentContract);
    console.log('Debug - currentContract 是否存在:', !!currentContract);
    
    if (!currentContract) {
      console.log('Debug - 没有找到契约，显示提示信息');
      const shouldCreateContract = window.confirm('您还没有创建契约，需要先创建契约才能保存训练计划。是否现在去创建契约？');
      if (shouldCreateContract) {
        navigate('/contract/create');
      }
      return;
    }
    
    console.log('Debug - 契约验证通过，继续执行保存逻辑');

    // 验证自定义计划是否至少选择了2天
    if (selectedPlanType === 'custom' && customSelectedWeekdays.length < 2) {
      alert('自定义计划至少需要选择2天进行训练');
      return;
    }

    // 检查是否需要30天限制确认
    const currentWorkoutPlan = currentContract.workoutPlan;
    const isChangingPlanType = currentWorkoutPlan && 
      currentWorkoutPlan.planType && 
      currentWorkoutPlan.planType !== selectedPlanType;
    
    console.log('Debug - 当前训练计划:', currentWorkoutPlan);
    console.log('Debug - 是否更改计划类型:', isChangingPlanType);
    console.log('Debug - 当前计划类型:', currentWorkoutPlan?.planType);
    console.log('Debug - 选择的计划类型:', selectedPlanType);
    
    // 如果是更改计划类型，检查30天限制
    if (isChangingPlanType) {
      // 如果有lastModified字段，检查30天限制
      if (currentWorkoutPlan.lastModified) {
        const lastModified = new Date(currentWorkoutPlan.lastModified);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - lastModified.getTime()) / (1000 * 60 * 60 * 24));
        
        console.log('Debug - 上次修改时间:', lastModified);
        console.log('Debug - 距离天数:', daysDiff);
        
        if (daysDiff < 30) {
          const remainingDays = 30 - daysDiff;
          const confirmed = window.confirm(
            `更改之后只能30天后才可以再次调整，还需等待${remainingDays}天。确定更改吗？`
          );
          if (!confirmed) {
            return;
          }
        }
      } else {
        // 没有lastModified字段，说明是首次设置或旧数据，显示30天限制提醒
        console.log('Debug - 没有lastModified字段，显示30天限制提醒');
        const confirmed = window.confirm(
          '更改训练计划后30天内无法再次调整。确定更改吗？'
        );
        if (!confirmed) {
          return;
        }
      }
    }

    // 计算每周需要打卡的天数
    const workoutDays = selectedDays.filter(dayId => {
      const day = selectedPlan.days.find(d => d.id === dayId);
      return day && day.type === 'workout';
    });

    // 更新契约信息，包含训练计划
    const updates = {
      workoutPlan: {
        planId: selectedPlan.id,
        planType: selectedPlanType,
        intensity: selectedIntensity,
        goal: selectedGoal,
        selectedDays: selectedDays,
        customSelectedWeekdays: selectedPlanType === 'custom' ? customSelectedWeekdays : undefined,
        weeklyWorkoutDays: workoutDays.length,
        totalDays: 7, // 添加必需的totalDays属性
        lastModified: new Date() // 更新修改时间
      }
    };

    console.log('Debug - 保存的训练计划数据:', updates.workoutPlan);

    updateContract(currentContract.id, updates);
    alert('训练计划已保存！');
    navigate('/dashboard');
  };

  const getDayTypeColor = (type: string) => {
    switch (type) {
      case 'workout':
        return 'bg-black border-gray-600 text-white';
      case 'rest':
        return 'bg-gray-50 border-gray-200 text-gray-600';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const getDayTypeIcon = (type: WorkoutDay['type']) => {
    switch (type) {
      case 'workout': return '💪';
      case 'rest': return '😴';
      default: return '📅';
    }
  };

  if (!user) return null;

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
            <h1 className="text-xl font-bold text-gray-900">训练计划设置</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 计划类型选择 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">选择训练计划类型</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedPlanType('default')}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                selectedPlanType === 'default'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">💪</div>
              <div className="font-medium text-gray-900 mb-1">标准计划</div>
              <div className="text-xs text-gray-600">每周4-5天</div>
              <div className="text-xs text-gray-500 mt-1">适合有规律作息的人群，循序渐进的训练安排</div>
            </button>
            <button
              onClick={() => setSelectedPlanType('weekend')}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                selectedPlanType === 'weekend'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">🏃</div>
              <div className="font-medium text-gray-900 mb-1">周末计划</div>
              <div className="text-xs text-gray-600">每周2天</div>
              <div className="text-xs text-gray-500 mt-1">适合工作日忙碌的人群，周末集中训练</div>
            </button>
          </div>
          <div className="mt-3">
            <button
              onClick={() => setSelectedPlanType('custom')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                selectedPlanType === 'custom'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-medium text-gray-900 mb-1">自定义计划</div>
              <div className="text-xs text-gray-600">每周2-4天</div>
              <div className="text-xs text-gray-500 mt-1">灵活安排训练时间，适合不规律作息的人群</div>
            </button>
          </div>
          {selectedPlanType === 'custom' && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                选择训练日期（至少选择2天）
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {weekdayOrder.map((weekday) => (
                  <button
                    key={weekday}
                    onClick={() => {
                      const isSelected = customSelectedWeekdays.includes(weekday);
                      if (isSelected) {
                        // 取消选择，但要确保至少保留2天
                        if (customSelectedWeekdays.length > 2) {
                          setCustomSelectedWeekdays(prev => prev.filter(day => day !== weekday));
                        }
                      } else {
                        // 添加选择
                        setCustomSelectedWeekdays(prev => [...prev, weekday]);
                      }
                    }}
                    className={`p-2 rounded-lg border-2 text-xs font-medium transition-colors ${
                      customSelectedWeekdays.includes(weekday)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {weekdayMap[weekday as keyof typeof weekdayMap]}
                  </button>
                ))}
              </div>
              {customSelectedWeekdays.length < 2 && (
                <div className="text-xs text-red-500 mb-2">
                  ⚠️ 请至少选择2天进行训练
                </div>
              )}
              <div className="text-xs text-gray-500">
                已选择：{customSelectedWeekdays.length}天 - {customSelectedWeekdays.map(day => weekdayMap[day as keyof typeof weekdayMap]).join('、')}
              </div>
            </div>
          )}
        </div>

        {/* 计划概览 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">计划概览</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-700">{selectedPlan.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-700">{selectedPlan.frequency}</span>
            </div>
            <p className="text-sm text-gray-600">{selectedPlan.description}</p>
          </div>
        </div>

        {/* 训练强度选择 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">训练强度</h3>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(intensityLevels).map(([key, level]) => (
              <button
                key={key}
                onClick={() => setSelectedIntensity(key as keyof typeof intensityLevels)}
                className={`p-3 rounded-lg border-2 text-center transition-colors ${
                  selectedIntensity === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium text-gray-700">{level.name}</div>
                <div className="text-xs text-gray-500 mt-1">{level.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 训练目标选择 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">训练目标</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(trainingGoals).map(([key, goal]) => (
              <button
                key={key}
                onClick={() => setSelectedGoal(key as keyof typeof trainingGoals)}
                className={`p-3 rounded-lg border-2 text-center transition-colors ${
                  selectedGoal === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium text-gray-700">{goal.name}</div>
                <div className="text-xs text-gray-500 mt-1">{goal.description}</div>
              </button>
            ))}
          </div>
          
          {/* 显示选中目标的建议 */}
          {selectedGoal && (
            <div className="mt-3 p-3 bg-black rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">训练建议</h4>
              <div className="text-xs text-white space-y-1">
                <div>次数：{trainingGoals[selectedGoal].repRange}</div>
                <div>休息：{trainingGoals[selectedGoal].restTime}</div>
                <div>频率：{trainingGoals[selectedGoal].frequency}</div>
              </div>
            </div>
          )}
        </div>

        {/* 训练日程安排 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">训练日程安排</h3>
          <p className="text-sm text-gray-600 mb-4">
            {selectedPlanType === 'weekend' 
              ? '选择你想要训练的日子（周末计划建议周六、周日）'
              : selectedPlanType === 'custom'
              ? `自定义计划：已选择${customSelectedWeekdays.map(day => weekdayMap[day as keyof typeof weekdayMap]).join('、')}进行训练`
              : '选择你想要训练的日子（建议每周4-5天）'
            }
          </p>
          
          <div className="space-y-3">
            {selectedPlan.days.map((day) => (
              <div key={day.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className={`p-3 ${getDayTypeColor(day.type)} cursor-pointer`}
                  onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getDayTypeIcon(day.type)}</span>
                        <span className="font-medium">{day.name}</span>
                      </div>
                      {day.type === 'workout' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDayToggle(day.id);
                          }}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedDays.includes(day.id)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedDays.includes(day.id) && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="w-5 h-5 rounded border-2 border-gray-300 bg-gray-100 flex items-center justify-center cursor-pointer"
                          title="点击查看休息日详情"
                        >
                          <Info className="w-3 h-3 text-gray-500" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {day.estimatedDuration > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{day.estimatedDuration}分钟</span>
                        </div>
                      )}
                      <Info className="w-4 h-4" />
                    </div>
                  </div>
                  
                  {day.targetMuscles.length > 0 && (
                    <div className="mt-2 text-sm">
                      目标肌群：{day.targetMuscles.join('、')}
                    </div>
                  )}
                </div>

                {/* 展开的训练详情 */}
                {expandedDay === day.id && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    {/* 热身 */}
                    {day.warmup.duration > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-800 mb-2">
                          热身 ({day.warmup.duration}分钟)
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {day.warmup.activities.map((activity, index) => (
                            <li key={index}>• {activity}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 正式训练 */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-800 mb-2">正式训练</h4>
                      <div className="space-y-3">
                        {day.exercises.map((exercise, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-800">{exercise.name}</h5>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-blue-600">
                                  {exercise.sets}组 × {exercise.reps}
                                </span>
                                {exerciseVideos[exercise.name] && (
                                  <button
                                    onClick={() => window.open(exerciseVideos[exercise.name].url, '_blank')}
                                    className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                    title={exerciseVideos[exercise.name].title}
                                  >
                                    <Play className="w-3 h-3" />
                                    视频
                                  </button>
                                )}
                              </div>
                            </div>
                            {exercise.description && (
                              <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
                            )}
                            {exercise.tips && exercise.tips.length > 0 && (
                              <div className="text-xs text-gray-500">
                                <strong>技巧：</strong>
                                <ul className="mt-1 space-y-1">
                                  {exercise.tips.map((tip, tipIndex) => (
                                    <li key={tipIndex}>• {tip}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 拉伸 */}
                    {day.cooldown.duration > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">
                          拉伸放松 ({day.cooldown.duration}分钟)
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {day.cooldown.stretches.map((stretch, index) => (
                            <li key={index}>• {stretch}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 选择统计 */}
          <div className="mt-4 p-3 bg-black rounded-lg">
            <div className="text-sm text-white">
              <strong>已选择：</strong>
              每周训练 {selectedDays.filter(dayId => {
                const day = selectedPlan.days.find(d => d.id === dayId);
                return day && day.type === 'workout';
              }).length} 天
            </div>
            <div className="text-xs text-gray-300 mt-1">
              {selectedPlanType === 'weekend'
                ? '周末计划：集中在周六、周日进行高强度训练'
                : selectedPlanType === 'custom'
                ? `自定义计划：在${customSelectedWeekdays.map(day => weekdayMap[day as keyof typeof weekdayMap]).join('、')}进行训练`
                : '建议每周训练4-5天，留2-3天休息恢复'
              }
            </div>
          </div>
        </div>

        {/* 保存按钮 */}
        <button
          onClick={handleSavePlan}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          保存训练计划
        </button>

        <p className="text-xs text-gray-500 text-center">
          保存后将根据你的训练计划更新打卡要求
        </p>
      </div>
    </div>
  );
};

export default WorkoutPlan;