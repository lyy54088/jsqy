import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle, XCircle, Clock, MapPin, Camera } from 'lucide-react';
import { useAppStore } from '@/store';

const History: React.FC = () => {
  const navigate = useNavigate();
  const { checkInHistory, contractHistory } = useAppStore();
  const [activeTab, setActiveTab] = useState<'checkins' | 'contracts'>('checkins');

  // 按日期分组打卡记录
  const groupedCheckIns = checkInHistory.reduce((groups, checkIn) => {
    // 安全检查，确保checkIn对象存在且有timestamp
    if (!checkIn || !checkIn.timestamp) {
      return groups;
    }
    
    // 确保timestamp是Date对象
    const timestamp = checkIn.timestamp instanceof Date 
      ? checkIn.timestamp 
      : new Date(checkIn.timestamp);
    
    const date = timestamp.toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(checkIn);
    return groups;
  }, {} as Record<string, typeof checkInHistory>);

  const sortedDates = Object.keys(groupedCheckIns).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const getCheckInTypeInfo = (type: string) => {
    const types = {
      breakfast: { icon: '🥐', label: '早餐', color: 'bg-orange-100 text-orange-700' },
      lunch: { icon: '🍱', label: '午餐', color: 'bg-green-100 text-green-700' },
      dinner: { icon: '🍽️', label: '晚餐', color: 'bg-blue-100 text-blue-700' },
      gym: { icon: '💪', label: '健身', color: 'bg-red-100 text-red-700' },
      protein: { icon: '🥛', label: '蛋白质', color: 'bg-purple-100 text-purple-700' }
    };
    return types[type as keyof typeof types] || { icon: '📝', label: type, color: 'bg-gray-100 text-gray-700' };
  };

  const getStatusInfo = (status: string) => {
    const statuses = {
      approved: { icon: CheckCircle, label: '已通过', color: 'text-green-600' },
      pending: { icon: Clock, label: '审核中', color: 'text-yellow-600' },
      rejected: { icon: XCircle, label: '已拒绝', color: 'text-red-600' }
    };
    return statuses[status as keyof typeof statuses] || { icon: Clock, label: status, color: 'text-gray-600' };
  };

  const getContractStatusInfo = (status: string) => {
    const statuses = {
      active: { label: '进行中', color: 'bg-blue-100 text-blue-700' },
      completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
      failed: { label: '已失败', color: 'bg-red-100 text-red-700' },
      cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-700' }
    };
    return statuses[status as keyof typeof statuses] || { label: status, color: 'bg-gray-100 text-gray-700' };
  };

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
            <h1 className="text-xl font-bold text-gray-900">历史记录</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* 标签切换 */}
        <div className="bg-white rounded-xl p-1 mb-6 border border-gray-200">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveTab('checkins')}
              className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'checkins'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              打卡记录
            </button>
            <button
              onClick={() => setActiveTab('contracts')}
              className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'contracts'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              契约历史
            </button>
          </div>
        </div>

        {/* 打卡记录 */}
        {activeTab === 'checkins' && (
          <div className="space-y-6">
            {checkInHistory.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无打卡记录</h3>
                <p className="text-gray-600 mb-4">开始你的第一次打卡吧！</p>
                <button 
                  onClick={() => navigate('/checkin')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  立即打卡
                </button>
              </div>
            ) : (
              sortedDates.map(date => {
                const dateObj = new Date(date);
                const checkIns = groupedCheckIns[date];
                const completedCount = checkIns.filter(c => c.status === 'approved').length;
                
                return (
                  <div key={date} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-gray-600" />
                          <span className="font-semibold text-gray-900">
                            {dateObj.toLocaleDateString('zh-CN', { 
                              month: 'long', 
                              day: 'numeric',
                              weekday: 'long'
                            })}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {completedCount}/{checkIns.length} 完成
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      {checkIns.map(checkIn => {
                        // 安全检查，确保checkIn对象存在且有必要的属性
                        if (!checkIn || !checkIn.type || !checkIn.status) {
                          return null;
                        }
                        
                        const typeInfo = getCheckInTypeInfo(checkIn.type);
                        const statusInfo = getStatusInfo(checkIn.status);
                        const StatusIcon = statusInfo.icon;
                        
                        return (
                          <div key={checkIn.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${typeInfo.color}`}>
                              {typeInfo.icon}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-gray-900">{typeInfo.label}</h4>
                                <div className={`flex items-center gap-1 ${statusInfo.color}`}>
                                  <StatusIcon className="w-4 h-4" />
                                  <span className="text-sm font-medium">{statusInfo.label}</span>
                                </div>
                              </div>
                              
                              {/* AI识别结果显示 */}
                              {checkIn.aiResult && (
                                <div className="mb-2">
                                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                    checkIn.aiResult.recognized 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {checkIn.aiResult.recognized ? '🤖 AI识别' : '📝 手动记录'}
                                    {checkIn.aiResult.recognized && (
                                      <span className="ml-1">
                                        {Math.round(checkIn.aiResult.confidence * 100)}%
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {checkIn.aiResult.description}
                                  </p>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {(checkIn.timestamp instanceof Date 
                                      ? checkIn.timestamp 
                                      : new Date(checkIn.timestamp)
                                    ).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                
                                {checkIn.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{checkIn.location.address}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 契约历史 */}
        {activeTab === 'contracts' && (
          <div className="space-y-4">
            {contractHistory.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无契约记录</h3>
                <p className="text-gray-600 mb-4">创建你的第一个健身契约！</p>
                <button 
                  onClick={() => navigate('/contract/create')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  创建契约
                </button>
              </div>
            ) : (
              contractHistory.map(contract => {
                const statusInfo = getContractStatusInfo(contract.status);
                const startDate = contract.startDate instanceof Date ? contract.startDate : new Date(contract.startDate);
                const endDate = contract.endDate instanceof Date ? contract.endDate : new Date(contract.endDate);
                const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                const completionRate = totalDays > 0 ? (contract.completedDays / totalDays) * 100 : 0;
                
                return (
                  <div key={contract.id} className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">
                        {contract.type === 'normal' ? '普通契约' : 
                         contract.type === 'brave' ? '勇者契约' : '自定义契约'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">保证金</p>
                        <p className="text-lg font-bold text-gray-900">¥{contract.amount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">完成率</p>
                        <p className="text-lg font-bold text-gray-900">{Math.round(completionRate)}%</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">进度</span>
                        <span className="text-gray-600">{contract.completedDays}/{totalDays} 天</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>开始时间: {(contract.startDate instanceof Date 
                        ? contract.startDate 
                        : new Date(contract.startDate)
                      ).toLocaleDateString('zh-CN')}</p>
                      <p>结束时间: {(contract.endDate instanceof Date 
                        ? contract.endDate 
                        : new Date(contract.endDate)
                      ).toLocaleDateString('zh-CN')}</p>
                      {contract.violationDays > 0 && (
                        <div className="text-red-600 space-y-1">
                          <p>违约天数: {contract.violationDays} 天</p>
                          {contract.accumulatedPenalty > 0 && (
                            <p>累计扣除: ¥{contract.accumulatedPenalty}</p>
                          )}
                          {contract.remainderAmount > 0 && contract.status === 'completed' && (
                            <p className="text-green-600">余额返还: ¥{contract.remainderAmount}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;