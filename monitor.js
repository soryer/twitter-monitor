const fs = require('fs');
const path = require('path');
const TwitterAPI = require('./twitterApi');
const TelegramNotifier = require('./telegramBot');
const config = require('./config');

class TwitterMonitor {
  constructor() {
    this.twitterApi = new TwitterAPI();
    this.telegram = new TelegramNotifier();
    this.lastTweetIdFile = path.join(__dirname, 'last_tweet_id.json');
    this.usernames = config.twitter.usernames; // 支持多个用户
    this.users = []; // 存储用户信息 [{id, username, name}]
    this.checkInterval = config.monitor.checkInterval;
    this.isRunning = false;
  }

  /**
   * 获取所有用户的上次检查推文 ID
   */
  getLastTweetIds() {
    try {
      if (fs.existsSync(this.lastTweetIdFile)) {
        const data = fs.readFileSync(this.lastTweetIdFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('读取上次推文 ID 失败:', error.message);
    }
    return {};
  }

  /**
   * 保存所有用户的最新推文 ID
   */
  saveLastTweetIds(lastTweetIds) {
    try {
      fs.writeFileSync(this.lastTweetIdFile, JSON.stringify(lastTweetIds, null, 2));
    } catch (error) {
      console.error('保存推文 ID 失败:', error.message);
    }
  }

  /**
   * 初始化监控
   */
  async initialize() {
    try {
      console.log(`\n🔍 正在获取用户信息...`);
      console.log(`   监控用户: ${this.usernames.join(', ')}`);
      
      // 获取所有用户信息
      for (const username of this.usernames) {
        console.log(`\n   正在获取 @${username} 的信息...`);
        const user = await this.twitterApi.getUserByUsername(username);
        this.users.push({
          id: user.id,
          username: user.username,
          name: user.name
        });
        
        console.log(`   ✓ ${user.name} (@${user.username})`);
        console.log(`     ID: ${user.id}`);
        console.log(`     粉丝数: ${user.public_metrics?.followers_count || 'N/A'}`);
      }
      
      console.log(`\n✅ 所有用户信息获取成功！共 ${this.users.length} 个用户`);
      
      // 测试 Telegram 连接
      console.log(`\n🔗 测试 Telegram 连接...`);
      await this.telegram.testConnection();
      
      // 获取已保存的推文 ID
      const lastTweetIds = this.getLastTweetIds();
      
      // 为每个用户获取最新推文作为起点
      for (const user of this.users) {
        const tweets = await this.twitterApi.getUserTweets(user.id, 1);
        if (tweets.data && tweets.data.length > 0) {
          const latestTweetId = tweets.data[0].id;
          
          if (!lastTweetIds[user.username]) {
            lastTweetIds[user.username] = latestTweetId;
            console.log(`\n📌 @${user.username} 初始化，最新推文 ID: ${latestTweetId}`);
          } else {
            console.log(`\n📌 @${user.username} 上次检查的推文 ID: ${lastTweetIds[user.username]}`);
          }
        }
      }
      
      // 保存推文 ID
      this.saveLastTweetIds(lastTweetIds);
      
      return true;
    } catch (error) {
      console.error('\n❌ 初始化失败:', error.message);
      throw error;
    }
  }

  /**
   * 检查新推文
   */
  async checkNewTweets() {
    try {
      const lastTweetIds = this.getLastTweetIds();
      const now = new Date().toLocaleTimeString('zh-CN');
      let hasNewTweets = false;
      
      // 检查每个用户的新推文
      for (const user of this.users) {
        const tweets = await this.twitterApi.getUserTweets(user.id, 10);
        
        if (!tweets.data || tweets.data.length === 0) {
          continue;
        }

        const lastTweetId = lastTweetIds[user.username];

        // 过滤出新推文
        const newTweets = lastTweetId 
          ? tweets.data.filter(tweet => tweet.id > lastTweetId)
          : [];

        if (newTweets.length > 0) {
          hasNewTweets = true;
          console.log(`\n🆕 @${user.username} 发现 ${newTweets.length} 条新推文！`);
          
          // 按时间顺序发送通知（从旧到新）
          newTweets.reverse();
          
          for (const tweet of newTweets) {
            console.log(`\n📨 推文 ID: ${tweet.id}`);
            console.log(`   用户: @${user.username}`);
            console.log(`   内容: ${tweet.text.substring(0, 100)}${tweet.text.length > 100 ? '...' : ''}`);
            
            await this.telegram.sendTweetAlert(tweet, user);
            
            // 稍微延迟，避免发送太快
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          // 更新该用户的最新推文 ID
          lastTweetIds[user.username] = tweets.data[0].id;
        }
      }
      
      // 保存所有用户的推文 ID
      this.saveLastTweetIds(lastTweetIds);
      
      if (!hasNewTweets) {
        console.log(`[${now}] ✓ 已检查所有用户，暂无新推文`);
      }
    } catch (error) {
      console.error('检查推文时出错:', error.message);
    }
  }

  /**
   * 启动监控
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  监控已在运行中');
      return;
    }

    try {
      await this.initialize();
      this.isRunning = true;
      
      console.log(`\n🚀 开始监控 ${this.users.length} 个用户:`);
      this.users.forEach(user => {
        console.log(`   • @${user.username} (${user.name})`);
      });
      console.log(`\n⏱️  检查间隔: ${this.checkInterval / 1000} 秒`);
      console.log(`\n按 Ctrl+C 停止监控\n`);
      
      // 立即检查一次
      await this.checkNewTweets();
      
      // 定时检查
      this.intervalId = setInterval(async () => {
        await this.checkNewTweets();
      }, this.checkInterval);
      
    } catch (error) {
      console.error('启动监控失败:', error.message);
      this.isRunning = false;
      process.exit(1);
    }
  }

  /**
   * 停止监控
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.isRunning = false;
      console.log('\n\n🛑 监控已停止');
    }
  }
}

module.exports = TwitterMonitor;
