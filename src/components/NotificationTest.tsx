import React, { useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { notificationService, NotificationType } from '@/lib/notification-service';

interface NotificationTestProps {
  onClose?: () => void;
}

const NotificationTest: React.FC<NotificationTestProps> = ({ onClose }) => {
  const [isPermissionGranted, setIsPermissionGranted] = useState(
    Notification.permission === 'granted'
  );
  const [testResults, setTestResults] = useState<string[]>([]);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setIsPermissionGranted(permission === 'granted');
      
      if (permission === 'granted') {
        addTestResult('✅ 通知权限已获取');
      } else {
        addTestResult('❌ 通知权限被拒绝');
      }
    } catch (error) {
      addTestResult('❌ 请求权限失败: ' + error);
    }
  };

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testNotifications = [
    {
      title: '测试通知',
      body: '这是一个测试通知，用于验证通知功能是否正常工作。',
      type: NotificationType.TEST
    },
    {
      title: '🎉 打卡成功！',
      body: '恭喜你完成了今天的健身打卡！',
      type: NotificationType.CHECKIN_SUCCESS
    },
    {
      title: '⏰ 打卡提醒',
      body: '别忘了完成今天的健身任务哦！',
      type: NotificationType.CHECKIN_REMINDER
    },
    {
      title: '🎊 契约完成！',
      body: '恭喜你成功完成了30天的健身契约！',
      type: NotificationType.CONTRACT_COMPLETED
    }
  ];

  const sendTestNotification = async (notification: typeof testNotifications[0]) => {
    try {
      await notificationService.sendNotification({
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: { test: true }
      });
      addTestResult(`✅ 发送通知: ${notification.title}`);
    } catch (error) {
      addTestResult(`❌ 发送失败: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">通知功能测试</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* 权限状态 */}
      <div className="mb-4 p-3 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">通知权限状态:</span>
          <div className="flex items-center gap-2">
            {isPermissionGranted ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">已授权</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">未授权</span>
              </>
            )}
          </div>
        </div>
        
        {!isPermissionGranted && (
          <button
            onClick={requestPermission}
            className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            请求通知权限
          </button>
        )}
      </div>

      {/* 测试按钮 */}
      {isPermissionGranted && (
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">测试不同类型的通知:</h4>
          {testNotifications.map((notification, index) => (
            <button
              key={index}
              onClick={() => sendTestNotification(notification)}
              className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">{notification.title}</div>
              <div className="text-sm text-gray-600">{notification.body}</div>
            </button>
          ))}
        </div>
      )}

      {/* 测试结果 */}
      {testResults.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">测试结果:</h4>
            <button
              onClick={clearResults}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              清除
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-xs text-gray-600 mb-1 font-mono">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-1">使用说明:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• 首先需要授权通知权限</li>
          <li>• 点击测试按钮发送不同类型的通知</li>
          <li>• 通知会在几秒后显示在系统通知栏</li>
          <li>• 如果没有收到通知，请检查浏览器和系统的通知设置</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationTest;