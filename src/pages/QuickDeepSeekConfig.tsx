import React, { useEffect } from 'react';
import { useAppStore } from '../store';
import { useNavigate } from 'react-router-dom';

const QuickDeepSeekConfig: React.FC = () => {
  const { setDeepSeekConfig } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    // 自动配置 DeepSeek API Key
    const apiKey = 'sk-0834a814d7dd43049b8f2757f3f3554f';
    
    // 设置 DeepSeek 配置
    setDeepSeekConfig(apiKey, true);
    
    console.log('✅ DeepSeek API 配置完成');
    console.log('API Key:', apiKey);
    console.log('状态: 已启用');
    
    // 3秒后自动跳转到 AI 教练页面
    setTimeout(() => {
      navigate('/ai-coach');
    }, 3000);
  }, [setDeepSeekConfig, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            DeepSeek API 配置中
          </h1>
          <p className="text-gray-600">
            正在自动配置您的 DeepSeek AI 服务...
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">API Key</span>
            <span className="text-sm font-mono text-green-600">sk-083...554f</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">状态</span>
            <span className="text-sm text-green-600 font-medium">✅ 已启用</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <span>3秒后自动跳转到 AI 教练...</span>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => navigate('/ai-coach')}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            立即前往 AI 教练
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickDeepSeekConfig;