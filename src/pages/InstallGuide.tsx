import React, { useState, useEffect } from 'react';
import { ArrowLeft, Smartphone, Monitor, Download, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InstallGuide: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA 已安装');
      alert('应用安装成功！');
      setDeferredPrompt(null);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('用户接受了安装');
      } else {
        console.log('用户拒绝了安装');
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else {
      alert('请按照上方步骤手动添加应用到主屏幕。');
    }
  };

  const features = [
    {
      icon: '🚀',
      title: '快速启动',
      description: '像原生应用一样快速打开'
    },
    {
      icon: '📶',
      title: '离线使用',
      description: '部分功能可在无网络时使用'
    },
    {
      icon: '🔔',
      title: '推送通知',
      description: '及时接收健身提醒'
    },
    {
      icon: '💾',
      title: '自动更新',
      description: '应用会自动更新到最新版本'
    }
  ];

  const androidSteps = [
    {
      title: '打开 Chrome 浏览器',
      description: '在手机上使用 Chrome 浏览器访问健身教练应用'
    },
    {
      title: '查找安装提示',
      description: '页面底部会出现"安装健身教练应用"的提示框，或者点击浏览器菜单中的"添加到主屏幕"'
    },
    {
      title: '确认安装',
      description: '点击"安装应用"或"添加"按钮，应用图标将出现在手机桌面'
    }
  ];

  const iosSteps = [
    {
      title: '打开 Safari 浏览器',
      description: '在 iPhone 上使用 Safari 浏览器访问健身教练应用'
    },
    {
      title: '点击分享按钮',
      description: '点击底部工具栏中的分享按钮（方框带向上箭头的图标）'
    },
    {
      title: '添加到主屏幕',
      description: '在分享菜单中找到"添加到主屏幕"选项，点击后确认添加'
    }
  ];

  const desktopSteps = [
    {
      title: '使用 Chrome 或 Edge',
      description: '在电脑上使用 Chrome 或 Edge 浏览器访问健身教练应用'
    },
    {
      title: '查找安装图标',
      description: '地址栏右侧会出现安装图标（⊕ 或下载图标）'
    },
    {
      title: '完成安装',
      description: '点击安装图标，确认安装，应用将添加到桌面和开始菜单'
    }
  ];

  const getSteps = () => {
    switch (activeTab) {
      case 'android': return androidSteps;
      case 'ios': return iosSteps;
      case 'desktop': return desktopSteps;
      default: return androidSteps;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      {/* 头部 */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">安装健身教练应用</h1>
              <p className="text-white/80 text-sm">将应用添加到手机桌面，享受原生应用体验</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* 主要内容卡片 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            {/* 功能特点 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{feature.icon}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 平台选择标签 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 安装步骤</h3>
              <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                <button
                  onClick={() => setActiveTab('android')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                    activeTab === 'android'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  Android
                </button>
                <button
                  onClick={() => setActiveTab('ios')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                    activeTab === 'ios'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  iPhone
                </button>
                <button
                  onClick={() => setActiveTab('desktop')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                    activeTab === 'desktop'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  电脑端
                </button>
              </div>

              {/* 安装步骤 */}
              <div className="space-y-4">
                {getSteps().map((step, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                🚀 立即体验应用
              </button>
              {isInstallable && (
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  一键安装
                </button>
              )}
            </div>

            {/* 提示信息 */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-yellow-600 mt-0.5">
                  💡
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">小贴士</h4>
                  <p className="text-sm text-yellow-700">
                    如果没有看到安装提示，请确保使用的是支持 PWA 的浏览器（Chrome、Edge、Safari 等），并且网络连接正常。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallGuide;