import React, { useState, useEffect } from 'react';
import { ArrowLeft, Database, CheckCircle, XCircle, RefreshCw, BarChart3, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  connectToMockDatabase,
  checkMockDatabaseHealth,
  getMockDatabaseStats,
  initializeMockDatabase,
  createMockTestData,
  resetMockDatabase,
  getMockConnectionStatus,
  MOCK_DATABASE_CONFIG,
  DatabaseStats
} from '../lib/mock-database';

const DatabaseTest: React.FC = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('未连接');
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null);
  const [connectionTime, setConnectionTime] = useState<Date | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // 检查连接状态
  const checkConnectionStatus = () => {
    const status = getMockConnectionStatus();
    setIsConnected(status.isConnected);
    setConnectionTime(status.connectionTime);
    
    if (status.isConnected) {
      setConnectionStatus('已连接');
    } else {
      setConnectionStatus('未连接');
    }
  };

  // 测试数据库连接
  const testConnection = async () => {
    setIsLoading(true);
    setLogs([]);
    addLog('开始测试数据库连接...');
    
    try {
      const result = await connectToMockDatabase();
      
      if (result.success) {
        setIsConnected(true);
        setConnectionStatus('已连接');
        setConnectionTime(new Date());
        addLog(result.message);
        await loadStats();
      } else {
        setIsConnected(false);
        setConnectionStatus('连接失败');
        addLog(result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setIsConnected(false);
      setConnectionStatus('连接错误');
      addLog(`❌ 连接测试失败: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化数据库
  const initDatabase = async () => {
    if (!isConnected) {
      addLog('❌ 请先连接数据库');
      return;
    }

    setIsLoading(true);
    addLog('开始初始化数据库...');
    
    try {
      await initializeMockDatabase();
      addLog('✅ 数据库初始化完成');
      await loadStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '初始化失败';
      addLog(`❌ 数据库初始化失败: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 创建测试数据
  const createTestData = async () => {
    if (!isConnected) {
      addLog('❌ 请先连接数据库');
      return;
    }

    setIsLoading(true);
    addLog('开始创建测试数据...');
    
    try {
      await createMockTestData();
      await loadStats();
      addLog('✅ 测试数据创建完成');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建失败';
      addLog(`❌ 创建测试数据失败: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 重置数据库
  const resetDatabase = async () => {
    if (!isConnected) {
      addLog('❌ 请先连接数据库');
      return;
    }

    setIsLoading(true);
    addLog('开始重置数据库...');
    
    try {
      await resetMockDatabase();
      await loadStats();
      addLog('✅ 数据库重置完成');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '重置失败';
      addLog(`❌ 数据库重置失败: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 加载统计信息
  const loadStats = async () => {
    if (!isConnected) return;
    
    try {
      const dbStats = await getMockDatabaseStats();
      setStats(dbStats);
      addLog('📊 统计信息已更新');
    } catch (err) {
      addLog('❌ 获取统计信息失败');
    }
  };

  // 健康检查
  const performHealthCheck = async () => {
    if (!isConnected) {
      addLog('❌ 请先连接数据库');
      return;
    }

    addLog('🔍 执行健康检查...');
    try {
      const isHealthy = await checkMockDatabaseHealth();
      setLastHealthCheck(new Date());
      
      if (isHealthy) {
        addLog('✅ 数据库健康状态良好');
      } else {
        addLog('⚠️ 数据库健康状态异常');
      }
    } catch (err) {
      addLog('❌ 健康检查失败');
    }
  };

  useEffect(() => {
    // 页面加载时检查连接状态
    checkConnectionStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <Database className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">数据库测试</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>{connectionStatus}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span>{connectionStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* 数据库信息提示 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">模拟数据库演示</span>
          </div>
          <p className="text-yellow-700 mt-1">
            这是一个模拟的数据库连接演示。在实际应用中，MongoDB连接应该在后端服务器中实现。
          </p>
          <p className="text-sm text-yellow-600 mt-2">
            连接URI: {MOCK_DATABASE_CONFIG.uri}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 控制面板 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">控制面板</h2>
            
            <div className="space-y-3">
              <button
                onClick={testConnection}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Database className="w-4 h-4" />
                )}
                测试连接
              </button>

              <button
                onClick={initDatabase}
                disabled={isLoading || !isConnected}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                初始化数据库
              </button>

              <button
                onClick={createTestData}
                disabled={isLoading || !isConnected}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                创建测试数据
              </button>

              <button
                onClick={performHealthCheck}
                disabled={isLoading || !isConnected}
                className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                健康检查
              </button>

              <button
                onClick={resetDatabase}
                disabled={isLoading || !isConnected}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                重置数据库
              </button>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">数据库统计</h2>
            
            {stats ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">用户数量</span>
                  <span className="font-semibold text-blue-600">{stats.users}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">打卡记录</span>
                  <span className="font-semibold text-green-600">{stats.checkIns}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">契约数量</span>
                  <span className="font-semibold text-purple-600">{stats.contracts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">AI会话</span>
                  <span className="font-semibold text-orange-600">{stats.aiSessions}</span>
                </div>
                <div className="pt-2 border-t">
                  <span className="text-sm text-gray-500">
                    更新时间: {stats.timestamp.toLocaleString()}
                  </span>
                </div>
                {connectionTime && (
                  <div className="pt-2 border-t">
                    <span className="text-sm text-gray-500">
                      连接时间: {connectionTime.toLocaleString()}
                    </span>
                  </div>
                )}
                {lastHealthCheck && (
                  <div>
                    <span className="text-sm text-gray-500">
                      上次健康检查: {lastHealthCheck.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                {isConnected ? '点击"测试连接"获取统计信息' : '请先连接数据库'}
              </div>
            )}
          </div>
        </div>

        {/* 操作日志 */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">操作日志</h2>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            ) : (
              <div className="text-gray-500">暂无日志...</div>
            )}
          </div>
          
          {logs.length > 0 && (
            <button
              onClick={() => setLogs([])}
              className="mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              清空日志
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseTest;