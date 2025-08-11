import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User, Scale, Ruler, Target, MessageSquare } from 'lucide-react';
import { useAppStore } from '../store';
import type { User as UserType } from '@/store';

// 微信图标组件
const WechatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 4.882-1.932 7.621-.55-.302-2.676-2.476-4.81-5.36-6.122C12.268 2.464 10.552 2.188 8.691 2.188z"/>
    <path d="M17.813 11.563c-1.583 0-3.07.481-4.262 1.336-1.25.896-1.942 2.087-1.942 3.328 0 2.414 2.04 4.375 4.554 4.375.31 0 .617-.02.917-.067a.67.67 0 0 1 .558.077l1.477.864c.043.025.09.04.14.04.127 0 .226-.1.226-.224 0-.056-.023-.11-.037-.165l-.303-1.148a.458.458 0 0 1 .165-.516c1.42-1.04 2.33-2.59 2.33-4.236 0-3.127-2.775-5.664-6.203-5.664z"/>
  </svg>
);

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, resetAllData } = useAppStore();
  const [step, setStep] = useState<'phone' | 'profile'>('phone');
  const [formData, setFormData] = useState({
    phone: '',
    verificationCode: '',
    nickname: '',
    age: '',
    height: '',
    weight: '',
    fitnessGoal: 'lose_weight' as 'lose_weight' | 'gain_muscle'
  });
  const [countdown, setCountdown] = useState(0);
  const [sentCode, setSentCode] = useState('');

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length === 11 && formData.verificationCode === sentCode && sentCode !== '') {
      setStep('profile');
    } else if (sentCode === '') {
      alert('请先发送验证码');
    } else {
      alert('验证码错误，请重新输入');
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.verificationCode) {
      alert('请输入验证码');
      return;
    }
    
    try {
      // 使用短信服务验证验证码
      const { smsService } = await import('../lib/sms-service');
      const result = smsService.verifyCode(formData.phone, formData.verificationCode);
      
      if (result.success) {
        setStep('profile');
      } else {
        alert(result.message);
      }
      
    } catch (error) {
      console.error('验证码验证失败:', error);
      alert('验证失败，请稍后重试');
    }
  };

  const handleSendCode = async () => {
    if (formData.phone.length !== 11) {
      alert('请输入正确的手机号码');
      return;
    }
    
    try {
      // 使用真实的短信服务
      const { smsService } = await import('../lib/sms-service');
      const result = await smsService.sendVerificationCode(formData.phone);
      
      if (result.success) {
        setSentCode(result.code || '');
        setCountdown(60);
        alert(result.message);
        
        // 在开发环境下显示验证码
        if (import.meta.env.DEV && result.code) {
          console.log(`🔐 开发模式验证码: ${result.code}`);
        }
        
      } else {
        alert(result.message);
      }
      
    } catch (error) {
      console.error('发送验证码失败:', error);
      alert('发送失败，请稍后重试');
    }
  };

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleWechatLogin = () => {
    // TODO: 集成真实的微信登录SDK
    // 这里应该调用微信开放平台的登录接口
    
    // 清理所有旧数据，确保新用户有干净的状态
    resetAllData();
    
    alert('微信登录功能暂未集成，请联系开发团队');
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 清理所有旧数据，确保新用户有干净的状态
    resetAllData();
    
    const user: UserType = {
      id: Date.now().toString(),
      phone: formData.phone,
      nickname: formData.nickname,
      age: parseInt(formData.age),
      height: parseInt(formData.height),
      weight: parseInt(formData.weight),
      fitnessGoal: formData.fitnessGoal,
      createdAt: new Date()
    };
    
    setUser(user);
    navigate('/dashboard');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">健身契约</h1>
          <p className="text-gray-600">用契约的力量，成就更好的自己</p>
        </div>

        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                手机号码
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入手机号码"
                  maxLength={11}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                验证码
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.verificationCode}
                    onChange={(e) => updateFormData('verificationCode', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入验证码"
                    maxLength={6}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0 || formData.phone.length !== 11}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}s` : '发送验证码'}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={formData.phone.length !== 11 || formData.verificationCode.length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              下一步
            </button>
            
            {/* 分隔线 */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或</span>
              </div>
            </div>
            
            {/* 微信登录按钮 */}
            <button
              type="button"
              onClick={handleWechatLogin}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <WechatIcon className="w-5 h-5" />
              微信登录
            </button>
            
            {/* 开发环境快速登录 */}
            {import.meta.env.DEV && (
              <button
                type="button"
                onClick={() => {
                  resetAllData();
                  const testUser: UserType = {
                    id: 'test-user-' + Date.now(),
                    phone: '13800138000',
                    nickname: '测试用户',
                    age: 25,
                    height: 170,
                    weight: 65,
                    fitnessGoal: 'lose_weight',
                    createdAt: new Date()
                  };
                  setUser(testUser);
                  navigate('/dashboard');
                }}
                className="w-full bg-purple-500 text-white py-3 rounded-lg font-medium hover:bg-purple-600 transition-colors"
              >
                🚀 快速登录 (开发模式)
              </button>
            )}
          </form>
        )}

        {step === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                昵称
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => updateFormData('nickname', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入昵称"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年龄
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateFormData('age', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="岁"
                  min="16"
                  max="80"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  身高
                </label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => updateFormData('height', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="cm"
                    min="140"
                    max="220"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                体重
              </label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => updateFormData('weight', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="kg"
                  min="30"
                  max="200"
                  step="0.1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                健身目标
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateFormData('fitnessGoal', 'lose_weight')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    formData.fitnessGoal === 'lose_weight'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Target className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">减脂塑形</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => updateFormData('fitnessGoal', 'gain_muscle')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    formData.fitnessGoal === 'gain_muscle'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Target className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">增肌强体</div>
                </button>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                上一步
              </button>
              
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                完成注册
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;