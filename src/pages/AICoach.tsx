import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Mic, MicOff, Volume2, VolumeX, Settings, Sparkles } from 'lucide-react';
import { useAICoach, useUser, useCurrentContract, useTodayCheckIns, useCurrentChatSession, useAppStore } from '@/store';

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
  
  // 自定义教练信息
  const [coachName, setCoachName] = useState('小美教练');
  const [coachAvatar, setCoachAvatar] = useState('');

  // 从当前会话获取消息列表
  const messages = currentChatSession?.messages || [];

  // 获取欢迎消息
  const getWelcomeMessage = useCallback(() => {
    if (!aiCoach || !user) return '';
    
    const greetings = {
      strict: [
        `${user.nickname}，我是你的教练${coachName}！`,
        '有什么健身问题尽管问我，我会严格督促你完成目标！'
      ],
      gentle: [
        `你好${user.nickname}，我是${coachName}～`,
        '有任何问题都可以和我聊聊，我会耐心帮助你的！'
      ],
      humorous: [
        `嗨${user.nickname}！我是你的专属教练${coachName}！`,
        '有什么想聊的吗？我可是很有趣的教练哦～'
      ]
    };
    
    return greetings[aiCoach.personality].join('\n\n');
  }, [aiCoach, user, coachName]);

  // 生成AI回复
  const generateAIResponse = useCallback((userMessage: string): string => {
    if (!aiCoach || !user) return '';
    
    const lowerMessage = userMessage.toLowerCase();
    
    // 使用自定义身份信息
    const customIdentity = aiCoach.customIdentity;
    const hasCustomIdentity = customIdentity && (customIdentity.role || customIdentity.description || customIdentity.speakingStyle);
    
    // 自我介绍相关问题
    if (lowerMessage.includes('你是谁') || lowerMessage.includes('介绍') || lowerMessage.includes('你好') || lowerMessage === '谁') {
      if (hasCustomIdentity) {
        // 使用自定义身份信息
        let introduction = `你好${user.nickname}！我是${coachName}`;
        if (customIdentity.role) {
          introduction += `，${customIdentity.role}`;
        }
        if (customIdentity.description) {
          introduction += `。${customIdentity.description}`;
        }
        if (customIdentity.speakingStyle) {
          introduction += ` ${customIdentity.speakingStyle}`;
        }
        if (customIdentity.traits && customIdentity.traits.length > 0) {
          introduction += ` 我的特点是：${customIdentity.traits.join('、')}。`;
        }
        return introduction;
      } else {
        // 使用默认性格回复
        const responses = {
          strict: `我是${coachName}，你的专属健身教练！我会严格监督你的训练计划，确保你达成健身目标。不要想着偷懒，我会盯着你的每一个动作！`,
          gentle: `你好${user.nickname}～我是${coachName}，你的贴心健身教练。我会温柔地陪伴你完成健身之旅，有任何问题都可以随时问我哦！`,
          humorous: `哈喽！我是大名鼎鼎的${coachName}教练！专业拯救懒癌患者，让你从"葛优躺"变成"施瓦辛格"！准备好和我一起燃烧卡路里了吗？🔥`
        };
        return responses[aiCoach.personality];
      }
    }
    
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
      if (hasCustomIdentity && customIdentity.speakingStyle) {
        // 使用自定义说话风格
        let response = '关于运动健身，我建议你要有计划有强度地进行训练。';
        if (customIdentity.speakingStyle.includes('温和') || customIdentity.speakingStyle.includes('耐心')) {
          response = '运动是一个循序渐进的过程～根据自己的身体状况来调整强度，重要的是坚持下去。';
        } else if (customIdentity.speakingStyle.includes('幽默') || customIdentity.speakingStyle.includes('有趣')) {
          response = '运动就像谈恋爱，需要激情也需要坚持！让我们和健康的身体"谈一场不分手的恋爱"吧！';
        } else if (customIdentity.speakingStyle.includes('专业') || customIdentity.speakingStyle.includes('简单')) {
          response = '运动健身需要科学的方法和持续的坚持。建议制定合理的训练计划，循序渐进地提高强度。';
        }
        return response;
      } else {
        // 使用默认性格回复
        const responses = {
          strict: '运动要有计划有强度！不要偷懒，每个动作都要标准。记住，汗水不会骗人！',
          gentle: '运动是一个循序渐进的过程～根据自己的身体状况来调整强度，重要的是坚持下去。',
          humorous: '运动就像谈恋爱，需要激情也需要坚持！让我们和健康的身体"谈一场不分手的恋爱"吧！'
        };
        return responses[aiCoach.personality];
      }
    }
    
    // 时间相关问题
    if (lowerMessage.includes('什么时候') || lowerMessage.includes('时间')) {
      const responses = {
        strict: '最佳运动时间是早上6-8点或下午4-6点！不要找借口，现在就是最好的时间！',
        gentle: '其实任何时间都可以运动哦～选择你觉得最舒服的时间段，重要的是养成习惯。',
        humorous: '什么时候运动最好？当然是"现在"啦！不过如果你非要问具体时间，我推荐早上或傍晚～'
      };
      return responses[aiCoach.personality];
    }
    
    // 效果相关问题
    if (lowerMessage.includes('效果') || lowerMessage.includes('多久') || lowerMessage.includes('见效')) {
      const responses = {
        strict: '想看到效果？至少坚持4-6周！没有捷径，只有汗水和坚持！停止幻想，开始行动！',
        gentle: '一般来说，坚持运动2-4周就能感受到身体的变化，6-8周能看到明显效果。要有耐心哦～',
        humorous: '想要马上看到效果？除非你有哆啦A梦的时光机！一般需要4-6周，但相信我，等待是值得的！'
      };
      return responses[aiCoach.personality];
    }
    
    // 鼓励和支持
    if (lowerMessage.includes('谢谢') || lowerMessage.includes('感谢')) {
      const responses = {
        strict: '不用谢！这是我的职责！继续保持这种积极态度，成功就在前方！',
        gentle: '不客气呀～能帮到你我很开心！有什么需要随时找我哦～',
        humorous: '哎呀，这么客气干嘛～我们是战友嘛！一起加油，向着马甲线进发！💪'
      };
      return responses[aiCoach.personality];
    }
    
    // 默认回复
    if (hasCustomIdentity && customIdentity.speakingStyle) {
      // 使用自定义说话风格的默认回复
      let response = '我理解你的想法，有什么具体的问题可以详细说说吗？';
      if (customIdentity.speakingStyle.includes('温和') || customIdentity.speakingStyle.includes('耐心')) {
        response = '嗯嗯，我理解你的想法～有什么具体的问题可以详细说说，我会耐心帮助你的。';
      } else if (customIdentity.speakingStyle.includes('幽默') || customIdentity.speakingStyle.includes('有趣')) {
        response = '哈哈，有趣！你知道吗，和你聊天让我觉得当教练真是太有意思了！';
      } else if (customIdentity.speakingStyle.includes('专业') || customIdentity.speakingStyle.includes('简单')) {
        response = '我明白了。如果你有具体的健身问题，我很乐意为你提供专业的建议。';
      } else if (customIdentity.speakingStyle.includes('鼓励') || customIdentity.speakingStyle.includes('激励')) {
        response = '说得对！保持这种积极的态度，坚持下去，成功就在前方！';
      }
      return response;
    } else {
      // 使用默认性格回复
      const defaultResponses = {
        strict: '说得对！保持这种积极的态度，严格执行计划，成功就在前方！',
        gentle: '嗯嗯，我理解你的想法～有什么具体的问题可以详细说说，我会帮助你的。',
        humorous: '哈哈，有趣！你知道吗，和你聊天让我觉得当教练真是太有意思了！'
      };
      
      return defaultResponses[aiCoach.personality];
    }
  }, [aiCoach, user]);



  // 加载自定义教练信息
  useEffect(() => {
    const savedCoachName = localStorage.getItem('coachName');
    const savedCoachAvatar = localStorage.getItem('coachAvatar');
    if (savedCoachName) {
      setCoachName(savedCoachName);
    }
    if (savedCoachAvatar) {
      setCoachAvatar(savedCoachAvatar);
    }
  }, []);

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
      // 使用本地生成的回复
      const aiResponseContent = generateAIResponse(userMessageContent);
      
      // 添加 AI 回复到全局状态
      addChatMessage({
        type: 'coach',
        content: aiResponseContent,
        timestamp: new Date(),
        coachId: aiCoach.id
      });
      
      // 移除自动播放语音功能 - 让用户手动控制
      // if (aiCoach.config.voiceEnabled) {
      //   setTimeout(() => {
      //     handleSpeakMessage(aiResponseContent);
      //   }, 500);
      // }
    } catch (error) {
      console.error('获取AI回复失败:', error);
      
      // 错误时使用默认回复
      const fallbackResponse = '抱歉，我现在无法回复，请稍后再试。';
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
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                  {coachAvatar ? (
                    <img 
                      src={coachAvatar} 
                      alt={coachName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    coachName.charAt(0)
                  )}
                </div>
                
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{coachName}</h1>
                  <p className="text-sm text-gray-600">
                    {aiCoach.personality === 'strict' ? '严格型教练' : 
                     aiCoach.personality === 'gentle' ? '温和型教练' : '幽默型教练'}
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