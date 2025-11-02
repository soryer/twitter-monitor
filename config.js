require('dotenv').config();

// 检查代理配置是否包含示例值
const checkProxyConfig = (proxyUrl) => {
  if (!proxyUrl) return null;
  
  const invalidPatterns = ['username:password', 'proxy-ip', 'ip:1337', 'ip:'];
  for (const pattern of invalidPatterns) {
    if (proxyUrl.includes(pattern)) {
      console.warn('\n⚠️  警告: 检测到代理配置使用了示例值！');
      console.warn('   如果不需要代理，请在 .env 中注释掉或删除 HTTP_PROXY 和 HTTPS_PROXY');
      console.warn('   如果需要代理，请替换为实际的代理地址\n');
      return null;
    }
  }
  return proxyUrl;
};

module.exports = {
  twitter: {
    bearerToken: process.env.TWITTER_BEARER_TOKEN,
    // 支持单个用户或多个用户（逗号分隔）
    usernames: process.env.TWITTER_USERNAME 
      ? process.env.TWITTER_USERNAME.split(',').map(u => u.trim())
      : ['cz_binance'],
    apiBaseUrl: 'https://api.x.com/2'
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID
  },
  proxy: {
    http: checkProxyConfig(process.env.HTTP_PROXY),
    https: checkProxyConfig(process.env.HTTPS_PROXY)
  },
  monitor: {
    checkInterval: parseInt(process.env.CHECK_INTERVAL) || 60000 // 默认60秒检查一次
  }
};
