import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Target, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { defaultWeeklyPlan, weekendWeeklyPlan, Exercise } from '../data/workoutPlans';
import { useCurrentContract } from '@/store';

// 训练动作视频映射
const exerciseVideos: Record<string, { title: string; url: string }> = {
  '杠铃深蹲': {
    title: '杠铃深蹲详细教学，教你如何做一个正确的深蹲，深蹲的正确姿势，深蹲的正确做法，如果你不知道深蹲怎么做，那么请认真看完这个视频。',
    url: 'https://www.bilibili.com/video/BV1VG4y157S3/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  '杠铃卧推': {
    title: '练胸教程：杠铃卧推的动作模式、常见错误、发力技巧',
    url: 'https://www.bilibili.com/video/BV16i421h71B/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  '上斜杠铃卧推': {
    title: '上斜杠铃卧推标准动作教学 | 上胸训练',
    url: 'https://www.bilibili.com/video/BV1mP4y1b7QX/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  '坐姿肩推': {
    title: '坐姿肩推标准动作教学 | 练肩必备',
    url: 'https://www.bilibili.com/video/BV1YP4y1b7Qg/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  '侧平举': {
    title: '侧平举标准动作教学 | 肩部中束训练',
    url: 'https://www.bilibili.com/video/BV1Zh411W7bP/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  '绳索下压（三头肌）': {
    title: '绳索下压标准动作教学 | 三头肌训练',
    url: 'https://www.bilibili.com/video/BV1fh411W7bQ/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  '绳索下压': {
    title: '绳索下压标准动作教学 | 三头肌训练',
    url: 'https://www.bilibili.com/video/BV1fh411W7bQ/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  '腿举': {
    title: '腿举标准动作教学 | 下肢力量训练',
    url: 'https://www.bilibili.com/video/BV1Yh411W7bR/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  '箭步蹲': {
    title: '箭步蹲标准动作教学 | 单腿训练',
    url: 'https://www.bilibili.com/video/BV1Zh411W7bS/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  '杠铃划船': {
    title: '杠铃划船标准动作教学 | 练背必备动作',
    url: 'https://www.bilibili.com/video/BV1aV4y1P7mK/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  '坐姿划船': {
    title: '坐姿划船标准动作教学 | 背部训练',
    url: 'https://www.bilibili.com/video/BV1fh411W7bT/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  '杠铃弯举': {
    title: '杠铃弯举标准动作教学 | 二头肌训练',
    url: 'https://www.bilibili.com/video/BV1Yh411W7bU/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  '高位下拉': {
    title: '练背动作教学｜倒三角必练｜高位下拉 (保姆级教程)',
    url: 'https://www.bilibili.com/video/BV1oa4y1z73J/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  '硬拉': {
    title: '如何学会做一个标准硬拉！',
    url: 'https://www.bilibili.com/video/BV1ku411T7N5/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  '平板支撑': {
    title: '不要这么做平板支撑（要避免的10个常见错误）',
    url: 'https://www.bilibili.com/video/BV1V24y1E7qW/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  '绳索下拉': {
    title: '练三头，有门道！绳索下拉做的好，三头一定会很好！一个绳索下拉就可以练我们"整个三头"，视频有点长，一定要耐心看完#干货分享#手臂训练#健身干货',
    url: 'https://www.bilibili.com/video/BV1Cz421z7FV/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  },
  'HIIT循环训练': {
    title: '12分钟HIIT高效燃脂训练，12个动作，每个做40秒，休息20秒，每天循环3组',
    url: 'https://www.bilibili.com/video/BV1Cz421z7FV/?share_source=copy_web&vd_source=87eb31e4d5c43acdfaec8e9760084699'
  }
};

const WorkoutTutorial: React.FC = () => {
  const navigate = useNavigate();
  const currentContract = useCurrentContract();
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  // 根据用户保存的计划类型选择训练计划
  const isWeekendPlan = currentContract?.workoutPlan?.planType === 'weekend';
  const selectedPlan = isWeekendPlan ? weekendWeeklyPlan : defaultWeeklyPlan;

  // 训练日程映射 - 根据计划类型动态设置
  const dayNames = isWeekendPlan ? {
    monday: '周一：全身拉伸恢复',
    tuesday: '周二：休息日',
    wednesday: '周三：休息日', 
    thursday: '周四：上肢放松+肩颈护理',
    friday: '周五：腿部预热',
    saturday: '周六：上肢为主，兼顾核心',
    sunday: '周日：下肢为主，强化整体'
  } : {
    monday: '周一 - 上肢推力',
    tuesday: '周二 - 下肢训练',
    wednesday: '周三 - 主动恢复',
    thursday: '周四 - 上肢拉力',
    friday: '周五 - 核心塑形',
    saturday: '周六 - 有氧训练',
    sunday: '周日 - 完全休息'
  };

  const currentWorkout = selectedPlan.days.find(day => day.id === selectedDay);

  const exerciseDetails: Record<string, {
    description: string;
    tips: string[];
    commonMistakes: string[];
    videoUrl?: string;
  }> = {
    '杠铃卧推': {
      description: '胸部训练的王牌动作，主要锻炼胸大肌、前三角肌和肱三头肌。',
      tips: [
        '保持肩胛骨收紧，背部自然弓形',
        '杠铃下降至胸部轻触，不要弹起',
        '推起时保持杠铃轨迹垂直',
        '呼吸：下降时吸气，推起时呼气'
      ],
      commonMistakes: [
        '肩膀前伸，容易受伤',
        '杠铃下降过快或过深',
        '腰部过度弓起',
        '握距过宽或过窄'
      ]
    },
    '深蹲': {
      description: '下肢训练之王，全面锻炼大腿前侧、后侧、臀部和核心肌群。',
      tips: [
        '双脚与肩同宽，脚尖略向外',
        '下蹲时膝盖与脚尖方向一致',
        '保持胸部挺起，核心收紧',
        '下蹲至大腿与地面平行'
      ],
      commonMistakes: [
        '膝盖内扣',
        '重心前倾',
        '下蹲深度不够',
        '腰部圆背'
      ]
    },
    '引体向上': {
      description: '背部训练的经典动作，主要锻炼背阔肌、菱形肌和肱二头肌。',
      tips: [
        '握距略宽于肩，掌心向前',
        '启动时想象肘部向下拉',
        '胸部向上挺，肩胛骨下沉',
        '控制下降速度'
      ],
      commonMistakes: [
        '身体摆动过大',
        '只用手臂力量',
        '下降过快',
        '动作幅度不完整'
      ]
    },
    '平板支撑': {
      description: '核心稳定性训练，锻炼腹部、背部和肩部的稳定肌群。',
      tips: [
        '身体保持一条直线',
        '肘部在肩膀正下方',
        '核心收紧，臀部不要翘起',
        '保持自然呼吸'
      ],
      commonMistakes: [
        '臀部过高或过低',
        '头部过度抬起或下垂',
        '肘部位置不正确',
        '憋气'
      ]
    }
  };

  const toggleExercise = (exerciseName: string) => {
    setExpandedExercise(expandedExercise === exerciseName ? null : exerciseName);
  };

  const ExerciseCard: React.FC<{ exercise: Exercise }> = ({ exercise }) => {
    const isExpanded = expandedExercise === exercise.name;
    const details = exerciseDetails[exercise.name] || {
      description: '专业的健身动作，请在教练指导下进行。',
      tips: ['保持正确姿势', '控制动作节奏', '注意呼吸配合'],
      commonMistakes: ['动作过快', '姿势不正确', '重量选择不当']
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div 
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleExercise(exercise.name)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{exercise.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {exercise.sets}组 × {exercise.reps}
                </span>
                {exercise.restTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    休息{exercise.restTime}
                  </span>
                )}
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-gray-100 p-4 space-y-4">
            {/* 动作描述 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">动作说明</h4>
              <p className="text-gray-600 text-sm">{details.description}</p>
            </div>

            {/* 视频播放区域 */}
            <div 
              className="bg-gray-100 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => {
                const video = exerciseVideos[exercise.name];
                if (video) {
                  window.open(video.url, '_blank');
                }
              }}
            >
              <Play className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm font-medium">
                {exerciseVideos[exercise.name]?.title || '动作演示视频'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {exerciseVideos[exercise.name] ? '点击观看B站教学视频' : '点击播放标准动作演示'}
              </p>
            </div>

            {/* 技巧要点 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">技巧要点</h4>
              <ul className="space-y-1">
                {details.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* 常见错误 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">常见错误</h4>
              <ul className="space-y-1">
                {details.commonMistakes.map((mistake, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">健身教程</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* 训练日选择 */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">选择训练日</h2>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(dayNames).map(([day, name]) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedDay === day
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* 当日训练概览 */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">
            {dayNames[selectedDay as keyof typeof dayNames]}
          </h3>
          
          {currentWorkout ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  预计时长: {currentWorkout.estimatedDuration}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {currentWorkout.targetMuscles.join('、')}
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                <span className="font-medium">训练类型:</span> {
                  currentWorkout.type === 'workout' ? '力量训练' : '完全休息'
                }
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-sm">今日为完全休息日，让身体充分恢复。</p>
          )}
        </div>

        {/* 训练动作列表 */}
        {currentWorkout && currentWorkout.exercises.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">训练动作</h3>
            
            {/* 热身 */}
            {currentWorkout.warmup && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  热身阶段 ({currentWorkout.warmup.duration}分钟)
                </h4>
                <div className="text-blue-800 text-sm space-y-1">
                  {currentWorkout.warmup.activities.map((activity, index) => (
                    <p key={index}>• {activity}</p>
                  ))}
                </div>
              </div>
            )}

            {/* 正式训练 */}
            <div className="space-y-3">
              {currentWorkout.exercises.map((exercise, index) => (
                <ExerciseCard key={index} exercise={exercise} />
              ))}
            </div>

            {/* 拉伸 */}
            {currentWorkout.cooldown && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  拉伸放松 ({currentWorkout.cooldown.duration}分钟)
                </h4>
                <div className="text-blue-800 text-sm space-y-1">
                  {currentWorkout.cooldown.stretches.map((stretch, index) => (
                    <p key={index}>• {stretch}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-medium text-gray-700 mb-2">完全休息日</h3>
            <p className="text-gray-600 text-sm">
              保证充足睡眠，让身体彻底恢复，为下周训练储备能量。
            </p>
          </div>
        )}

        {/* 安全提醒 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">⚠️ 安全提醒</h4>
          <ul className="text-yellow-800 text-sm space-y-1">
            <li>• 训练前务必充分热身，避免受伤</li>
            <li>• 选择适合自己的重量，循序渐进</li>
            <li>• 如有不适，立即停止训练</li>
            <li>• 建议在专业教练指导下进行</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WorkoutTutorial;