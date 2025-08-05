import React, { useState } from 'react';
import { useAppStore } from '../store';

const DeepSeekTest: React.FC = () => {
  const { setDeepSeekConfig, deepSeekApiKey, deepSeekEnabled } = useAppStore();
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const configureAPI = () => {
    const apiKey = 'sk-0834a814d7dd43049b8f2757f3f3554f';
    setDeepSeekConfig(apiKey, true);
    setTestResult('✅ DeepSeek API 配置完成！');
  };

  const testAPI = async () => {
    setIsLoading(true);
    setTestResult('正在测试 DeepSeek API 连接...');

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepSeekApiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: '你好，请简单回复一下测试连接'
            }
          ],
          max_tokens: 50
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ API 连接成功！\n回复: ${data.choices[0].message.content}`);
      } else {
        const errorData = await response.json();
        setTestResult(`❌ API 连接失败: ${response.status} - ${errorData.error?.message || '未知错误'}`);
      }
    } catch (error) {
      setTestResult(`❌ 网络错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            DeepSeek API 测试
          </h1>

          <div className="space-y-6">
            {/* 当前配置状态 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">当前配置状态</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>API Key:</span>
                  <span className="font-mono text-sm">
                    {deepSeekApiKey ? `${deepSeekApiKey.substring(0, 10)}...` : '未配置'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>状态:</span>
                  <span className={deepSeekEnabled ? 'text-green-600' : 'text-red-600'}>
                    {deepSeekEnabled ? '✅ 已启用' : '❌ 未启用'}
                  </span>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-3">
              <button
                onClick={configureAPI}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                配置 DeepSeek API
              </button>

              <button
                onClick={testAPI}
                disabled={!deepSeekEnabled || isLoading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? '测试中...' : '测试 API 连接'}
              </button>
            </div>

            {/* 测试结果 */}
            {testResult && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">测试结果</h3>
                <pre className="text-sm whitespace-pre-wrap text-gray-700">
                  {testResult}
                </pre>
              </div>
            )}

            {/* 说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">使用说明</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>1. 点击"配置 DeepSeek API"按钮设置您的 API Key</li>
                <li>2. 点击"测试 API 连接"验证连接是否正常</li>
                <li>3. 配置成功后即可在 AI 教练中使用 DeepSeek 功能</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepSeekTest;