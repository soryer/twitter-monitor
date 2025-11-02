require('dotenv').config();

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
    http: process.env.HTTP_PROXY,
    https: process.env.HTTPS_PROXY
  },
  monitor: {
    checkInterval: parseInt(process.env.CHECK_INTERVAL) || 60000 // 默认60秒检查一次
  }
};
