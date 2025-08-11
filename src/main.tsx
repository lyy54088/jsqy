import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// 🚨 强制清理逻辑 - 彻底解决500元保证金问题
const initializeApp = () => {
  console.log('🔍 启动数据清理检查...');

  // 检查URL参数，如果有clean=true则强制清理
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('clean') === 'true') {
    console.log('🧹 检测到清理参数，强制清理所有数据...');
    localStorage.clear();
    sessionStorage.clear();
    // 移除URL参数并刷新
    window.history.replaceState({}, document.title, window.location.pathname);
    window.location.reload();
    return;
  }

  // 检查localStorage数据
  try {
    const storageData = localStorage.getItem('fitness-contract-storage');
    if (storageData) {
      console.log('📦 发现localStorage数据，正在检查...');
      const data = JSON.parse(storageData);
      const state = data.state;
      
      let needsClean = false;
      let reason = '';
      
      // 检查500元保证金
      if (state?.currentContract && 
          (state.currentContract.amount === 500 || state.currentContract.remainingAmount === 500)) {
        needsClean = true;
        reason = '发现500元保证金测试数据';
      }
      
      // 检查无用户但有契约
      if (!state?.user && state?.currentContract) {
        needsClean = true;
        reason = reason ? reason + '，且无用户但有契约' : '无用户但有契约数据';
      }
      
      if (needsClean) {
        console.warn(`🚨 ${reason}，立即清理！`);
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ 数据已清理，页面将刷新');
        // 添加清理参数避免无限循环
        window.location.href = window.location.pathname + '?cleaned=true';
        return;
      } else {
        console.log('✅ 数据检查通过');
      }
    } else {
      console.log('✅ 没有localStorage数据，这是正确的初始状态');
    }
  } catch (error) {
    console.error('❌ 检查数据时出错，清理所有数据:', error);
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = window.location.pathname + '?cleaned=true';
    return;
  }

  // 如果URL有cleaned参数，移除它
  if (urlParams.get('cleaned') === 'true') {
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // 初始化React应用
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

// 启动应用
initializeApp();
