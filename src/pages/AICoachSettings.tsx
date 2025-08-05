import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Settings, AlertCircle, User, Edit3, Plus, X, Camera, Upload } from 'lucide-react';
import { useAICoach, useDeepSeekApiKey, useDeepSeekEnabled, useAppStore } from '@/store';

const AICoachSettings: React.FC = () => {
  const navigate = useNavigate();
  const aiCoach = useAICoach();
  const deepSeekApiKey = useDeepSeekApiKey();
  const deepSeekEnabled = useDeepSeekEnabled();
  const { setDeepSeekConfig, setAICoach } = useAppStore();
  
  const [apiKey, setApiKey] = useState(deepSeekApiKey || '');
  const [deepSeekEnabledLocal, setDeepSeekEnabledLocal] = useState<boolean>(deepSeekEnabled ?? true);
  const [voiceEnabled, setVoiceEnabled] = useState(aiCoach?.config.voiceEnabled || false);
  const [reminderFrequency, setReminderFrequency] = useState<'low' | 'medium' | 'high'>(
    aiCoach?.config.reminderFrequency || 'medium'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // 自定义身份编辑状态
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [customIdentity, setCustomIdentity] = useState({
    role: aiCoach?.customIdentity?.role || '专业健身教练',
    description: aiCoach?.customIdentity?.description || '',
    speakingStyle: aiCoach?.customIdentity?.speakingStyle || '',
    traits: aiCoach?.customIdentity?.traits || []
  });
  const [newTrait, setNewTrait] = useState('');
  
  // 教练名字和头像编辑状态
  const [coachName, setCoachName] = useState('小美教练');
  const [coachAvatar, setCoachAvatar] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aiCoach) {
      setVoiceEnabled(aiCoach.config.voiceEnabled);
      setReminderFrequency(aiCoach.config.reminderFrequency);
      setDeepSeekEnabledLocal(aiCoach.config.deepSeekEnabled);
      if (aiCoach.config.deepSeekApiKey) {
        setApiKey(aiCoach.config.deepSeekApiKey);
      }
      
      // 初始化自定义身份数据
      setCustomIdentity({
        role: aiCoach.customIdentity?.role || '专业健身教练',
        description: aiCoach.customIdentity?.description || '',
        speakingStyle: aiCoach.customIdentity?.speakingStyle || '',
        traits: aiCoach.customIdentity?.traits || []
      });
    }
    
    // 加载保存的教练名字和头像
    const savedCoachName = localStorage.getItem('coachName');
    const savedCoachAvatar = localStorage.getItem('coachAvatar');
    if (savedCoachName) {
      setCoachName(savedCoachName);
    }
    if (savedCoachAvatar) {
      setCoachAvatar(savedCoachAvatar);
    }
  }, [aiCoach]);

  // 处理特点标签
  const handleAddTrait = () => {
    if (newTrait.trim() && !customIdentity.traits.includes(newTrait.trim())) {
      setCustomIdentity(prev => ({
        ...prev,
        traits: [...prev.traits, newTrait.trim()]
      }));
      setNewTrait('');
    }
  };

  const handleRemoveTrait = (index: number) => {
    setCustomIdentity(prev => ({
      ...prev,
      traits: prev.traits.filter((_, i) => i !== index)
    }));
  };

  // 处理头像上传
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        setSaveMessage('请选择图片文件');
        setTimeout(() => setSaveMessage(''), 3000);
        return;
      }
      
      // 检查文件大小 (限制为 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setSaveMessage('图片大小不能超过 2MB');
        setTimeout(() => setSaveMessage(''), 3000);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCoachAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 保存教练信息
  const handleSaveProfile = () => {
    try {
      localStorage.setItem('coachName', coachName);
      localStorage.setItem('coachAvatar', coachAvatar);
      setIsEditingProfile(false);
      setSaveMessage('教练信息保存成功！');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('保存失败，请重试');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // 更新 DeepSeek 配置
      if (deepSeekEnabledLocal && apiKey.trim()) {
        setDeepSeekConfig(apiKey.trim(), true);
      } else {
        setDeepSeekConfig('', false);
      }
      
      // 更新 AI 教练配置
      if (aiCoach) {
        const updatedCoach = {
          ...aiCoach,
          customIdentity: {
            role: customIdentity.role,
            description: customIdentity.description,
            speakingStyle: customIdentity.speakingStyle,
            traits: customIdentity.traits
          },
          config: {
            ...aiCoach.config,
            voiceEnabled,
            reminderFrequency,
            deepSeekEnabled: deepSeekEnabledLocal && !!apiKey.trim(),
            deepSeekApiKey: deepSeekEnabledLocal ? apiKey.trim() : undefined
          }
        };
        
        setAICoach(updatedCoach);
      }
      
      setSaveMessage('设置已保存');
      setTimeout(() => {
        navigate('/ai-coach');
      }, 1500);
    } catch (error) {
      console.error('保存设置失败:', error);
      setSaveMessage('保存失败，请重试');
    } finally {
      setIsSaving(false);
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
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/ai-coach')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-lg font-bold text-gray-900">AI教练设置</h1>
            </div>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>

      {/* 设置内容 */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* 教练基本信息 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">教练基本信息</h3>
              </div>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                {isEditingProfile ? '取消' : '编辑'}
              </button>
            </div>
            
            {!isEditingProfile ? (
              /* 教练信息展示 */
              <div className="flex items-start gap-4">
                {/* 头像 */}
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold">
                  {coachAvatar ? (
                    <img src={coachAvatar} alt="教练头像" className="w-full h-full object-cover" />
                  ) : (
                    coachName.charAt(0)
                  )}
                </div>
                
                {/* 信息 */}
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">{coachName}</h4>
                  <p className="text-sm text-gray-600 mb-2">{customIdentity.role}</p>
                  <p className="text-sm text-gray-700 mb-3">{customIdentity.description}</p>
                  
                  {/* 说话方式 */}
                  {customIdentity.speakingStyle && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">说话方式</span>
                      <p className="text-sm text-gray-700 mt-1">{customIdentity.speakingStyle}</p>
                    </div>
                  )}
                  
                  {/* 特点标签 */}
                  {customIdentity.traits.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {customIdentity.traits.map((trait, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* 教练信息编辑 */
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">编辑教练身份</h3>
                </div>
                {/* 头像编辑 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    教练头像
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold">
                      {coachAvatar ? (
                        <img src={coachAvatar} alt="教练头像" className="w-full h-full object-cover" />
                      ) : (
                        coachName.charAt(0)
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        上传头像
                      </button>
                      {coachAvatar && (
                        <button
                          onClick={() => setCoachAvatar('')}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          移除头像
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    支持 JPG、PNG 格式，文件大小不超过 2MB
                  </p>
                </div>
                
                {/* 名字编辑 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    教练名字
                  </label>
                  <input
                    type="text"
                    value={coachName}
                    onChange={(e) => setCoachName(e.target.value)}
                    placeholder="请输入教练名字"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* 保存按钮 */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    保存
                  </button>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 自定义教练身份 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">自定义教练身份</h3>
              </div>
              <button
                onClick={() => setIsEditingIdentity(!isEditingIdentity)}
                className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                编辑
              </button>
            </div>
          </div>

          {/* 自定义身份编辑 */}
          {isEditingIdentity && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              
              <div className="space-y-4">
                {/* 角色身份 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    角色身份
                  </label>
                  <input
                    type="text"
                    value={customIdentity.role}
                    onChange={(e) => setCustomIdentity(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="如：专业健身教练、营养师、运动康复师等"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 身份描述 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    身份描述
                  </label>
                  <textarea
                    value={customIdentity.description}
                    onChange={(e) => setCustomIdentity(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="描述教练的专业背景、经验等"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* 说话方式 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    说话方式
                  </label>
                  <textarea
                    value={customIdentity.speakingStyle}
                    onChange={(e) => setCustomIdentity(prev => ({ ...prev, speakingStyle: e.target.value }))}
                    placeholder="描述教练的说话风格，如：温和耐心、严格直接、幽默风趣等"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* 性格特点 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    性格特点
                  </label>
                  
                  {/* 现有特点 */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {customIdentity.traits.map((trait, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                      >
                        {trait}
                        <button
                          onClick={() => handleRemoveTrait(index)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  {/* 添加新特点 */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTrait}
                      onChange={(e) => setNewTrait(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTrait()}
                      placeholder="添加性格特点"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddTrait}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* 保存按钮 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditingIdentity(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    完成编辑
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DeepSeek AI 设置 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900">DeepSeek AI 增强</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">启用 AI 增强</p>
                  <p className="text-sm text-gray-600">使用 DeepSeek AI 提供更智能的对话</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deepSeekEnabledLocal}
                    onChange={(e) => setDeepSeekEnabledLocal(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {deepSeekEnabledLocal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="请输入 DeepSeek API Key"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ 
                        fontFamily: 'monospace',
                        letterSpacing: '2px'
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    API Key 将安全存储在本地，不会上传到服务器
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 基础设置 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">基础设置</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">语音播报</p>
                  <p className="text-sm text-gray-600">AI回复时播放语音</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={voiceEnabled}
                    onChange={(e) => setVoiceEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  提醒频率
                </label>
                <select
                  value={reminderFrequency}
                  onChange={(e) => setReminderFrequency(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">低频 (每天1次)</option>
                  <option value="medium">中频 (每天2-3次)</option>
                  <option value="high">高频 (每天4-5次)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 保存消息 */}
          {saveMessage && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              saveMessage.includes('失败') 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{saveMessage}</span>
            </div>
          )}

          {/* 说明信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">关于 DeepSeek AI</p>
                <p>启用后，AI教练将使用 DeepSeek 的大语言模型提供更智能、更个性化的健身指导和对话体验。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoachSettings;