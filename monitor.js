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
    
    // API 使用统计
    this.apiStats = {
      totalCalls: 0,
      successCalls: 0,
      failedCalls: 0,
      rateLimitHits: 0,
      startTime: Date.now()
    };
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
      
      // 检查是否有缓存的用户信息
      const cacheFile = path.join(__dirname, 'user_cache.json');
      let useCache = false;
      
      if (fs.existsSync(cacheFile)) {
        try {
          const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
          const cacheAge = Date.now() - cache.timestamp;
          
          // 缓存24小时内有效
          if (cacheAge < 24 * 60 * 60 * 1000) {
            console.log(`\n   ℹ️  使用缓存的用户信息 (${Math.floor(cacheAge / 3600000)} 小时前)`);
            this.users = cache.users;
            useCache = true;
          }
        } catch (e) {
          console.log(`   ⚠️  缓存文件无效，将重新获取`);
        }
      }
      
      // 如果没有缓存或缓存过期，从 API 获取
      if (!useCache) {
        console.log(`\n   ⚠️  首次初始化可能需要 API 配额，如遇速率限制请等待 15 分钟`);
        
        for (let i = 0; i < this.usernames.length; i++) {
          const username = this.usernames[i];
          console.log(`\n   正在获取 @${username} 的信息...`);
          
          try {
            const user = await this.twitterApi.getUserByUsername(username);
            this.users.push({
              id: user.id,
              username: user.username,
              name: user.name
            });
            
            console.log(`   ✓ ${user.name} (@${user.username})`);
            console.log(`     ID: ${user.id}`);
            console.log(`     粉丝数: ${user.public_metrics?.followers_count || 'N/A'}`);
            
            // 如果不是最后一个用户，添加延迟避免速率限制
            if (i < this.usernames.length - 1) {
              console.log(`   ⏳ 等待 3 秒避免速率限制...`);
              await new Promise(resolve => setTimeout(resolve, 3000)); // 等待3秒
            }
          } catch (error) {
            if (error.response?.status === 429) {
              console.error(`\n   ✗ @${username}: API 速率限制已达上限`);
              console.error(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
              console.error(`   ❌ Twitter API 速率限制\n`);
              console.error(`   解决方案：`);
              console.error(`   1. 等待 15 分钟后重试`);
              console.error(`   2. 检查是否有其他程序使用相同的 Token`);
              console.error(`   3. 使用手动方式添加用户信息（见下方）\n`);
              console.error(`   手动添加用户信息：`);
              console.error(`   创建 user_cache.json 文件，格式如下：`);
              console.error(`   {`);
              console.error(`     "timestamp": ${Date.now()},`);
              console.error(`     "users": [`);
              console.error(`       {"id": "用户ID", "username": "用户名", "name": "显示名称"}`);
              console.error(`     ]`);
              console.error(`   }`);
              console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
              throw new Error('Twitter API 速率限制，请等待15分钟后重试，或手动创建用户缓存');
            }
            throw error;
          }
        }
        
        // 保存用户信息到缓存
        try {
          fs.writeFileSync(cacheFile, JSON.stringify({
            timestamp: Date.now(),
            users: this.users
          }, null, 2));
          console.log(`\n   ✓ 用户信息已缓存到 user_cache.json`);
        } catch (e) {
          console.warn(`   ⚠️  无法保存用户缓存: ${e.message}`);
        }
      }
      
      console.log(`\n✅ 所有用户信息获取成功！共 ${this.users.length} 个用户`);
      
      // 测试 Telegram 连接
      console.log(`\n🔗 测试 Telegram 连接...`);
      await this.telegram.testConnection();
      
      // 获取已保存的推文 ID
      const lastTweetIds = this.getLastTweetIds();
      
      // 为每个用户获取最新推文作为起点
      for (let i = 0; i < this.users.length; i++) {
        const user = this.users[i];
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
        
        // 如果不是最后一个用户，添加延迟
        if (i < this.users.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
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
   * 显示 API 使用统计
   */
  showApiStats() {
    const runtime = Math.floor((Date.now() - this.apiStats.startTime) / 60000); // 分钟
    const avgCallsPerHour = runtime > 0 ? Math.floor(this.apiStats.totalCalls / (runtime / 60)) : 0;
    
    console.log(`\n📊 API 使用统计:`);
    console.log(`   运行时长: ${runtime} 分钟`);
    console.log(`   总调用: ${this.apiStats.totalCalls} 次`);
    console.log(`   成功: ${this.apiStats.successCalls} | 失败: ${this.apiStats.failedCalls}`);
    console.log(`   速率限制: ${this.apiStats.rateLimitHits} 次`);
    console.log(`   平均: ${avgCallsPerHour} 次/小时`);
    
    // Twitter API Free Tier 限制提醒
    if (avgCallsPerHour > 12) {
      console.log(`   ⚠️  调用频率较高，建议增加检查间隔`);
    } else {
      console.log(`   ✅ 调用频率正常`);
    }
  }

  /**
   * 检查新推文（优化版）
   */
  async checkNewTweets() {
    try {
      const lastTweetIds = this.getLastTweetIds();
      const now = new Date().toLocaleTimeString('zh-CN');
      let hasNewTweets = false;
      let checkStartTime = Date.now();
      
      console.log(`\n[${now}] 🔍 开始检查 ${this.users.length} 个用户...`);
      
      // 检查每个用户的新推文
      for (let i = 0; i < this.users.length; i++) {
        const user = this.users[i];
        
        try {
          // 记录 API 调用
          this.apiStats.totalCalls++;
          
          // 只获取最新 5 条推文（减少数据传输）
          const tweets = await this.twitterApi.getUserTweets(user.id, 5);
          
          this.apiStats.successCalls++;
          
          if (!tweets.data || tweets.data.length === 0) {
            console.log(`   @${user.username}: 暂无推文`);
            // 如果不是最后一个用户，添加延迟
            if (i < this.users.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
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
              console.log(`   时间: ${new Date(tweet.created_at).toLocaleString('zh-CN')}`);
              console.log(`   内容: ${tweet.text.substring(0, 100)}${tweet.text.length > 100 ? '...' : ''}`);
              
              await this.telegram.sendTweetAlert(tweet, user);
              
              // 稍微延迟，避免发送太快
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // 更新该用户的最新推文 ID
            lastTweetIds[user.username] = tweets.data[0].id;
          } else {
            console.log(`   @${user.username}: 无新推文 (最新: ${tweets.data[0].id.substring(0, 8)}...)`);
          }
          
        } catch (error) {
          this.apiStats.failedCalls++;
          
          if (error.response?.status === 429) {
            this.apiStats.rateLimitHits++;
            console.error(`   ✗ @${user.username}: API 速率限制，跳过本次检查`);
            
            // 显示重置时间
            const resetTime = error.response.headers['x-rate-limit-reset'];
            if (resetTime) {
              const resetDate = new Date(resetTime * 1000);
              console.error(`   速率限制将在 ${resetDate.toLocaleTimeString('zh-CN')} 重置`);
            }
          } else {
            console.error(`   ✗ @${user.username}: ${error.message}`);
          }
        }
        
        // 如果不是最后一个用户，添加延迟避免速率限制
        if (i < this.users.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // 保存所有用户的推文 ID
      this.saveLastTweetIds(lastTweetIds);
      
      const checkDuration = ((Date.now() - checkStartTime) / 1000).toFixed(1);
      
      if (!hasNewTweets) {
        console.log(`\n✓ 检查完成 (耗时 ${checkDuration}s)，暂无新推文`);
      } else {
        console.log(`\n✅ 检查完成 (耗时 ${checkDuration}s)，已发送通知`);
      }
      
      // 每小时显示一次统计
      if (this.apiStats.totalCalls % 20 === 0) {
        this.showApiStats();
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
      console.log(`\n⏱️  检查间隔: ${this.checkInterval / 1000} 秒 (${this.checkInterval / 60000} 分钟)`);
      
      // 计算每小时 API 调用次数并给出建议
      const callsPerHour = Math.ceil(3600000 / this.checkInterval) * this.users.length;
      console.log(`\n📈 预计 API 使用:`);
      console.log(`   每小时: ~${callsPerHour} 次调用`);
      console.log(`   每天: ~${callsPerHour * 24} 次调用`);
      
      if (callsPerHour > 15) {
        console.log(`\n⚠️  注意: 调用频率较高，可能触发速率限制`);
        console.log(`   建议: 增加 CHECK_INTERVAL 或减少监控用户数`);
      } else if (callsPerHour <= 12) {
        console.log(`\n✅ API 使用频率合理，可以稳定运行`);
      }
      
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
      
      // 显示最终统计
      this.showApiStats();
    }
  }
}

module.exports = TwitterMonitor;
