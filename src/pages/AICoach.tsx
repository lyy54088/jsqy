import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Mic, MicOff, Volume2, VolumeX, Settings, Sparkles } from 'lucide-react';
import { useAICoach, useUser, useCurrentContract, useTodayCheckIns, useDeepSeekApiKey, useDeepSeekEnabled, useAppStore } from '@/store';
import { initializeDeepSeek, FitnessCoachAI, type DeepSeekMessage } from '@/lib/deepseek-api';

interface Message {
  id: string;
  type: 'user' | 'coach';
  content: string;
  timestamp: Date;
}

const AICoach: React.FC = () => {
  const navigate = useNavigate();
  const aiCoach = useAICoach();
  const user = useUser();
  const currentContract = useCurrentContract();
  const todayCheckIns = useTodayCheckIns();
  const deepSeekApiKey = useDeepSeekApiKey();
  const deepSeekEnabled = useDeepSeekEnabled();
  const { setDeepSeekConfig } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [fitnessCoachAI, setFitnessCoachAI] = useState<FitnessCoachAI | null>(null);
  const [conversationHistory, setConversationHistory] = useState<DeepSeekMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  // 获取欢迎消息
  const getWelcomeMessage = useCallback(() => {
    if (!aiCoach || !user) return '';
    
    const greetings = {
      strict: [
        `${user.nickname}，我是你的教练${aiCoach.name}！`,
        '有什么健身问题尽管问我，我会严格督促你完成目标！'
      ],
      gentle: [
        `你好${user.nickname}，我是${aiCoach.name}～`,
        '有任何问题都可以和我聊聊，我会耐心帮助你的！'
      ],
      humorous: [
        `嗨${user.nickname}！我是你的专属教练${aiCoach.name}！`,
        '有什么想聊的吗？我可是很有趣的教练哦～'
      ]
    };
    
    return greetings[aiCoach.personality].join('\n\n');
  }, [aiCoach, user]);

  // 生成AI回复
  const generateAIResponse = useCallback((userMessage: string): string => {
    if (!aiCoach || !user) return '';
    
    const lowerMessage = userMessage.toLowerCase();
    
    // 根据关键词生成回复
    if (lowerMessage.includes('累') || lowerMessage.includes('疲劳')) {
      const responses = {
        strict: '累是正常的！但是不能因为累就放弃，休息5分钟后继续！记住，没有付出就没有收获！',
        gentle: '感觉累了就适当休息一下吧～身体健康最重要，不要勉强自己哦。可以做一些轻松的拉伸运动。',
        humorous: '累了？那说明你的肌肉在成长呢！它们在说"主人，我们在变强！"休息一下，然后继续战斗！💪'
      };
      return responses[aiCoach.personality];
    }
    
    if (lowerMessage.includes('饮食') || lowerMessage.includes('吃')) {
      const responses = {
        strict: '饮食控制是成功的关键！严格按照计划执行，少油少盐，多蛋白质和蔬菜。不要给自己找借口！',
        gentle: '饮食方面要注意营养均衡哦～可以多吃一些蛋白质丰富的食物，蔬菜水果也很重要。偶尔吃点喜欢的也没关系～',
        humorous: '民以食为天！但是我们要做聪明的"吃货"～蛋白质是肌肉的好朋友，蔬菜是身体的清洁工！'
      };
      return responses[aiCoach.personality];
    }
    
    if (lowerMessage.includes('坚持') || lowerMessage.includes('放弃')) {
      const responses = {
        strict: '坚持就是胜利！你已经付出了保证金，现在退缩就是浪费！想想你的目标，咬牙坚持下去！',
        gentle: '坚持确实不容易，但是你已经做得很好了～每一天的努力都在让你变得更好。相信自己，你一定可以的！',
        humorous: '放弃？不存在的！你的保证金还在我这里看着呢～开个玩笑，其实你比自己想象的要强大！'
      };
      return responses[aiCoach.personality];
    }
    
    if (lowerMessage.includes('运动') || lowerMessage.includes('健身')) {
      const responses = {
        strict: '运动要有计划有强度！不要偷懒，每个动作都要标准。记住，汗水不会骗人！',
        gentle: '运动是一个循序渐进的过程～根据自己的身体状况来调整强度，重要的是坚持下去。',
        humorous: '运动就像谈恋爱，需要激情也需要坚持！让我们和健康的身体"谈一场不分手的恋爱"吧！'
      };
      return responses[aiCoach.personality];
    }
    
    // 默认回复
    const defaultResponses = {
      strict: '说得对！保持这种积极的态度，严格执行计划，成功就在前方！',
      gentle: '嗯嗯，我理解你的想法～有什么具体的问题可以详细说说，我会帮助你的。',
      humorous: '哈哈，有趣！你知道吗，和你聊天让我觉得当教练真是太有意思了！'
    };
    
    return defaultResponses[aiCoach.personality];
  }, [aiCoach, user]);

  // 初始化 DeepSeek API
  useEffect(() => {
    // 使用用户提供的 DeepSeek API key，如果没有配置则使用默认的
    const userApiKey = deepSeekApiKey || aiCoach?.config.deepSeekApiKey;
    const defaultApiKey = 'sk-0834a814d7dd43049b8f2757f3f3554f';
    const apiKey = userApiKey || defaultApiKey;
    
    if (apiKey && aiCoach && user) {
      try {
        const deepSeek = initializeDeepSeek(apiKey);
        if (deepSeek) {
          const userContext = {
            name: user.nickname,
            goals: [user.fitnessGoal === 'lose_weight' ? '减重' : '增肌'],
            currentProgress: currentContract ? `第${currentContract.completedDays}天` : '刚开始',
            todayCheckIns: todayCheckIns.filter(c => c.status === 'approved').length,
            totalCheckIns: 5
          };
          
          const coachAI = new FitnessCoachAI(deepSeek, aiCoach.personality, userContext);
          setFitnessCoachAI(coachAI);
          
          // 如果使用的是默认 API key，自动更新配置
          if (!userApiKey) {
            setDeepSeekConfig(defaultApiKey, true);
          }
        }
      } catch (error) {
        console.error('初始化 DeepSeek API 失败:', error);
        setFitnessCoachAI(null);
      }
    } else {
      setFitnessCoachAI(null);
    }
  }, [aiCoach?.id, aiCoach?.personality, user?.id, deepSeekApiKey, deepSeekEnabled]);

  // 初始化对话
  useEffect(() => {
    if (aiCoach && !isInitialized.current) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'coach',
        content: getWelcomeMessage(),
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      isInitialized.current = true;
    }
  }, [aiCoach, getWelcomeMessage]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputText.trim() || !aiCoach) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    try {
      let aiResponseContent = '';
      
      if (fitnessCoachAI && deepSeekEnabled) {
        // 使用 DeepSeek API 生成回复
        aiResponseContent = await fitnessCoachAI.getResponse(userMessage.content, conversationHistory);
        
        // 更新对话历史
        setConversationHistory(prev => [
          ...prev,
          { role: 'user', content: userMessage.content },
          { role: 'assistant', content: aiResponseContent }
        ]);
      } else {
        // 降级到本地生成的回复
        aiResponseContent = generateAIResponse(userMessage.content);
      }
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: aiResponseContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('获取AI回复失败:', error);
      
      // 错误时使用本地生成的回复
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: generateAIResponse(userMessage.content),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  // 语音输入（模拟）
  const handleVoiceInput = () => {
    setIsListening(!isListening);
    
    if (!isListening) {
      // 模拟语音识别
      setTimeout(() => {
        setInputText('我今天感觉有点累，还要继续运动吗？');
        setIsListening(false);
      }, 2000);
    }
  };

  if (!aiCoach) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">还没有设置AI教练</p>
          <button 
            onClick={() => navigate('/ai-coach/setup')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            立即设置
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  <img 
                    src={aiCoach.avatar} 
                    alt={aiCoach.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">${aiCoach.name.charAt(0)}</div>`;
                    }}
                  />
                </div>
                
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{aiCoach.name}</h1>
                  <p className="text-sm text-gray-600">
                    {aiCoach.personality === 'strict' ? '严格型教练' : 
                     aiCoach.personality === 'gentle' ? '温和型教练' : '幽默型教练'}
                    {fitnessCoachAI && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI增强
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/ai-coach/settings')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-4 overflow-y-auto">
        {/* AI 功能状态提示 */}
        {fitnessCoachAI ? (
          <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-900 mb-1">AI 增强功能已启用</h3>
                <p className="text-sm text-green-700 mb-2">
                  正在使用 DeepSeek AI 为您提供更智能、更个性化的健身指导
                </p>
                <button
                  onClick={() => navigate('/ai-coach/settings')}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  管理设置
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-900 mb-1">AI 功能初始化中</h3>
                <p className="text-sm text-amber-700 mb-2">
                  正在连接 DeepSeek AI 服务，请稍候...
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}>
                {message.type === 'coach' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-600">{aiCoach.name}</span>
                  </div>
                )}
                
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {message.type === 'coach' && aiCoach.config.voiceEnabled && (
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-purple-600">{aiCoach.name}</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="和教练聊聊吧..."
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
              />
              
              <button
                onClick={handleVoiceInput}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                  isListening ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoach;