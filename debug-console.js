// 在浏览器控制台运行这个脚本来调试localStorage状态

console.log('=== 健身教练应用调试脚本 ===');

// 1. 检查localStorage中的所有数据
console.log('1. 检查localStorage:');
const allKeys = Object.keys(localStorage);
console.log('localStorage keys:', allKeys);

for (let key of allKeys) {
  try {
    const value = localStorage.getItem(key);
    const parsed = JSON.parse(value);
    console.log(`${key}:`, parsed);
  } catch (e) {
    console.log(`${key} (raw):`, localStorage.getItem(key));
  }
}

// 2. 特别检查健身应用数据
const fitnessData = localStorage.getItem('fitness-contract-storage');
if (fitnessData) {
  console.log('2. 健身应用数据:');
  try {
    const parsed = JSON.parse(fitnessData);
    console.log('完整数据:', parsed);
    
    const state = parsed.state;
    console.log('状态数据:', state);
    
    if (state?.user) {
      console.log('用户信息:', state.user);
    } else {
      console.log('❌ 没有用户信息');
    }
    
    if (state?.currentContract) {
      console.log('契约信息:', state.currentContract);
      if (state.currentContract.amount === 500 || state.currentContract.remainingAmount === 500) {
        console.log('🚨 发现500元保证金！');
      }
    } else {
      console.log('✅ 没有契约信息');
    }
  } catch (e) {
    console.log('❌ 数据解析错误:', e);
  }
} else {
  console.log('2. ✅ 没有健身应用数据');
}

// 3. 提供清理函数
window.forceCleanFitnessData = function() {
  localStorage.removeItem('fitness-contract-storage');
  sessionStorage.clear();
  console.log('✅ 健身应用数据已清理');
  window.location.reload();
};

window.forceCleanAllData = function() {
  localStorage.clear();
  sessionStorage.clear();
  console.log('✅ 所有数据已清理');
  window.location.reload();
};

console.log('=== 调试完成 ===');
console.log('如需清理数据，请运行:');
console.log('- forceCleanFitnessData() // 只清理健身应用数据');
console.log('- forceCleanAllData() // 清理所有数据');