#!/usr/bin/env node
/**
 * 配置建议工具
 * 根据监控用户数量，给出最优的检查间隔建议
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Twitter API Free Tier 限制
const API_LIMITS = {
  tweetsPerMonth: 10000,    // 每月 10,000 条推文
  userLookupsPerMonth: 500  // 每月 500 次用户查询
};

function calculateOptimalInterval(userCount) {
  // 保守估计：确保不超过限制的 80%
  const safetyMargin = 0.8;
  const daysPerMonth = 30;
  const hoursPerDay = 24;
  const minutesPerHour = 60;
  const secondsPerMinute = 60;
  
  // 每月可用的推文查询次数
  const availableCallsPerMonth = API_LIMITS.tweetsPerMonth * safetyMargin;
  
  // 每天可用次数
  const callsPerDay = availableCallsPerMonth / daysPerMonth;
  
  // 每小时可用次数
  const callsPerHour = callsPerDay / hoursPerDay;
  
  // 每个用户每小时的检查次数
  const checksPerUserPerHour = callsPerHour / userCount;
  
  // 检查间隔（秒）
  const intervalSeconds = (minutesPerHour * secondsPerMinute) / checksPerUserPerHour;
  
  // 转换为毫秒
  const intervalMs = intervalSeconds * 1000;
  
  return {
    intervalMs: Math.ceil(intervalMs),
    intervalMinutes: Math.ceil(intervalSeconds / 60),
    checksPerHour: Math.floor(checksPerUserPerHour),
    callsPerHour: Math.floor(callsPerHour),
    callsPerDay: Math.floor(callsPerDay),
    callsPerMonth: Math.floor(availableCallsPerMonth)
  };
}

function getRecommendations(userCount) {
  const configs = [
    { interval: 120000, label: '2分钟（激进）' },
    { interval: 180000, label: '3分钟（推荐）' },
    { interval: 300000, label: '5分钟（安全）' },
    { interval: 600000, label: '10分钟（保守）' },
    { interval: 900000, label: '15分钟（极保守）' }
  ];
  
  return configs.map(config => {
    const checksPerHour = Math.floor(3600000 / config.interval);
    const callsPerHour = checksPerHour * userCount;
    const callsPerDay = callsPerHour * 24;
    const callsPerMonth = callsPerDay * 30;
    
    const withinLimit = callsPerMonth <= API_LIMITS.tweetsPerMonth * 0.8;
    
    return {
      ...config,
      checksPerHour,
      callsPerHour,
      callsPerDay,
      callsPerMonth,
      withinLimit,
      percentUsed: Math.round((callsPerMonth / API_LIMITS.tweetsPerMonth) * 100)
    };
  });
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   Twitter 监控配置建议工具');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('   Twitter API Free Tier 限制:');
  console.log(`   • 每月推文查询: ${API_LIMITS.tweetsPerMonth.toLocaleString()} 次`);
  console.log(`   • 每月用户查询: ${API_LIMITS.userLookupsPerMonth} 次\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const userCountStr = await question('请输入要监控的用户数量: ');
  const userCount = parseInt(userCountStr);
  
  if (isNaN(userCount) || userCount < 1) {
    console.log('\n❌ 无效的用户数量\n');
    rl.close();
    return;
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   监控 ${userCount} 个用户的配置建议`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const optimal = calculateOptimalInterval(userCount);
  
  console.log('🎯 最优配置:');
  console.log(`   CHECK_INTERVAL=${optimal.intervalMs}`);
  console.log(`   (约 ${optimal.intervalMinutes} 分钟)\n`);
  console.log('   预计使用:');
  console.log(`   • 每小时检查: ${optimal.checksPerHour} 次/用户`);
  console.log(`   • API 调用: ${optimal.callsPerHour} 次/小时`);
  console.log(`   • API 调用: ${optimal.callsPerDay} 次/天`);
  console.log(`   • API 调用: ${optimal.callsPerMonth} 次/月 (${Math.round(optimal.callsPerMonth / API_LIMITS.tweetsPerMonth * 100)}% 配额)\n`);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   其他可选配置\n');
  
  const recommendations = getRecommendations(userCount);
  
  recommendations.forEach(rec => {
    const icon = rec.withinLimit ? '✅' : '⚠️';
    const status = rec.withinLimit ? '安全' : '超限';
    
    console.log(`${icon} ${rec.label}:`);
    console.log(`   CHECK_INTERVAL=${rec.interval}`);
    console.log(`   每小时: ${rec.callsPerHour} 次调用 | 每月: ${rec.callsPerMonth.toLocaleString()} 次 (${rec.percentUsed}%)`);
    console.log(`   状态: ${status}\n`);
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 建议:');
  console.log('   1. 使用 user_cache.json 避免重复查询用户信息');
  console.log('   2. 选择"推荐"或"安全"级别的间隔');
  console.log('   3. 监控 API 使用统计，必要时调整间隔');
  console.log('   4. 优先监控发推频率高的用户\n');
  
  const showEnv = await question('是否显示 .env 配置示例？(y/n): ');
  
  if (showEnv.toLowerCase() === 'y') {
    const recommended = recommendations.find(r => r.withinLimit && r.interval >= 180000) || recommendations[2];
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   .env 配置示例\n');
    console.log('TWITTER_BEARER_TOKEN=your_token_here');
    console.log(`TWITTER_USERNAME=user1,user2${userCount > 2 ? ',user3' : ''}${userCount > 3 ? ',...' : ''}`);
    console.log('TELEGRAM_BOT_TOKEN=your_bot_token_here');
    console.log('TELEGRAM_CHAT_ID=your_chat_id_here');
    console.log(`CHECK_INTERVAL=${recommended.interval}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
  
  rl.close();
}

main().catch(error => {
  console.error(`\n❌ 错误: ${error.message}\n`);
  rl.close();
  process.exit(1);
});
