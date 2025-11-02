const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

class TelegramNotifier {
  constructor() {
    this.bot = new TelegramBot(config.telegram.botToken, { polling: false });
    this.chatId = config.telegram.chatId;
  }

  /**
   * 发送推文通知到 Telegram
   */
  async sendTweetAlert(tweet, user) {
    try {
      const tweetUrl = `https://twitter.com/${user.username}/status/${tweet.id}`;
      
      const message = `
🚨 *新推文提醒* 🚨

👤 *用户*: ${user.name} (@${user.username})
📅 *时间*: ${new Date(tweet.created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}

📝 *内容*:
${tweet.text}

🔗 *链接*: ${tweetUrl}

📊 *互动数据*:
❤️ 点赞: ${tweet.public_metrics?.like_count || 0}
🔄 转发: ${tweet.public_metrics?.retweet_count || 0}
💬 回复: ${tweet.public_metrics?.reply_count || 0}
`;

      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      });
      
      console.log(`✅ 已发送推文通知到 Telegram: ${tweet.id}`);
      return true;
    } catch (error) {
      console.error('发送 Telegram 消息失败:', error.message);
      throw error;
    }
  }

  /**
   * 发送普通消息
   */
  async sendMessage(message) {
    try {
      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown'
      });
      console.log('✅ 消息已发送到 Telegram');
      return true;
    } catch (error) {
      console.error('发送消息失败:', error.message);
      throw error;
    }
  }

  /**
   * 测试 Telegram 连接
   */
  async testConnection() {
    try {
      await this.sendMessage('🤖 Twitter 监控机器人已启动！');
      return true;
    } catch (error) {
      console.error('Telegram 连接测试失败:', error.message);
      return false;
    }
  }
}

module.exports = TelegramNotifier;
