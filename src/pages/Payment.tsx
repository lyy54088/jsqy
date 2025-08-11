import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Shield, CreditCard, Smartphone, QrCode, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store';
import type { Contract } from '@/store';

// 支付处理函数
async function processPayment(method: string): Promise<{ success: boolean; orderId?: string; qrCode?: string }> {
  // 模拟支付处理过程
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟支付成功
      resolve({
        success: true,
        orderId: `order_${Date.now()}`,
        qrCode: method === 'alipay' || method === 'wechat' ? `data:image/svg+xml;base64,${btoa('<svg>QR Code</svg>')}` : undefined
      });
    }, 2000);
  });
}

interface PaymentState {
  contractData: Omit<Contract, 'id'>;
  amount: number;
  contractType: string;
  duration: string;
}

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createContract, user } = useAppStore();
  
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat' | 'card'>('alipay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [qrCode, setQrCode] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  
  // 从路由状态获取契约数据
  const paymentData = location.state as PaymentState;
  
  useEffect(() => {
    // 如果没有支付数据，重定向到契约创建页面
    if (!paymentData) {
      navigate('/contract/create');
    }
  }, [paymentData, navigate]);

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && paymentStatus === 'processing' && qrCode) {
      // 倒计时结束，支付超时
      setPaymentStatus('failed');
      setIsProcessing(false);
    }
  }, [countdown, paymentStatus, qrCode]);

  if (!paymentData) {
    return null;
  }

  const { contractData, amount, contractType, duration } = paymentData;

  const paymentMethods = [
    {
      id: 'alipay' as const,
      name: '支付宝',
      icon: Smartphone,
      description: '使用支付宝扫码支付',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'wechat' as const,
      name: '微信支付',
      icon: QrCode,
      description: '使用微信扫码支付',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'card' as const,
      name: '银行卡',
      icon: CreditCard,
      description: '使用银行卡支付',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      // 如果选择微信支付，跳转到专门的微信支付页面
      if (paymentMethod === 'wechat') {
        const contractId = `contract_${Date.now()}`;
        const orderId = `order_${Date.now()}`;
        
        // 构建微信支付页面的URL参数
        const params = new URLSearchParams({
          contractId,
          orderId,
          amount: amount.toString(),
          contractType,
          duration,
          userId: user?.id || 'user_001',
          userName: user?.nickname || '健身用户',
          userPhone: user?.phone || '138****8888'
        });
        
        // 跳转到微信支付页面
        window.location.href = `/wechat-payment.html?${params.toString()}`;
        return;
      }
      
      // 调用支付接口（支付宝和银行卡）
      const result = await processPayment(paymentMethod);
      
      if (result.success) {
        setOrderId(result.orderId || '');
        
        // 如果是支付宝扫码支付，显示二维码
        if (result.qrCode && paymentMethod === 'alipay') {
          setQrCode(result.qrCode);
          setCountdown(300); // 5分钟倒计时
          
          // 模拟扫码支付确认
          setTimeout(() => {
            confirmPayment();
          }, 5000); // 5秒后自动确认支付（模拟用户扫码支付）
        } else {
          // 银行卡支付直接确认
          confirmPayment();
        }
      } else {
        setPaymentStatus('failed');
        setIsProcessing(false);
      }
      
    } catch {
      setPaymentStatus('failed');
      setIsProcessing(false);
    }
  };

  const confirmPayment = () => {
    setPaymentStatus('success');
    
    // 计算违约金机制字段
    const violationPenalty = Math.floor(contractData.amount / 3);
    const remainderAmount = contractData.amount % 3;
    
    // 创建契约并设置支付状态
    const finalContractData = {
      ...contractData,
      paymentStatus: 'paid' as const,
      paymentId: orderId || `pay_${Date.now()}`,
      paidAt: new Date(),
      status: 'active' as const,
      remainingAmount: contractData.amount,
      violationPenalty,
      accumulatedPenalty: 0,
      remainderAmount
    };
    
    createContract(finalContractData);
    
    // 延迟跳转到仪表板
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  const handleRetry = () => {
    setPaymentStatus('pending');
    setIsProcessing(false);
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">支付成功！</h1>
            <p className="text-gray-600 mb-6">
              您的健身契约已创建成功，保证金 ¥{amount} 已冻结。
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">契约类型</span>
                <span className="font-medium">{contractType}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">契约时长</span>
                <span className="font-medium">{duration}天</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">保证金</span>
                <span className="font-medium text-green-600">¥{amount}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-500">
              正在跳转到AI教练设置页面...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 二维码支付界面
  if (paymentStatus === 'processing' && qrCode) {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleRetry}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">扫码支付</h1>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                请使用{paymentMethod === 'alipay' ? '支付宝' : '微信'}扫码支付
              </h2>
              <p className="text-gray-600">
                支付金额：<span className="font-bold text-blue-600">¥{amount}</span>
              </p>
            </div>

            {/* 二维码 */}
            <div className="w-48 h-48 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="w-40 h-40 bg-white rounded border-2 border-gray-200 flex items-center justify-center">
                <QrCode className="w-32 h-32 text-gray-400" />
              </div>
            </div>

            {/* 倒计时 */}
            <div className="mb-6">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <p className="text-sm text-gray-500">请在倒计时结束前完成支付</p>
            </div>

            {/* 订单信息 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">订单号</span>
                <span className="font-mono text-sm">{orderId}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">契约类型</span>
                <span className="font-medium">{contractType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">保证金</span>
                <span className="font-bold text-blue-600">¥{amount}</span>
              </div>
            </div>

            {/* 支付状态提示 */}
            <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">等待支付确认...</span>
            </div>

            <div className="space-y-3">
              <button
                onClick={confirmPayment}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                我已完成支付
              </button>
              
              <button
                onClick={handleRetry}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                重新选择支付方式
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">支付失败</h1>
            <p className="text-gray-600 mb-6">
              {countdown === 0 && qrCode ? '支付超时，请重新发起支付' : '支付过程中出现问题，请重试或选择其他支付方式。'}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                重新支付
              </button>
              
              <button
                onClick={() => navigate('/contract/create')}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                返回契约创建
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/contract/create')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isProcessing}
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">支付保证金</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 订单信息 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">健身契约保证金</h2>
              <p className="text-sm text-gray-600">{contractType} · {duration}天</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">保证金金额</span>
              <span className="text-2xl font-bold text-blue-600">¥{amount}</span>
            </div>
            <p className="text-xs text-gray-500">
              保证金将在契约期间冻结，完成契约后全额返还
            </p>
          </div>
        </div>

        {/* 支付方式选择 */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">选择支付方式</h3>
          
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.id;
              
              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  disabled={isProcessing}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${method.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <h4 className="font-medium text-gray-900">{method.name}</h4>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                    
                    {isSelected && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 安全提示 */}
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">安全保障</h4>
              <p className="text-sm text-blue-700">
                您的支付信息受到银行级加密保护，保证金将安全托管，完成契约后自动返还。
              </p>
            </div>
          </div>
        </div>

        {/* 支付按钮 */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${
            isProcessing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              处理中...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              确认支付 ¥{amount}
            </>
          )}
        </button>
        
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          点击确认支付即表示您同意《健身契约服务协议》和《支付服务协议》
        </p>
      </div>
    </div>
  );
};

export default Payment;