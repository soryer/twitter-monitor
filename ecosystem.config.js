/**
 * PM2 生态系统配置文件
 * 用于更高级的 PM2 部署和管理
 * 
 * 使用方法:
 *   pm2 start ecosystem.config.js
 *   pm2 reload ecosystem.config.js
 *   pm2 stop ecosystem.config.js
 */

module.exports = {
  apps: [{
    // 应用名称
    name: 'twitter-monitor',
    
    // 启动脚本
    script: './index.js',
    
    // 实例数量（cluster 模式下有效，本应用使用 fork 模式）
    instances: 1,
    
    // 执行模式：fork 或 cluster
    exec_mode: 'fork',
    
    // 监听文件变化并自动重启（生产环境建议设为 false）
    watch: false,
    
    // 忽略监听的文件
    ignore_watch: [
      'node_modules',
      'logs',
      '*.log',
      '.env',
      'last_tweet_id.txt'
    ],
    
    // 内存超过此值时自动重启
    max_memory_restart: '500M',
    
    // 环境变量
    env: {
      NODE_ENV: 'production'
    },
    
    // 日志配置
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // 合并日志
    combine_logs: true,
    
    // 日志时间格式
    time: true,
    
    // 自动重启配置
    autorestart: true,
    
    // 最大重启次数（在 min_uptime 时间内）
    max_restarts: 10,
    
    // 最小运行时间，超过此时间才认为启动成功
    min_uptime: '10s',
    
    // 重启延迟
    restart_delay: 4000,
    
    // 停止应用的超时时间
    kill_timeout: 5000,
    
    // 等待应用就绪的超时时间
    listen_timeout: 3000,
    
    // Cron 重启（可选，例如每天凌晨3点重启）
    // cron_restart: '0 3 * * *',
    
    // 在应用崩溃时执行的命令
    // post_update: ['npm install', 'echo 应用已更新']
  }],

  /**
   * 部署配置（可选）
   * 用于自动化部署到远程服务器
   */
  deploy: {
    production: {
      // SSH 用户
      user: 'root',
      
      // 服务器地址（多个服务器用数组）
      host: 'your-server-ip',
      
      // SSH 端口
      // port: '22',
      
      // SSH 密钥路径
      // key: '~/.ssh/id_rsa',
      
      // 代码仓库
      repo: 'https://github.com/your-username/twitter-monitor.git',
      
      // 分支
      ref: 'origin/master',
      
      // 服务器上的部署路径
      path: '/root/twitter-monitor',
      
      // 部署前执行的命令
      'pre-deploy': 'git fetch --all',
      
      // 部署后执行的命令
      'post-deploy': 'npm install --production && pm2 reload ecosystem.config.js',
      
      // 部署失败时执行的命令
      'pre-setup': ''
    }
  }
};
