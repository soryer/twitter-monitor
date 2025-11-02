const axios = require('axios');
const config = require('./config');

class TwitterAPI {
  constructor() {
    this.baseUrl = config.twitter.apiBaseUrl;
    this.bearerToken = config.twitter.bearerToken;
    
    // 配置 axios 实例
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.bearerToken}`,
        'Content-Type': 'application/json'
      }
    });

    // 如果配置了代理，则使用代理
    if (config.proxy.http || config.proxy.https) {
      const proxyUrl = config.proxy.https || config.proxy.http;
      const url = new URL(proxyUrl);
      
      this.client.defaults.proxy = {
        protocol: url.protocol.replace(':', ''),
        host: url.hostname,
        port: parseInt(url.port) || 1337,
        auth: url.username && url.password ? {
          username: url.username,
          password: url.password
        } : undefined
      };
      
      console.log(`使用代理: ${url.hostname}:${url.port}`);
    }
  }

  /**
   * 根据用户名获取用户 ID
   */
  async getUserByUsername(username) {
    try {
      const response = await this.client.get(`/users/by/username/${username}`, {
        params: {
          'user.fields': 'id,name,username,description,created_at,public_metrics'
        }
      });
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 429) {
        const resetTime = error.response.headers['x-rate-limit-reset'];
        const waitSeconds = resetTime ? Math.ceil(resetTime - Date.now() / 1000) : 900;
        console.error('\n❌ Twitter API 速率限制已达上限 (429 Too Many Requests)');
        console.error(`   请等待 ${Math.ceil(waitSeconds / 60)} 分钟后重试`);
        console.error('   或检查是否有其他程序在使用相同的 API Token\n');
      }
      console.error('获取用户信息失败:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 获取用户的最新推文
   */
  async getUserTweets(userId, maxResults = 10) {
    try {
      const response = await this.client.get(`/users/${userId}/tweets`, {
        params: {
          'max_results': maxResults,
          'tweet.fields': 'id,text,created_at,author_id,public_metrics',
          'expansions': 'author_id',
          'user.fields': 'username,name'
        }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        const resetTime = error.response.headers['x-rate-limit-reset'];
        const waitSeconds = resetTime ? Math.ceil(resetTime - Date.now() / 1000) : 900;
        console.warn(`\n⚠️  API 速率限制，${Math.ceil(waitSeconds / 60)} 分钟后恢复`);
      }
      // 速率限制时不抛出错误，避免程序崩溃
      if (error.response?.status === 429) {
        return { data: [] }; // 返回空数据
      }
      console.error('获取推文失败:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 获取指定推文的详细信息
   */
  async getTweetById(tweetId) {
    try {
      const response = await this.client.get(`/tweets/${tweetId}`, {
        params: {
          'tweet.fields': 'id,text,created_at,author_id,public_metrics',
          'expansions': 'author_id',
          'user.fields': 'username,name'
        }
      });
      return response.data;
    } catch (error) {
      console.error('获取推文详情失败:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = TwitterAPI;
