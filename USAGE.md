# 🎯 使用指南

## 目录

- [部署前准备](#部署前准备)
- [本地测试](#本地测试)
- [远程部署](#远程部署)
- [日常管理](#日常管理)
- [常见场景](#常见场景)

---

## 部署前准备

### 1. 检查本地环境

```bash
# 确保已安装 Node.js
node --version   # 应该显示版本号，如 v16.20.0

# 确保已安装 npm
npm --version    # 应该显示版本号，如 8.19.4
```

### 2. 获取必要的 Token

#### Twitter Bearer Token

1. 访问 https://developer.twitter.com/en/portal/dashboard
2. 创建一个 Project 和 App
3. 进入 App 的 "Keys and tokens" 页面
4. 点击 "Bearer Token" 下的 "Generate" 按钮
5. 复制生成的 Token（只显示一次，请妥善保存）

#### Telegram Bot Token

1. 在 Telegram 中搜索 `@BotFather`
2. 发送 `/newbot` 命令
3. 按提示输入机器人名称（如：`Twitter Monitor Bot`）
4. 输入机器人用户名（必须以 `bot` 结尾，如：`my_twitter_monitor_bot`）
5. 收到 Token（格式：`1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`）

#### Telegram Chat ID

**个人聊天：**
1. 搜索 `@getidsbot`
2. 启动机器人
3. 它会返回你的 Chat ID（格式：`123456789`）

**群组聊天：**
1. 创建一个群组或使用现有群组
2. 将你的 Bot 添加到群组
3. 在群组中发送任意消息
4. 在浏览器访问：`https://api.telegram.org/bot<你的BOT_TOKEN>/getUpdates`
5. 在返回的 JSON 中找到 `"chat":{"id":-1001234567890}` 的值
6. Chat ID 通常是负数（群组）或正数（个人）

### 3. 配置 .env 文件

```bash
# 复制示例文件
cp .env.example .env

# 编辑配置文件
vi .env   # 或使用其他编辑器：nano .env, code .env
```

填入配置：

```env
# 必需配置
TWITTER_BEARER_TOKEN=你的_Twitter_Bearer_Token
TWITTER_USERNAME=cz_binance
TELEGRAM_BOT_TOKEN=你的_Telegram_Bot_Token
TELEGRAM_CHAT_ID=你的_Chat_ID

# 可选配置（如果需要代理）
HTTP_PROXY=http://username:password@proxy-ip:port
HTTPS_PROXY=http://username:password@proxy-ip:port

# 检查间隔（毫秒）
CHECK_INTERVAL=60000
```

### 4. 验证配置

```bash
./check-config.sh
```

如果所有配置正确，会显示 ✓ 标记。

---

## 本地测试

在部署到服务器前，建议先在本地测试：

```bash
# 1. 安装依赖
npm install

# 2. 检查配置
./check-config.sh

# 3. 运行测试
npm start
```

**预期输出：**
```
╔══════════════════════════════════════╗
║   Twitter 监控系统 v1.0              ║
╚══════════════════════════════════════╝

🔍 正在获取用户信息: @cz_binance

✅ 用户信息获取成功:
   名称: CZ 🔶 BNB
   用户名: @cz_binance
   ID: 902926941413453824

🔗 测试 Telegram 连接...
✅ 消息已发送到 Telegram

🚀 开始监控 @cz_binance
⏱️  检查间隔: 60 秒
```

**同时检查 Telegram：**
- 你应该会收到一条测试消息："🤖 Twitter 监控机器人已启动！"

如果一切正常，按 `Ctrl+C` 停止，准备部署到服务器。

---

## 远程部署

### 方式一：一键部署（最简单）

```bash
./quick-deploy.sh
```

按提示输入：
- 服务器 IP：`123.45.67.89`
- SSH 用户：`root`（默认）
- SSH 端口：`22`（默认）
- 部署路径：`/root/twitter-monitor`（默认）

脚本会自动：
1. ✓ 测试连接
2. ✓ 上传文件
3. ✓ 安装 Node.js（如需要）
4. ✓ 安装依赖
5. ✓ 启动应用
6. ✓ 配置自启动

### 方式二：手动部署

```bash
# 1. 测试服务器连接（可选）
./test-connection.sh

# 2. 上传文件
scp -r . root@your-server-ip:/root/twitter-monitor/

# 3. 登录服务器
ssh root@your-server-ip

# 4. 进入目录
cd /root/twitter-monitor

# 5. 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

---

## 日常管理

### 查看应用状态

```bash
# 从本地查看远程状态
ssh root@your-server-ip "pm2 status"

# 或登录服务器后
pm2 status
```

### 查看日志

```bash
# 实时日志
ssh root@your-server-ip "pm2 logs twitter-monitor"

# 最近 50 行日志
ssh root@your-server-ip "pm2 logs twitter-monitor --lines 50 --nostream"

# 只看错误日志
ssh root@your-server-ip "pm2 logs twitter-monitor --err"
```

### 重启应用

```bash
# 从本地重启
ssh root@your-server-ip "pm2 restart twitter-monitor"

# 或登录服务器后
pm2 restart twitter-monitor
```

### 停止应用

```bash
ssh root@your-server-ip "pm2 stop twitter-monitor"
```

### 更新应用

```bash
# 方式 1：在服务器上运行更新脚本
ssh root@your-server-ip "cd /root/twitter-monitor && ./update.sh"

# 方式 2：从本地重新部署
./quick-deploy.sh
```

### 修改配置

```bash
# 1. 登录服务器
ssh root@your-server-ip

# 2. 编辑配置
cd /root/twitter-monitor
vi .env

# 3. 重启应用使配置生效
pm2 restart twitter-monitor
```

---

## 常见场景

### 监控多个用户

创建多个实例，每个监控不同的用户：

```bash
# 在服务器上
cd /root

# 复制项目
cp -r twitter-monitor twitter-monitor-user2

# 编辑配置
cd twitter-monitor-user2
vi .env
# 修改 TWITTER_USERNAME=another_user

# 启动新实例
pm2 start index.js --name twitter-monitor-user2
pm2 save
```

### 更改检查间隔

```bash
# 编辑 .env
vi .env

# 修改 CHECK_INTERVAL（毫秒）
CHECK_INTERVAL=30000  # 30秒
CHECK_INTERVAL=120000 # 2分钟

# 重启应用
pm2 restart twitter-monitor
```

### 临时停止监控

```bash
# 停止
pm2 stop twitter-monitor

# 稍后恢复
pm2 start twitter-monitor
```

### 查看监控统计

```bash
# 实时监控面板
pm2 monit

# 查看详细信息
pm2 info twitter-monitor
```

### 导出日志

```bash
# 在服务器上
pm2 logs twitter-monitor --lines 1000 > logs_$(date +%Y%m%d).txt

# 下载到本地
scp root@your-server-ip:/root/twitter-monitor/logs_*.txt ./
```

### 服务器重启后检查

```bash
# 登录服务器
ssh root@your-server-ip

# 检查应用是否自动启动
pm2 status

# 如果没有自动启动，手动启动
pm2 resurrect
```

---

## 🔧 故障排除

### 应用启动失败

```bash
# 1. 查看错误日志
pm2 logs twitter-monitor --err

# 2. 手动运行查看详细错误
cd /root/twitter-monitor
node index.js

# 3. 检查配置
./check-config.sh
```

### Twitter API 连接失败

```bash
# 测试网络
curl -I https://api.x.com

# 如果失败，检查代理配置
cat .env | grep PROXY
```

### Telegram 消息发送失败

```bash
# 测试 Bot Token
curl "https://api.telegram.org/bot<你的TOKEN>/getMe"

# 测试发送消息
curl -X POST "https://api.telegram.org/bot<你的TOKEN>/sendMessage" \
  -d "chat_id=<你的CHAT_ID>" \
  -d "text=测试"
```

### 内存不足

```bash
# 检查内存使用
free -h

# 限制应用内存
pm2 delete twitter-monitor
pm2 start index.js --name twitter-monitor --max-memory-restart 300M
pm2 save
```

---

## 📞 获取帮助

遇到问题？

1. 查看日志：`pm2 logs twitter-monitor`
2. 检查配置：`./check-config.sh`
3. 测试连接：`./test-connection.sh`
4. 阅读文档：[DEPLOYMENT.md](DEPLOYMENT.md)

---

**祝使用愉快！** 🎉
