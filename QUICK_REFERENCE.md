# 🎯 快速参考卡片

## 📚 文档速查

| 文档 | 用途 | 适合人群 |
|------|------|----------|
| [README.md](README.md) | 项目介绍和基本使用 | 所有人 |
| [QUICKSTART.md](QUICKSTART.md) | 5分钟快速开始 | 🆕 新手 |
| [DEPLOYMENT.md](DEPLOYMENT.md) | 详细部署指南 | 🔧 部署人员 |
| [USAGE.md](USAGE.md) | 使用说明和管理 | 📱 日常使用 |
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | 项目架构和原理 | 💻 开发人员 |
| [CHECKLIST.md](CHECKLIST.md) | 部署检查清单 | ✅ 部署验证 |
| [SUMMARY.md](SUMMARY.md) | 项目总结 | 📋 全面了解 |

---

## 🚀 常用命令

### 本地操作

```bash
# 配置检查
./check-config.sh

# 测试连接
./test-connection.sh

# 部署到服务器
./quick-deploy.sh

# 本地测试
npm start
```

### 远程管理

```bash
# 查看状态
ssh root@ip "pm2 status"

# 查看日志
ssh root@ip "pm2 logs twitter-monitor"

# 重启应用
ssh root@ip "pm2 restart twitter-monitor"

# 停止应用
ssh root@ip "pm2 stop twitter-monitor"
```

### 服务器端

```bash
# 查看状态
pm2 status

# 实时日志
pm2 logs twitter-monitor

# 监控面板
pm2 monit

# 更新应用
./update.sh
```

---

## 🔑 配置文件

### .env 必需配置

```env
# Twitter
TWITTER_BEARER_TOKEN=你的token
TWITTER_USERNAME=cz_binance

# Telegram
TELEGRAM_BOT_TOKEN=你的token
TELEGRAM_CHAT_ID=你的id

# 代理（可选）
HTTP_PROXY=http://proxy:port
HTTPS_PROXY=http://proxy:port

# 间隔（毫秒）
CHECK_INTERVAL=60000
```

---

## 🛠️ 故障排除

| 问题 | 解决方案 |
|------|----------|
| SSH连接失败 | `ssh -v root@ip` 测试 |
| 配置错误 | `./check-config.sh` 检查 |
| 应用无法启动 | `pm2 logs twitter-monitor --err` |
| API连接失败 | 检查代理配置 |
| 内存不足 | `pm2 restart --max-memory-restart 300M` |

---

## 📱 快速联系

### 获取 Token

- **Twitter**: https://developer.twitter.com
- **Telegram Bot**: @BotFather
- **Chat ID**: @getidsbot

### 测试 API

```bash
# Twitter API
curl -I https://api.x.com

# Telegram API
curl -I https://api.telegram.org
```

---

## 🎯 核心功能

✅ 实时监控推文  
✅ Telegram 通知  
✅ 24/7 自动运行  
✅ 智能去重  
✅ 代理支持  
✅ 自动重启  

---

## 📞 需要帮助？

1. 🔍 查看日志：`pm2 logs twitter-monitor`
2. ⚙️ 检查配置：`./check-config.sh`
3. 🧪 测试连接：`./test-connection.sh`
4. 📖 阅读文档：选择上面对应的文档

---

**快速开始：[QUICKSTART.md](QUICKSTART.md)**

*v1.0 | 2025-11-02*
