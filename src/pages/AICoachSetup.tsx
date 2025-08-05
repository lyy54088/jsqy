import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot, Volume2, VolumeX, Bell, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store';
import type { AICoach } from '@/store';

const AICoachSetup: React.FC = () => {
  const [selectedGoal, setSelectedGoal] = useState<'lose_weight' | 'build_muscle' | 'improve_fitness'>('build_muscle');
  const navigate = useNavigate();
  const { setAICoach, user } = useAppStore();
  const [selectedPersonality, setSelectedPersonality] = useState<'strict' | 'gentle' | 'humorous'>('gentle');
  const [coachName, setCoachName] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [reminderFrequency, setReminderFrequency] = useState<'low' | 'medium' | 'high'>('medium');

  const personalities = [
    {
      type: 'gentle' as const,
      name: '温和型',
      description: '耐心鼓励，温柔提醒',
      avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNzUiIHI9Ijc1IiBmaWxsPSJ1cmwoI2dyYWRpZW50MCkiLz4KPGNpcmNsZSBjeD0iNzUiIGN5PSI2MCIgcj0iMjUiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOSIvPgo8ZWxsaXBzZSBjeD0iNzUiIGN5PSIxMjAiIHJ4PSI0MCIgcnk9IjMwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjkiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQwIiB4MT0iMCIgeTE9IjAiIHgyPSIxNTAiIHkyPSIxNTAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzEwQjk4MSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwNTk2NjkiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K',
      sampleMessage: '今天的训练很棒！记得补充水分，身体是革命的本钱哦～',
      color: 'from-green-400 to-green-500'
    },
    {
      type: 'strict' as const,
      name: '严格型',
      description: '严格督促，高标准要求',
      avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNzUiIHI9Ijc1IiBmaWxsPSJ1cmwoI2dyYWRpZW50MCkiLz4KPGNpcmNsZSBjeD0iNzUiIGN5PSI2MCIgcj0iMjUiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOSIvPgo8ZWxsaXBzZSBjeD0iNzUiIGN5PSIxMjAiIHJ4PSI0MCIgcnk9IjMwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjkiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQwIiB4MT0iMCIgeTE9IjAiIHgyPSIxNTAiIHkyPSIxNTAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0VGNDQ0NCIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNEQzI2MjYiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K',
      sampleMessage: '还有2个打卡任务未完成！时间不等人，立即行动！',
      color: 'from-red-400 to-red-500'
    },
    {
      type: 'humorous' as const,
      name: '幽默型',
      description: '轻松有趣，寓教于乐',
      avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNzUiIHI9Ijc1IiBmaWxsPSJ1cmwoI2dyYWRpZW50MCkiLz4KPGNpcmNsZSBjeD0iNzUiIGN5PSI2MCIgcj0iMjUiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOSIvPgo8ZWxsaXBzZSBjeD0iNzUiIGN5PSIxMjAiIHJ4PSI0MCIgcnk9IjMwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjkiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQwIiB4MT0iMCIgeTE9IjAiIHgyPSIxNTAiIHkyPSIxNTAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0ZCQkYyNCIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGNTk3MjAiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K',
      sampleMessage: '哎呀，你的肌肉在偷懒呢！快去唤醒它们吧～💪',
      color: 'from-yellow-400 to-orange-500'
    }
  ];

  const handleComplete = () => {
    if (!user || !coachName.trim()) return;

    const coach: AICoach = {
      id: Date.now().toString(),
      name: coachName.trim(),
      personality: selectedPersonality,
      avatar: personalities.find(p => p.type === selectedPersonality)?.avatar || '',
      userId: user.id,
      config: {
        voiceEnabled,
        reminderFrequency,
        deepSeekEnabled: false,
        deepSeekApiKey: undefined
      }
    };

    setAICoach(coach);
    navigate('/dashboard');
  };

  const selectedPersonalityData = personalities.find(p => p.type === selectedPersonality);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/contract/create')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">设置AI教练</h1>
          </div>
        </div>
      </div>

            <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 目标选择 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">您的主要目标是什么？</h3>
          <div className="space-y-3">
            <button
              onClick={() => setSelectedGoal('lose_weight')}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center ${selectedGoal === 'lose_weight' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <i className={`fas fa-weight-hanging text-2xl mr-4 ${selectedGoal === 'lose_weight' ? 'text-blue-500' : 'text-gray-400'}`}></i>
              <span className={`text-lg ${selectedGoal === 'lose_weight' ? 'font-bold text-gray-900' : 'text-gray-600'}`}>减重</span>
            </button>
            <button
              onClick={() => setSelectedGoal('build_muscle')}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center ${selectedGoal === 'build_muscle' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <i className={`fas fa-dumbbell text-2xl mr-4 ${selectedGoal === 'build_muscle' ? 'text-blue-500' : 'text-gray-400'}`}></i>
              <span className={`text-lg ${selectedGoal === 'build_muscle' ? 'font-bold text-gray-900' : 'text-gray-600'}`}>增肌</span>
            </button>
            <button
              onClick={() => setSelectedGoal('improve_fitness')}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center ${selectedGoal === 'improve_fitness' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <i className={`fas fa-heart-pulse text-2xl mr-4 ${selectedGoal === 'improve_fitness' ? 'text-blue-500' : 'text-gray-400'}`}></i>
              <span className={`text-lg ${selectedGoal === 'improve_fitness' ? 'font-bold text-gray-900' : 'text-gray-600'}`}>提升体能</span>
            </button>
          </div>
        </div>

        {/* 教练名称 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">给你的教练起个名字</h3>
          
          <div className="relative">
            <Bot className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={coachName}
              onChange={(e) => setCoachName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如：小智、阿强、美美..."
              maxLength={10}
            />
          </div>
          
          <p className="text-xs text-gray-500 mt-2">一个好名字让你们的关系更亲密</p>
        </div>

        {/* 性格选择 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">选择教练性格</h3>
          
          <div className="space-y-3">
            {personalities.map((personality) => {
              const isSelected = selectedPersonality === personality.type;
              
              return (
                <button
                  key={personality.type}
                  onClick={() => setSelectedPersonality(personality.type)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      <img 
                        src={personality.avatar} 
                        alt={personality.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-to-r ${personality.color} flex items-center justify-center text-white font-bold">${personality.name.charAt(0)}</div>`;
                        }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{personality.name}</h4>
                        {isSelected && <Sparkles className="w-4 h-4 text-blue-500" />}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{personality.description}</p>
                      
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-700 italic">
                          "{personality.sampleMessage}"
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 功能设置 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">功能设置</h3>
          
          <div className="space-y-4">
            {/* 语音功能 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {voiceEnabled ? (
                  <Volume2 className="w-5 h-5 text-blue-600" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900">语音播报</p>
                  <p className="text-sm text-gray-600">教练消息语音播放</p>
                </div>
              </div>
              
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  voiceEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* 提醒频率 */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">提醒频率</p>
                  <p className="text-sm text-gray-600">教练主动提醒的频率</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'low', label: '低频', desc: '1-2次/天' },
                  { value: 'medium', label: '中频', desc: '3-4次/天' },
                  { value: 'high', label: '高频', desc: '5-6次/天' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setReminderFrequency(option.value as any)}
                    className={`p-3 rounded-lg border-2 transition-colors text-center ${
                      reminderFrequency === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-xs text-gray-600">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 预览卡片 */}
        {coachName && selectedPersonalityData && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-3">教练预览</h3>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                <img 
                  src={selectedPersonalityData.avatar} 
                  alt={coachName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-to-r ${selectedPersonalityData.color} flex items-center justify-center text-white font-bold text-sm">${coachName.charAt(0)}</div>`;
                  }}
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{coachName}</h4>
                  <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">
                    {selectedPersonalityData.name}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700">
                  你好！我是你的专属健身教练{coachName}，{selectedPersonalityData.description}。让我们一起完成这个契约吧！
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 完成按钮 */}
        <button
          onClick={handleComplete}
          disabled={!coachName.trim()}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          完成设置，开始契约
        </button>
        
        <p className="text-xs text-gray-500 text-center">
          设置完成后，你的AI教练将开始陪伴你的健身之旅
        </p>
      </div>
    </div>
  );
};

export default AICoachSetup;