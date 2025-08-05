import React, { useState, useEffect } from 'react';
import { useDeepSeekApiKey, useDeepSeekEnabled, useAICoach, useUser } from '@/store';

const DeepSeekDebug: React.FC = () => {
  const deepSeekApiKey = useDeepSeekApiKey();
  const deepSeekEnabled = useDeepSeekEnabled();
  const aiCoach = useAICoach();
  const user = useUser();
  const [coachName, setCoachName] = useState('小美教练');

  // 加载保存的教练名字
  useEffect(() => {
    const savedCoachName = localStorage.getItem('coachName');
    if (savedCoachName) {
      setCoachName(savedCoachName);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">DeepSeek 配置调试</h1>
        
        <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">基本配置</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>DeepSeek 启用状态:</span>
                <span className={deepSeekEnabled ? 'text-green-600' : 'text-red-600'}>
                  {deepSeekEnabled ? '已启用' : '未启用'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>API Key 状态:</span>
                <span className={deepSeekApiKey ? 'text-green-600' : 'text-red-600'}>
                  {deepSeekApiKey ? '已配置' : '未配置'}
                </span>
              </div>
              {deepSeekApiKey && (
                <div className="flex justify-between">
                  <span>API Key 预览:</span>
                  <span className="font-mono text-xs">
                    {deepSeekApiKey.substring(0, 8)}...{deepSeekApiKey.substring(deepSeekApiKey.length - 4)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">AI 教练配置</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>AI 教练状态:</span>
                <span className={aiCoach ? 'text-green-600' : 'text-red-600'}>
                  {aiCoach ? '已设置' : '未设置'}
                </span>
              </div>
              {aiCoach && (
                <>
                  <div className="flex justify-between">
                    <span>教练名称:</span>
                    <span>{coachName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>教练性格:</span>
                    <span>{aiCoach.personality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>教练 API Key:</span>
                    <span className={aiCoach.config.deepSeekApiKey ? 'text-green-600' : 'text-red-600'}>
                      {aiCoach.config.deepSeekApiKey ? '已配置' : '未配置'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">用户信息</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>用户状态:</span>
                <span className={user ? 'text-green-600' : 'text-red-600'}>
                  {user ? '已登录' : '未登录'}
                </span>
              </div>
              {user && (
                <>
                  <div className="flex justify-between">
                    <span>用户昵称:</span>
                    <span>{user.nickname}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>健身目标:</span>
                    <span>{user.fitnessGoal === 'lose_weight' ? '减重' : '增肌'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">诊断结果</h3>
            <div className="p-4 rounded-lg bg-gray-50">
              {!deepSeekEnabled && (
                <p className="text-amber-600 mb-2">⚠️ DeepSeek 功能未启用</p>
              )}
              {!deepSeekApiKey && !aiCoach?.config.deepSeekApiKey && (
                <p className="text-red-600 mb-2">❌ 未配置 API Key</p>
              )}
              {!aiCoach && (
                <p className="text-red-600 mb-2">❌ 未设置 AI 教练</p>
              )}
              {!user && (
                <p className="text-red-600 mb-2">❌ 用户未登录</p>
              )}
              {deepSeekEnabled && (deepSeekApiKey || aiCoach?.config.deepSeekApiKey) && aiCoach && user && (
                <p className="text-green-600">✅ 所有配置正常，DeepSeek AI 应该可以正常工作</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepSeekDebug;