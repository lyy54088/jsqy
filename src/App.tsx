import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useIsLoggedIn, useUser, useCurrentContract, useAppStore } from "@/store";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import ContractCreate from "@/pages/ContractCreate";
import Payment from "@/pages/Payment";
import AICoachSetup from "@/pages/AICoachSetup";
import AICoachSettings from "@/pages/AICoachSettings";
import CheckIn from "@/pages/CheckIn";
import AICoach from "@/pages/AICoach";
import History from "@/pages/History";
import Profile from "@/pages/Profile";
import FoodAnalysis from "@/pages/FoodAnalysis";
import Community from "@/pages/Community";
import NotificationSettings from "@/pages/NotificationSettings";
import WorkoutPlan from "@/pages/WorkoutPlan";
import WorkoutTutorial from "@/pages/WorkoutTutorial";


import PWAInstaller from './components/PWAInstaller';
import { registerServiceWorker, clearExpiredCache } from './utils/pwa';
import { DataCleaner } from './utils/data-cleaner';
import { notificationService } from './lib/notification-service';
import './utils/dev-tools'; // 引入开发工具

// 立即执行清理逻辑 - 在任何组件渲染之前
(() => {
  try {
    const storageData = localStorage.getItem('fitness-contract-storage');
    if (storageData) {
      const data = JSON.parse(storageData);
      const state = data.state;
      
      // 检查是否存在500元保证金但没有用户的情况
      if (state?.currentContract && 
          (state.currentContract.amount === 500 || state.currentContract.remainingAmount === 500) &&
          !state?.user) {
        console.warn('🚨 检测到500元保证金但没有用户，立即清理无效数据');
        localStorage.clear();
        sessionStorage.clear();
        // 强制刷新页面
        window.location.reload();
      }
      
      // 检查其他无效状态
      if (!state?.user && state?.currentContract) {
        console.warn('🚨 检测到没有用户但有契约数据，立即清理');
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
      }
    }
  } catch (error) {
    console.error('立即清理检查出错，清理所有数据:', error);
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  }
})();

// 路由保护组件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useIsLoggedIn();
  return isLoggedIn ? <>{children}</> : <Navigate to="/auth" replace />;
}

// 公开路由组件
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useIsLoggedIn();
  return !isLoggedIn ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

export default function App() {
  const user = useUser();
  const currentContract = useCurrentContract();
  const { resetAllData } = useAppStore();

  useEffect(() => {
    registerServiceWorker();
    clearExpiredCache();
    
    // 初始化通知服务
    notificationService.initialize();
    
    // 使用数据清理工具检查并清理无效数据
    const wasDataCleaned = DataCleaner.checkAndCleanInvalidData();
    if (wasDataCleaned) {
      // 如果清理了数据，刷新页面以确保状态重置
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }, []);

  // 全局状态一致性检查
  useEffect(() => {
    // 强制检查localStorage中的数据
    const checkAndCleanInvalidData = () => {
      try {
        const storageData = localStorage.getItem('fitness-contract-storage');
        if (storageData) {
          const data = JSON.parse(storageData);
          const state = data.state;
          
          // 检查是否有无效的契约数据（没有用户但有契约）
          if (!state?.user && state?.currentContract) {
            console.warn('检测到无效状态：没有用户但存在契约数据，正在清理...');
            resetAllData();
            return;
          }
          
          // 检查是否有孤立的契约数据（契约存在但用户不匹配）
          if (state?.user && state?.currentContract && 
              state.currentContract.userId !== state.user.id) {
            console.warn('检测到孤立的契约数据，正在清理...');
            resetAllData();
            return;
          }
        }
      } catch (error) {
        console.error('检查localStorage数据时出错:', error);
        resetAllData();
      }
    };
    
    // 立即执行检查
    checkAndCleanInvalidData();
    
    // 如果有契约但没有用户，清理数据
    if (!user && currentContract) {
      console.warn('应用启动时检测到无效状态：没有用户但存在契约数据，正在清理...');
      resetAllData();
    }
  }, [user, currentContract, resetAllData]);

  return (
    <Router>
      <PWAInstaller />
      <Routes>
        {/* 公开路由 */}
        <Route path="/auth" element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        } />
        
        {/* 受保护的路由 */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/contract/create" element={
          <ProtectedRoute>
            <ContractCreate />
          </ProtectedRoute>
        } />
        
        <Route path="/payment" element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } />
        
        <Route path="/setup" element={
          <ProtectedRoute>
            <AICoachSetup />
          </ProtectedRoute>
        } />
        
        <Route path="/ai-coach/setup" element={
          <ProtectedRoute>
            <AICoachSetup />
          </ProtectedRoute>
        } />
        
        <Route path="/ai-coach/settings" element={
          <ProtectedRoute>
            <AICoachSettings />
          </ProtectedRoute>
        } />
        
        <Route path="/checkin" element={
          <ProtectedRoute>
            <CheckIn />
          </ProtectedRoute>
        } />
        
        <Route path="/ai-coach" element={
          <ProtectedRoute>
            <AICoach />
          </ProtectedRoute>
        } />
        
        <Route path="/history" element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        

        
        <Route path="/food-analysis" element={
          <ProtectedRoute>
            <FoodAnalysis />
          </ProtectedRoute>
        } />
        
        <Route path="/community" element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        } />
        
        <Route path="/settings/notifications" element={
          <ProtectedRoute>
            <NotificationSettings />
          </ProtectedRoute>
        } />
        
        <Route path="/workout-plan" element={
          <ProtectedRoute>
            <WorkoutPlan />
          </ProtectedRoute>
        } />
        
        <Route path="/workout-tutorial" element={
          <ProtectedRoute>
            <WorkoutTutorial />
          </ProtectedRoute>
        } />
        

        

        
        {/* 默认路由重定向 */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        
        {/* 404页面 */}
        <Route path="*" element={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
              {/* 404图标 */}
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-white">404</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">页面未找到</h1>
                <p className="text-gray-600 mb-6">抱歉，您访问的页面不存在。请检查网址是否正确，或选择下方的导航选项。</p>
              </div>
              
              {/* 导航选项 */}
              <div className="space-y-4 mb-8">
                <button 
                  onClick={() => window.location.href = '/auth'}
                  className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  返回首页
                </button>
                
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full flex items-center justify-center gap-3 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  进入仪表板
                </button>
              </div>
              
              {/* 快捷链接 */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button 
                  onClick={() => window.location.href = '/ai-coach'}
                  className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  AI教练
                </button>
                
                <button 
                  onClick={() => window.location.href = '/checkin'}
                  className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  打卡
                </button>
                
                <button 
                  onClick={() => window.location.href = '/history'}
                  className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  历史
                </button>
                
                <button 
                  onClick={() => window.location.href = '/profile'}
                  className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  个人中心
                </button>
              </div>
              
              {/* 返回按钮 */}
              <button 
                onClick={() => window.history.back()}
                className="text-gray-500 hover:text-gray-700 transition-colors text-sm flex items-center justify-center gap-1 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                返回上一页
              </button>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}
