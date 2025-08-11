import React, { useState, useEffect } from 'react';
import { Save, X, AlertCircle, CheckCircle, Loader2, MessageSquare } from 'lucide-react';
import { smsService } from '../lib/sms-service';

interface SMSSettingsProps {
  onClose?: () => void;
}

const SMSSettings: React.FC<SMSSettingsProps> = ({ onClose }) => {
  const [config, setConfig] = useState({
    provider: 'mock' as 'aliyun' | 'tencent' | 'huawei' | 'mock',
    accessKeyId: '',
    accessKeySecret: '',
    signName: '健身契约',
    templateCode: ''
  });

  const [testPhone, setTestPhone] = useState('');
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    // 加载当前配置
    const currentConfig = smsService.getConfig();
    setConfig({
      provider: currentConfig.provider,
      accessKeyId: currentConfig.accessKeyId || '',
      accessKeySecret: currentConfig.accessKeySecret || '',
      signName: currentConfig.signName || '健身契约',
      templateCode: currentConfig.templateCode || ''
    });
  }, []);

  const handleSave = () => {
    smsService.updateConfig(config);
    alert('短信配置已保存');
    onClose?.();
  };

  const handleTest = async () => {
    if (!testPhone || testPhone.length !== 11) {
      alert('请输入正确的手机号');
      return;
    }

    setIsTesting(true);
    setTestResult('');

    try {
      const result = await smsService.sendVerificationCode(testPhone);
      if (result.success) {
        setTestResult(`✅ 测试成功: ${result.message}`);
        if (result.code) {
          setTestResult(prev => prev + `\n🔐 验证码: ${result.code}`);
        }
      } else {
        setTestResult(`❌ 测试失败: ${result.message}`);
      }
    } catch (error) {
      setTestResult(`❌ 测试异常: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  const providerOptions = [
    { value: 'mock', label: '模拟服务（开发测试）' },
    { value: 'aliyun', label: '阿里云短信' },
    { value: 'tencent', label: '腾讯云短信' },
    { value: 'huawei', label: '华为云短信' }
  ];

  return (
    <div className="space-y-4">
          {/* 服务商选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              短信服务商
            </label>
            <select
              value={config.provider}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                provider: e.target.value as any 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {providerOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 签名配置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              短信签名
            </label>
            <input
              type="text"
              value={config.signName}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                signName: e.target.value 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="如：健身契约"
            />
          </div>

          {/* 模板配置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              模板代码/ID
            </label>
            <input
              type="text"
              value={config.templateCode}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                templateCode: e.target.value 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="如：SMS_123456789"
            />
          </div>

          {/* 非模拟服务的配置 */}
          {config.provider !== 'mock' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Key ID / Secret ID
                </label>
                <input
                  type="text"
                  value={config.accessKeyId}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    accessKeyId: e.target.value 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入访问密钥ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Key Secret / Secret Key
                </label>
                <input
                  type="password"
                  value={config.accessKeySecret}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    accessKeySecret: e.target.value 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入访问密钥"
                />
              </div>
            </>
          )}

          {/* 测试功能 */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-3">测试短信发送</h3>
            <div className="space-y-3">
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入测试手机号"
                maxLength={11}
              />
              
              <button
                onClick={handleTest}
                disabled={isTesting || !testPhone}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isTesting ? '发送中...' : '发送测试短信'}
              </button>

              {testResult && (
                <div className="p-3 bg-gray-100 rounded-md">
                  <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
                </div>
              )}
            </div>
          </div>

          {/* 配置说明 */}
          <div className="bg-blue-50 p-3 rounded-md">
            <h4 className="font-medium text-blue-800 mb-2">配置说明：</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 模拟服务：仅用于开发测试，不会真实发送短信</li>
              <li>• 阿里云：需要在阿里云申请短信服务并获取密钥</li>
              <li>• 腾讯云：需要在腾讯云申请短信服务并获取密钥</li>
              <li>• 华为云：需要在华为云申请短信服务并获取密钥</li>
              <li>• 所有服务商都需要申请短信模板并通过审核</li>
            </ul>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            保存配置
          </button>
          
          <button
            onClick={() => {
              // 重置为默认值
              setConfig({
                provider: 'mock',
                accessKeyId: '',
                accessKeySecret: '',
                signName: '健身契约',
                templateCode: ''
              });
              setTestPhone('');
              setTestResult('');
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            重置
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>)}
          </div>
        </div>
  );
};

export default SMSSettings;