import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Mic, MicOff, Volume2, VolumeX, Settings, Sparkles } from 'lucide-react';
import { useAICoach, useUser, useCurrentContract, useTodayCheckIns, useCurrentChatSession, useAppStore } from '@/store';
import { chatWithAICoach, generateWelcomeMessage, type CoachType } from '@/lib/ai-chat-service';
import AvatarUpload from '@/components/AvatarUpload';

// Web Speech API 类型定义
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const AICoach: React.FC = () => {
  const navigate = useNavigate();
  const aiCoach = useAICoach();
  const user = useUser();
  const currentContract = useCurrentContract();
  const todayCheckIns = useTodayCheckIns();
  const currentChatSession = useCurrentChatSession();
  const { initializeChatSession, addChatMessage } = useAppStore();

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // 新增：语音播放状态
  const [currentSpeakingMessageId, setCurrentSpeakingMessageId] = useState<string | null>(null); // 当前播放的消息ID

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  // 组件加载时确保停止所有语音播放
  useEffect(() => {
    // 强制停止所有语音播放
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingMessageId(null);
      console.log('组件加载时停止所有语音播放');
    }

    // 页面可见性变化时停止语音播放
    const handleVisibilityChange = () => {
      if (document.hidden && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setCurrentSpeakingMessageId(null);
        console.log('页面隐藏时停止语音播放');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 组件卸载时清理
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setCurrentSpeakingMessageId(null);
        console.log('组件卸载时停止语音播放');
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // 自定义教练信息 - 统一使用store中的aiCoach状态
  const [coachName, setCoachName] = useState<string>(aiCoach?.name || '教练');
  const [coachAvatar, setCoachAvatar] = useState<string>(aiCoach?.avatar || '');
  const [showAvatarSettings, setShowAvatarSettings] = useState(false);

  // 从当前会话获取消息列表
  const messages = currentChatSession?.messages || [];

  // 获取欢迎消息
  const getWelcomeMessage = useCallback(() => {
    if (!aiCoach || !user) return '';
    
    // 使用新的AI聊天服务生成欢迎消息
    const customIdentity = aiCoach.customIdentity?.role || coachName;
    return generateWelcomeMessage(aiCoach.personality as CoachType, customIdentity);
  }, [aiCoach, user, coachName]);

  // 生成AI回复

  // 同步store中的教练信息到本地状态
  useEffect(() => {
    if (aiCoach) {
      setCoachName(aiCoach.name);
      // 设置头像，曼波教练使用默认头像
      let avatarUrl = aiCoach.avatar || '';
      if (aiCoach.personality === 'mambo' && !avatarUrl) {
        avatarUrl = '/mambo-coach-avatar.svg';
      }
      setCoachAvatar(avatarUrl);
      console.log('同步教练信息:', { name: aiCoach.name, avatar: avatarUrl, personality: aiCoach.personality });
    }
  }, [aiCoach]);

  // 处理头像更改 - 同时更新store和localStorage
  const handleAvatarChange = (newAvatar: string) => {
    setCoachAvatar(newAvatar);
    
    // 更新store中的教练信息
    if (aiCoach) {
      const updatedCoach = { ...aiCoach, avatar: newAvatar };
      useAppStore.getState().setAICoach(updatedCoach);
      console.log('更新store中的教练头像:', newAvatar);
    }
    
    // 同时更新localStorage中的教练信息以保持兼容性
    const savedCoach = localStorage.getItem('selectedCoach');
    if (savedCoach) {
      const coach = JSON.parse(savedCoach);
      coach.avatar = newAvatar;
      localStorage.setItem('selectedCoach', JSON.stringify(coach));
      console.log('更新localStorage中的教练头像:', newAvatar);
    }
  };

  // 初始化对话会话
  useEffect(() => {
    if (aiCoach && user && !isInitialized.current) {
      // 初始化或加载对话会话
      initializeChatSession(aiCoach.id);
      isInitialized.current = true;
    }
  }, [aiCoach, user, initializeChatSession]);

  // 添加欢迎消息（仅在新会话时）
  useEffect(() => {
    if (currentChatSession && currentChatSession.messages.length === 0 && aiCoach) {
      addChatMessage({
        type: 'coach',
        content: getWelcomeMessage(),
        timestamp: new Date(),
        coachId: aiCoach.id
      });
      
      // 确保不自动播放欢迎消息
      // 用户需要手动点击播放按钮
    }
  }, [currentChatSession, aiCoach, getWelcomeMessage, addChatMessage]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputText.trim() || !aiCoach || !currentChatSession) return;
    
    const userMessageContent = inputText.trim();
    setInputText('');
    setIsTyping(true);
    
    // 添加用户消息到全局状态
    addChatMessage({
      type: 'user',
      content: userMessageContent,
      timestamp: new Date(),
      coachId: aiCoach.id
    });
    
    try {
      // 构建自定义系统提示词
      let customSystemPrompt = '';
      const customIdentity = aiCoach.customIdentity;
      
      if (customIdentity && (customIdentity.role || customIdentity.description || customIdentity.speakingStyle)) {
        customSystemPrompt = `你是${coachName}，一个专业的健身教练。`;
        if (customIdentity.role) {
          customSystemPrompt += `你的身份是：${customIdentity.role}。`;
        }
        if (customIdentity.description) {
          customSystemPrompt += `${customIdentity.description}`;
        }
        if (customIdentity.speakingStyle) {
          customSystemPrompt += `你的说话风格是：${customIdentity.speakingStyle}。`;
        }
        if (customIdentity.traits && customIdentity.traits.length > 0) {
          customSystemPrompt += `你的特点包括：${customIdentity.traits.join('、')}。`;
        }
        customSystemPrompt += `请用这种风格回答用户关于健身的问题，并称呼用户为${user.nickname}。`;
      }
      
      // 调用真正的AI API
      const aiResult = await chatWithAICoach(
        userMessageContent,
        aiCoach.personality as CoachType,
        customSystemPrompt
      );
      
      if (aiResult.success && aiResult.reply) {
        // 添加 AI 回复到全局状态
        addChatMessage({
          type: 'coach',
          content: aiResult.reply,
          timestamp: new Date(),
          coachId: aiCoach.id
        });
      } else {
        throw new Error(aiResult.error || 'AI回复失败');
      }
      
    } catch (error) {
      console.error('获取AI回复失败:', error);
      
      // 错误时使用默认回复
      let fallbackResponse = '抱歉，我现在无法回复，请稍后再试。';
      
      if (error instanceof Error) {
        if (error.message.includes('网络')) {
          fallbackResponse = '网络连接失败，请检查网络后重试。';
        } else if (error.message.includes('API')) {
          fallbackResponse = 'AI服务暂时不可用，请稍后重试。';
        }
      }
      
      addChatMessage({
        type: 'coach',
        content: fallbackResponse,
        timestamp: new Date(),
        coachId: aiCoach.id
      });
    } finally {
      setIsTyping(false);
    }
  };

  // 语音播放功能 - 修改为支持暂停/停止和温柔小姐姐声音
  const handleSpeakMessage = (text: string, messageId: string, userTriggered: boolean = true) => {
    // 只允许用户主动触发的语音播放
    if (!userTriggered) {
      console.log('阻止非用户触发的语音播放');
      return;
    }
    
    if (!aiCoach.config.voiceEnabled) {
      console.log('语音功能已禁用');
      return;
    }
    
    // 如果正在播放同一条消息，则停止
    if (isSpeaking && currentSpeakingMessageId === messageId) {
      console.log('停止语音播放');
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingMessageId(null);
      return;
    }
    
    // 停止当前播放的语音（如果有的话）
    window.speechSynthesis.cancel();
    console.log('用户触发语音播放:', text.substring(0, 50) + '...');
    
    // 创建语音合成实例
    const utterance = new SpeechSynthesisUtterance(text);
    
    // 设置温柔的语音参数
    utterance.rate = 0.8; // 降低语速使声音更温柔
    utterance.pitch = 1.3; // 提高音调使声音更甜美
    utterance.volume = 0.8; // 音量
    
    // 智能选择温柔小姐姐的声音
    const voices = window.speechSynthesis.getVoices();
    console.log('可用语音列表:', voices.map(v => ({ name: v.name, lang: v.lang, gender: v.name })));
    
    // 优先选择中文女性语音
    let selectedVoice = null;
    
    // 第一优先级：寻找明确标识为女性的中文语音
    const femaleKeywords = ['female', 'woman', '女', '小姐', '姐姐', '温柔', '甜美', 'xiaoxiao', 'xiaoyi', 'xiaoyun'];
    const chineseFemaleVoice = voices.find(voice => {
      const isChineseVoice = voice.lang.includes('zh') || voice.name.toLowerCase().includes('chinese');
      const isFemaleVoice = femaleKeywords.some(keyword => 
        voice.name.toLowerCase().includes(keyword.toLowerCase())
      );
      return isChineseVoice && isFemaleVoice;
    });
    
    if (chineseFemaleVoice) {
      selectedVoice = chineseFemaleVoice;
      console.log('✅ 找到中文女性语音:', chineseFemaleVoice.name);
    } else {
      // 第二优先级：选择任意中文语音
      const chineseVoice = voices.find(voice => 
        voice.lang.includes('zh') || voice.name.toLowerCase().includes('chinese')
      );
      
      if (chineseVoice) {
        selectedVoice = chineseVoice;
        console.log('⚠️ 未找到女性语音，使用中文语音:', chineseVoice.name);
      } else {
        // 第三优先级：选择任意女性语音
        const anyFemaleVoice = voices.find(voice => 
          femaleKeywords.some(keyword => 
            voice.name.toLowerCase().includes(keyword.toLowerCase())
          )
        );
        
        if (anyFemaleVoice) {
          selectedVoice = anyFemaleVoice;
          console.log('⚠️ 未找到中文女性语音，使用其他女性语音:', anyFemaleVoice.name);
        } else {
          console.log('❌ 未找到合适的女性语音，将使用默认语音');
        }
      }
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // 设置事件监听器
    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSpeakingMessageId(messageId);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeakingMessageId(null);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentSpeakingMessageId(null);
    };
    
    // 播放语音
    window.speechSynthesis.speak(utterance);
  };

  // 语音输入功能
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('您的浏览器不支持语音识别功能，请使用Chrome或Edge浏览器');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      console.error('语音识别错误:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        alert('没有检测到语音，请重试');
      } else if (event.error === 'not-allowed') {
        alert('请允许麦克风权限以使用语音输入功能');
      } else {
        alert('语音识别失败，请重试');
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
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
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                  {coachAvatar ? (
                    <img 
                      src={coachAvatar} 
                      alt={coachName}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        // 如果头像加载失败，显示首字母
                        e.currentTarget.style.display = 'none';
                        (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <span className={coachAvatar ? 'hidden' : 'block'}>
                    {coachName.charAt(0)}
                  </span>
                </div>
                
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{coachName}</h1>
                  <p className="text-sm text-gray-600">
                    {aiCoach.personality === 'queen' ? '霸道御姐' : 
                     aiCoach.personality === 'loli' ? '温柔小萝莉' : '曼波教练'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAvatarSettings(!showAvatarSettings)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="头像设置"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        
        {showAvatarSettings && (
          <div className="px-4 py-3 bg-gray-50 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">自定义教练头像</h3>
            <AvatarUpload
              currentAvatar={coachAvatar}
              onAvatarChange={handleAvatarChange}
              className="mb-2"
            />
          </div>
        )}
      </div>

      {/* 消息列表 */}
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-4 overflow-y-auto">

        
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
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                      {coachAvatar ? (
                        <img 
                          src={coachAvatar} 
                          alt={coachName}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            // 如果头像加载失败，显示首字母
                            e.currentTarget.style.display = 'none';
                            (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <span className={coachAvatar ? 'hidden' : 'block'}>
                        {coachName.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-purple-600">{coachName}</span>
                  </div>
                )}
                
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {message.type === 'coach' && aiCoach.config.voiceEnabled && (
                    <button 
                      onClick={() => handleSpeakMessage(message.content, message.id)}
                      className={`transition-colors ${
                        isSpeaking && currentSpeakingMessageId === message.id
                          ? 'text-red-500 hover:text-red-700' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={isSpeaking && currentSpeakingMessageId === message.id ? '停止播放' : '播放语音'}
                    >
                      {isSpeaking && currentSpeakingMessageId === message.id ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
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
                  <span className="text-sm font-medium text-purple-600">{coachName}</span>
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
                className="w-full px-4 py-3 border-2 border-transparent bg-[#F3F3F3] rounded-full outline-none overflow-hidden transition-all duration-500 hover:border-[#4A9DEC] hover:shadow-[0px_0px_0px_7px_rgba(74,157,236,0.2)] hover:bg-white focus:border-[#4A9DEC] focus:shadow-[0px_0px_0px_7px_rgba(74,157,236,0.2)] focus:bg-white pr-12 text-black dark:text-black"
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