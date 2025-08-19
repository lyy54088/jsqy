import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Zap, Settings, DollarSign, Calendar, Target } from 'lucide-react';
import { useAppStore } from '@/store';
import type { Contract } from '@/store';

const ContractCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createContract, user } = useAppStore();
  const [selectedType, setSelectedType] = useState<'normal' | 'brave' | 'custom'>('normal');
  const [customAmount, setCustomAmount] = useState('');
  const [duration, setDuration] = useState('30');

  const contractTypes = [
    {
      type: 'normal' as const,
      name: '普通契约',
      icon: Shield,
      amount: 30,
      description: '适合初学者，温和的约束力',
      features: ['30天挑战', '每日5次打卡', '违约扣除¥10/次', 'AI温和提醒'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      type: 'brave' as const,
      name: '勇者契约',
      icon: Zap,
      amount: 90,
      description: '高强度约束，适合意志力较弱者',
      features: ['30天挑战', '每日5次打卡', '违约扣除¥30/次', 'AI严格监督', '好友监督'],
      color: 'from-red-500 to-red-600'
    },
    {
      type: 'custom' as const,
      name: '自定义契约',
      icon: Settings,
      amount: 0,
      description: '自由设置金额和规则',
      features: ['自定义天数', '自定义保证金', '违约扣除1/3保证金', '个性化监督'],
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const handleCreateContract = () => {
    if (!user) return;

    const amount = selectedType === 'custom' ? parseInt(customAmount) : contractTypes.find(t => t.type === selectedType)?.amount || 0;
    const days = parseInt(duration);
    
    const contract: Omit<Contract, 'id'> = {
      userId: user.id,
      type: selectedType,
      amount,
      startDate: new Date(),
      endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      status: 'pending', // 设置为pending状态，等待支付
      dailyTasks: ['breakfast', 'lunch', 'dinner', 'gym', 'protein'],
      completedDays: 0,
      violationDays: 0,
      remainingAmount: 0, // 支付前保证金为0
      paymentStatus: 'pending',
      fitnessMode: 'standard', // 添加健身模式字段
      // 新的违约金机制字段
      violationPenalty: Math.floor(amount / 3), // 每次违约扣除金额（保证金的1/3）
      accumulatedPenalty: 0, // 累计扣除的违约金
      remainderAmount: amount % 3 // 除不尽的余数，到期后返还
    };

    // 先创建契约（pending状态）
    createContract(contract);

    // 跳转到支付页面，传递契约数据
    navigate('/payment', {
      state: {
        contractData: contract,
        amount,
        contractType: contractTypes.find(t => t.type === selectedType)?.name || '自定义契约',
        duration
      }
    });
  };

  const selectedContract = contractTypes.find(t => t.type === selectedType);
  const finalAmount = selectedType === 'custom' ? parseInt(customAmount) || 0 : selectedContract?.amount || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">创建契约</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 契约类型选择 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">选择契约类型</h2>
          <div className="space-y-3">
            {contractTypes.map((contract) => {
              const Icon = contract.icon;
              const isSelected = selectedType === contract.type;
              
              return (
                <button
                  key={contract.type}
                  onClick={() => setSelectedType(contract.type)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${contract.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{contract.name}</h3>
                        {contract.type !== 'custom' && (
                          <span className="text-lg font-bold text-blue-600">¥{contract.amount}</span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{contract.description}</p>
                      
                      <div className="flex flex-wrap gap-1">
                        {contract.features.map((feature, index) => (
                          <span 
                            key={index}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 自定义设置 */}
        {selectedType === 'custom' && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">自定义设置</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  保证金金额
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入金额"
                    min="100"
                    max="9999"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">建议金额：100-9999元</p>
              </div>
            </div>
          </div>
        )}

        {/* 契约时长 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">契约时长</h3>
          
          <div className="radio-inputs">
            {['21', '30', '60'].map((days) => (
              <label key={days} className="radio-tile">
                <input
                  type="radio"
                  name="duration"
                  value={days}
                  checked={duration === days}
                  onChange={() => setDuration(days)}
                  className="radio-input"
                />
                <div className="radio-icon">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="radio-label">{days}天</div>
              </label>
            ))}
          </div>
        </div>

        {/* 契约预览 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="font-semibold mb-4">契约预览</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>契约类型：</span>
              <span className="font-medium">{selectedContract?.name}</span>
            </div>
            
            <div className="flex justify-between">
              <span>保证金：</span>
              <span className="font-medium text-xl">¥{finalAmount}</span>
            </div>
            
            <div className="flex justify-between">
              <span>契约时长：</span>
              <span className="font-medium">{duration}天</span>
            </div>
            
            <div className="flex justify-between">
              <span>每日任务：</span>
              <span className="font-medium">2次打卡</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white/20 rounded-lg">
            <p className="text-sm">
              <strong>违约规则：</strong>
              {selectedType === 'normal' && `每次违约扣除¥${Math.floor(contractTypes.find(t => t.type === 'normal')?.amount! / 3)}元（保证金的1/3）`}
              {selectedType === 'brave' && `每次违约扣除¥${Math.floor(contractTypes.find(t => t.type === 'brave')?.amount! / 3)}元（保证金的1/3）`}
              {selectedType === 'custom' && customAmount && `每次违约扣除¥${Math.floor(parseInt(customAmount) / 3)}元（保证金的1/3）`}
              {selectedType === 'custom' && !customAmount && '每次违约扣除保证金的1/3'}
            </p>
            {finalAmount > 0 && finalAmount % 3 !== 0 && (
              <p className="text-xs mt-1 opacity-90">
                除不尽的余数¥{finalAmount % 3}元将在契约完成后返还
              </p>
            )}
          </div>
        </div>

        {/* 创建按钮 */}
        <button
          onClick={handleCreateContract}
          disabled={selectedType === 'custom' && (!customAmount || parseInt(customAmount) < 100)}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Target className="w-5 h-5" />
          下一步：支付保证金
        </button>
        
        <p className="text-xs text-gray-500 text-center leading-relaxed">创建契约即表示您同意遵守契约条款。保证金将在契约期间被冻结，完成契约后全额返还。违约金40%将用于公益事业。</p>
      </div>
    </div>
  );
};

export default ContractCreate;