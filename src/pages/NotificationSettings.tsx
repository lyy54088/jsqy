import React, { useState, useEffect } from 'react';
import { Bell, Clock, Volume2, VolumeX, Settings, Save, ArrowLeft, TestTube2 as TestTube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore, useNotificationSettings } from '../store';
import { notificationService } from '../lib/notification-service';
import { requestNotificationPermission } from '../utils/pwa';
import NotificationTest from '../components/NotificationTest';

const NotificationSettings: React.FC = () => {
  const navigate = useNavigate();
  const notificationSettings = useNotificationSettings();
  const updateNotificationSettings = useAppStore(state => state.updateNotificationSettings);
  
  const [settings, setSettings] = useState(notificationSettings);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isSaving, setIsSaving] = useState(false);
  const [showTest, setShowTest] = useState(false);

  useEffect(() => {
    // 检查通知权限状态
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // 请求通知权限
  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    setPermissionStatus(permission);
    
    if (permission === 'granted') {
      // 发送测试通知
      notificationService.sendNotification({
        type: 'daily_motivation' as any,
        title: '🎉 通知权限已开启！',
        body: '您现在可以接收健身提醒和激励消息了~'
      });
    }
  };

  // 更新设置
  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 更新通知类型设置
  const handleTypeChange = (type: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: enabled
      }
    }));
  };

  // 更新静默时间
  const handleQuietHoursChange = (field: 'start' | 'end', value: string) => {
    setSettings(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value
      }
    }));
  };

  // 保存设置
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 更新应用状态
      updateNotificationSettings(settings);
      
      // 更新通知服务配置
      notificationService.saveConfig({
        enabled: settings.enabled,
        frequency: settings.frequency,
        quietHours: settings.quietHours,
        types: {
          check_in_reminder: settings.types.checkInReminder,
          contract_expiry: settings.types.contractExpiry,
          contract_completed: settings.types.contractExpiry,
          contract_expired: settings.types.contractExpiry,
          contract_violation: settings.types.contractExpiry,
          daily_complete: settings.types.checkInReminder,
          ai_coach_message: settings.types.aiCoachMessage,
          daily_motivation: settings.types.dailyMotivation,
          meal_reminder: settings.types.mealReminder,
          gym_reminder: settings.types.gymReminder,
          protein_reminder: settings.types.proteinReminder,
          test: true,
          checkin_success: settings.types.checkInReminder,
          checkin_reminder: settings.types.checkInReminder
        }
      });
      
      // 显示成功消息
      alert('设置已保存！');
    } catch (error) {
      console.error('保存设置失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 发送测试通知
  const handleTestNotification = () => {
    notificationService.sendNotification({
      type: 'daily_motivation' as any,
      title: '🧪 测试通知',
      body: '这是一条测试通知，如果您看到了这条消息，说明通知功能正常工作！'
    });
  };

  const frequencyOptions = [
    { value: 'low', label: '低频率', desc: '仅重要提醒' },
    { value: 'medium', label: '中频率', desc: '日常提醒' },
    { value: 'high', label: '高频率', desc: '所有提醒' }
  ];

  const notificationTypes = [
    { key: 'checkInReminder', label: '基础打卡提醒', desc: '提醒您按时打卡', icon: '📸' },
    { key: 'checkinReminder', label: '打卡时间提醒', desc: '用餐时间即将结束时的提醒', icon: '⏰' },
    { key: 'contractExpiry', label: '契约到期', desc: '契约即将到期提醒', icon: '📋' },
    { key: 'aiCoachMessage', label: 'AI教练消息', desc: 'AI教练的建议和鼓励', icon: '🤖' },
    { key: 'dailyMotivation', label: '每日激励', desc: '每天的正能量消息', icon: '✨' },
    { key: 'mealReminder', label: '用餐提醒', desc: '早餐6点、午餐11点、晚餐4点提醒', icon: '🍽️' },
    { key: 'gymReminder', label: '健身提醒', desc: '健身时间到了', icon: '💪' },
    { key: 'proteinReminder', label: '蛋白质提醒', desc: '补充蛋白质提醒', icon: '🥛' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="w-6 h-6" />
            通知设置
          </h1>
          <div className="w-16" /> {/* 占位符保持居中 */}
        </div>

        <div className="space-y-6">
          {/* 通知权限状态 */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              通知权限
            </h2>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700">
                  当前状态: 
                  <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                    permissionStatus === 'granted' 
                      ? 'bg-green-100 text-green-800' 
                      : permissionStatus === 'denied'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {permissionStatus === 'granted' ? '已授权' : 
                     permissionStatus === 'denied' ? '已拒绝' : '未设置'}
                  </span>
                </p>
                {permissionStatus !== 'granted' && (
                  <p className="text-sm text-gray-500 mt-1">
                    需要授权才能接收通知提醒
                  </p>
                )}
              </div>
              
              {permissionStatus !== 'granted' && (
                <button
                  onClick={handleRequestPermission}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  请求权限
                </button>
              )}
              
              {permissionStatus === 'granted' && (
                <button
                  onClick={handleTestNotification}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  测试通知
                </button>
              )}
            </div>
          </div>

          {/* 基础设置 */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">基础设置</h2>
            
            {/* 启用通知 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-medium text-gray-800">启用通知</h3>
                <p className="text-sm text-gray-500">开启或关闭所有通知</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* 通知频率 */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-3">通知频率</h3>
              <div className="grid grid-cols-1 gap-3">
                {frequencyOptions.map((option) => (
                  <label key={option.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="frequency"
                      value={option.value}
                      checked={settings.frequency === option.value}
                      onChange={(e) => handleSettingChange('frequency', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-800">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 静默时间 */}
            <div>
              <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                静默时间
              </h3>
              <p className="text-sm text-gray-500 mb-3">在此时间段内不会发送通知</p>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">开始时间</label>
                  <input
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">结束时间</label>
                  <input
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 通知类型 */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">通知类型</h2>
            <div className="space-y-4">
              {notificationTypes.map((type) => (
                <div key={type.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-800">{type.label}</h3>
                      <p className="text-sm text-gray-500">{type.desc}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.types[type.key as keyof typeof settings.types]}
                      onChange={(e) => handleTypeChange(type.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 保存按钮 */}
          <div className="flex justify-center">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  保存设置
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* 通知测试区域 */}
      <div className="space-y-4">
        <button
          onClick={() => setShowTest(!showTest)}
          className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <TestTube className="w-4 h-4" />
          <span>{showTest ? '隐藏' : '显示'}通知测试</span>
        </button>
        
        {showTest && (
          <NotificationTest onClose={() => setShowTest(false)} />
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;