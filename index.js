const TwitterMonitor = require('./monitor');

console.log('╔══════════════════════════════════════╗');
console.log('║   Twitter 监控系统 v1.0              ║');
console.log('║   Twitter Monitor & Telegram Alert   ║');
console.log('╚══════════════════════════════════════╝');

// 创建监控实例
const monitor = new TwitterMonitor();

// 处理优雅退出
process.on('SIGINT', () => {
  console.log('\n\n收到退出信号...');
  monitor.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n收到终止信号...');
  monitor.stop();
  process.exit(0);
});

// 处理未捕获的错误
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  monitor.stop();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
});

// 启动监控
monitor.start().catch(error => {
  console.error('启动失败:', error);
  process.exit(1);
});
