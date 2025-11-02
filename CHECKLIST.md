# ✅ 部署检查清单

在部署到生产环境前，请确认以下所有项目都已完成。

---

## 📋 部署前检查

### 1. 本地环境准备

- [ ] 已安装 Node.js (v14+)
- [ ] 已安装 npm
- [ ] 项目依赖已安装 (`npm install`)
- [ ] 所有脚本已赋予执行权限 (`chmod +x *.sh`)

### 2. Token 获取

- [ ] 已获取 Twitter Bearer Token
  - [ ] 访问 https://developer.twitter.com
  - [ ] 创建了 App
  - [ ] 生成并保存了 Bearer Token
  
- [ ] 已创建 Telegram Bot
  - [ ] 通过 @BotFather 创建
  - [ ] 获取了 Bot Token
  - [ ] Bot 已添加到目标群组（如果是群组）
  
- [ ] 已获取 Telegram Chat ID
  - [ ] 个人：通过 @getidsbot 获取
  - [ ] 群组：通过 getUpdates API 获取
  - [ ] 已验证 Chat ID 格式正确

### 3. 配置文件

- [ ] 已创建 `.env` 文件 (`cp .env.example .env`)
- [ ] 已填写 `TWITTER_BEARER_TOKEN`
- [ ] 已填写 `TWITTER_USERNAME`（要监控的用户）
- [ ] 已填写 `TELEGRAM_BOT_TOKEN`
- [ ] 已填写 `TELEGRAM_CHAT_ID`
- [ ] 如需代理，已配置 `HTTP_PROXY` 和 `HTTPS_PROXY`
- [ ] 已配置 `CHECK_INTERVAL`（建议 30-60 秒）
- [ ] 运行 `./check-config.sh` 检查配置 ✅

### 4. 本地测试

- [ ] 本地运行 `npm start` 无报错
- [ ] 收到 Telegram 测试消息 "🤖 Twitter 监控机器人已启动！"
- [ ] 应用成功获取用户信息
- [ ] 应用正常轮询检查推文
- [ ] 按 `Ctrl+C` 可以正常退出

---

## 🖥️ 服务器环境检查

### 1. 服务器基本信息

- [ ] 操作系统：CentOS 7.9 或 Ubuntu
- [ ] 内存：≥ 512MB
- [ ] 磁盘空间：≥ 1GB
- [ ] SSH 访问：可以正常登录
- [ ] 网络：可以访问互联网

### 2. 服务器连接测试

- [ ] 运行 `./test-connection.sh` 测试连接
- [ ] SSH 连接正常 ✅
- [ ] 操作系统版本正确 ✅
- [ ] 可访问 Twitter API（或已配置代理）✅
- [ ] 可访问 Telegram API ✅

### 3. 代理配置（如需要）

- [ ] 代理服务器地址正确
- [ ] 代理端口正确
- [ ] 代理用户名和密码正确
- [ ] 测试代理可用：`curl -x http://proxy:port https://api.x.com`

---

## 🚀 部署执行

### 方式 A：一键部署（推荐）

- [ ] 在本地运行 `./quick-deploy.sh`
- [ ] 输入服务器 IP 地址
- [ ] 输入 SSH 用户名
- [ ] 输入 SSH 端口
- [ ] 输入远程路径
- [ ] 确认部署
- [ ] 等待脚本执行完成
- [ ] 脚本显示 "部署完成" ✅

### 方式 B：手动部署

- [ ] 上传文件到服务器
  ```bash
  scp -r . root@server-ip:/root/twitter-monitor/
  ```
- [ ] 登录服务器
  ```bash
  ssh root@server-ip
  ```
- [ ] 进入项目目录
  ```bash
  cd /root/twitter-monitor
  ```
- [ ] 运行部署脚本
  ```bash
  chmod +x deploy.sh && ./deploy.sh
  ```
- [ ] 脚本执行成功 ✅

---

## 🔍 部署后验证

### 1. 应用状态检查

- [ ] PM2 显示应用状态为 `online`
  ```bash
  ssh root@server-ip "pm2 status"
  ```
- [ ] 应用运行时间 > 1 分钟
- [ ] 应用重启次数为 0

### 2. 功能验证

- [ ] 收到 Telegram 启动消息
- [ ] 查看日志无报错
  ```bash
  ssh root@server-ip "pm2 logs twitter-monitor --lines 50 --nostream"
  ```
- [ ] 应用成功获取 Twitter 用户信息
- [ ] 应用开始轮询检查推文

### 3. 测试推文通知（可选）

如果被监控用户发了新推文：
- [ ] 收到 Telegram 通知
- [ ] 通知内容格式正确
- [ ] 包含推文链接
- [ ] 包含互动数据（点赞、转发等）

### 4. 重启测试

- [ ] 重启应用
  ```bash
  ssh root@server-ip "pm2 restart twitter-monitor"
  ```
- [ ] 应用重启后状态正常
- [ ] 再次收到启动消息

### 5. 停止/启动测试

- [ ] 停止应用
  ```bash
  ssh root@server-ip "pm2 stop twitter-monitor"
  ```
- [ ] 应用状态变为 `stopped`
- [ ] 启动应用
  ```bash
  ssh root@server-ip "pm2 start twitter-monitor"
  ```
- [ ] 应用状态恢复为 `online`

---

## 🔒 安全检查

### 1. 文件权限

- [ ] `.env` 文件权限为 600
  ```bash
  ssh root@server-ip "ls -la /root/twitter-monitor/.env"
  ```
- [ ] 敏感文件不可被其他用户读取

### 2. SSH 安全

- [ ] 使用 SSH 密钥登录（推荐）
- [ ] 或使用强密码
- [ ] 考虑修改 SSH 默认端口 22

### 3. 防火墙配置

- [ ] 防火墙已启用（如需要）
- [ ] 只开放必要端口（SSH）
- [ ] 应用本身不需要开放端口

---

## 📊 监控配置

### 1. PM2 配置

- [ ] 已设置开机自启动
  ```bash
  pm2 startup
  pm2 save
  ```
- [ ] 日志轮转已配置
  ```bash
  pm2 install pm2-logrotate
  ```

### 2. 日志管理

- [ ] 日志目录已创建
- [ ] 日志轮转配置正确
  - 最大大小：10MB
  - 保留天数：7 天
  - 自动压缩：启用

### 3. 告警配置（可选）

- [ ] PM2 Plus 云监控（可选）
- [ ] 自定义告警脚本（可选）

---

## 📝 文档归档

### 1. 保存重要信息

创建一个安全的地方保存：
- [ ] Twitter Bearer Token
- [ ] Telegram Bot Token
- [ ] Telegram Chat ID
- [ ] 服务器 IP 和 SSH 凭证
- [ ] 代理信息（如有）

### 2. 文档备份

- [ ] 备份 `.env` 文件
- [ ] 备份部署配置
- [ ] 记录部署日期和版本

---

## 🎯 最终确认

### 在生产环境使用前：

- [ ] ✅ 所有 Token 已正确配置
- [ ] ✅ 本地测试通过
- [ ] ✅ 服务器连接正常
- [ ] ✅ 应用部署成功
- [ ] ✅ 功能验证通过
- [ ] ✅ 安全检查完成
- [ ] ✅ 监控已配置
- [ ] ✅ 文档已归档

### 确认以下内容正常工作：

- [ ] ✅ Twitter API 连接正常
- [ ] ✅ Telegram Bot 发送消息正常
- [ ] ✅ 应用自动监控推文
- [ ] ✅ 新推文能收到通知
- [ ] ✅ 应用稳定运行
- [ ] ✅ 日志正常记录
- [ ] ✅ PM2 管理正常

---

## 🎊 部署完成！

如果以上所有项目都已确认，恭喜你！

✅ **Twitter 监控系统已成功部署，可以开始 24/7 运行了！**

---

## 📞 后续支持

### 日常管理

查看 [USAGE.md](USAGE.md) 了解：
- 如何查看日志
- 如何重启应用
- 如何更新版本
- 如何修改配置

### 故障排除

遇到问题请查看：
- [DEPLOYMENT.md](DEPLOYMENT.md#常见问题)
- 应用日志：`pm2 logs twitter-monitor`
- 配置检查：`./check-config.sh`

### 获取帮助

- 📖 查看完整文档
- 🐛 报告问题
- 💡 提出建议

---

**祝你使用愉快！** 🚀

*检查清单版本：v1.0*  
*最后更新：2025-11-02*
