import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Target, Users, CheckCircle, Info } from 'lucide-react';
import { useUser, useCurrentContract, useAppStore } from '@/store';
import { defaultWeeklyPlan, intensityLevels, trainingGoals, type WeeklyPlan, type WorkoutDay } from '../data/workoutPlans';

const WorkoutPlan: React.FC = () => {
  const navigate = useNavigate();
  const user = useUser();
  const currentContract = useCurrentContract();
  const { updateContract } = useAppStore();
  
  const [selectedPlan, setSelectedPlan] = useState<WeeklyPlan>(defaultWeeklyPlan);
  const [selectedIntensity, setSelectedIntensity] = useState<keyof typeof intensityLevels>('intermediate');
  const [selectedGoal, setSelectedGoal] = useState<keyof typeof trainingGoals>('muscle_gain');
  const [selectedDays, setSelectedDays] = useState<string[]>(['monday', 'tuesday', 'thursday', 'friday']);
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
    if (!currentContract) {
      alert('请先创建契约');
      return;
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
        intensity: selectedIntensity,
        goal: selectedGoal,
        selectedDays: selectedDays,
        weeklyWorkoutDays: workoutDays.length
      }
    };

    updateContract(currentContract.id, updates);
    alert('训练计划已保存！');
    navigate('/dashboard');
  };

  const getDayTypeColor = (type: WorkoutDay['type']) => {
    switch (type) {
      case 'workout': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'active_recovery': return 'bg-green-50 border-green-200 text-green-800';
      case 'rest': return 'bg-gray-50 border-gray-200 text-gray-600';
      default: return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const getDayTypeIcon = (type: WorkoutDay['type']) => {
    switch (type) {
      case 'workout': return '💪';
      case 'active_recovery': return '🧘';
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
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">训练建议</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <div>次数：{trainingGoals[selectedGoal].recommendations.reps}</div>
                <div>组数：{trainingGoals[selectedGoal].recommendations.sets}</div>
                <div>休息：{trainingGoals[selectedGoal].recommendations.rest}</div>
                <div>频率：{trainingGoals[selectedGoal].recommendations.frequency}</div>
              </div>
            </div>
          )}
        </div>

        {/* 训练日程安排 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">训练日程安排</h3>
          <p className="text-sm text-gray-600 mb-4">选择你想要训练的日子（建议每周4-5天）</p>
          
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
                      {day.type === 'workout' && (
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
                              <span className="text-sm text-blue-600">
                                {exercise.sets}组 × {exercise.reps}
                              </span>
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
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>已选择：</strong>
              每周训练 {selectedDays.filter(dayId => {
                const day = selectedPlan.days.find(d => d.id === dayId);
                return day && day.type === 'workout';
              }).length} 天
            </div>
            <div className="text-xs text-blue-600 mt-1">
              建议每周训练4-5天，留2-3天休息恢复
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