# Twitter Monitor - 推特监控系统

一个基于 Node.js 的推特监控工具，可以实时监控指定用户的推文并发送通知到 Telegram 群组。

> 🚀 **5 分钟快速部署** | 📱 **实时推送通知** | 🔄 **24/7 自动运行**

## 功能特性

- ✅ 监控指定推特用户的新推文
- ✅ **支持同时监控多个用户**（用逗号分隔）
- ✅ 实时推送通知到 Telegram 群组
- ✅ 支持 HTTP/HTTPS 代理
- ✅ 自动记录已检查的推文，避免重复通知
- ✅ 显示推文的互动数据（点赞、转发、回复数）
- ✅ 可配置检查间隔时间（**优化后可达 2-3 分钟**）
- ✅ **智能 API 配额管理**，避免速率限制
- ✅ **用户信息缓存**，节省 API 调用
- ✅ **实时 API 使用统计**，可视化配额使用
- ✅ 支持远程服务器部署（CentOS/Ubuntu）
- ✅ 24/7 后台运行，开机自启动

## 🚀 快速开始（3 步完成）

### 第 1 步：配置 Token

```bash
# 复制配置文件
cp .env.example .env

# 编辑配置（填入你的 Token）
vi .env
```

### 第 2 步：检查配置

```bash
./check-config.sh
```

### 第 3 步：部署到服务器

```bash
# 一键部署（自动完成所有配置）
./quick-deploy.sh
```

**就这么简单！** 🎉

> 📖 详细文档：
> - [QUICKSTART.md](QUICKSTART.md) - 5分钟快速开始
> - [DEPLOYMENT.md](DEPLOYMENT.md) - 完整部署指南
> - [CHECKLIST.md](CHECKLIST.md) - 部署检查清单

## 📦 部署方式

### 方式一：远程服务器部署（推荐 - 24/7 运行）

适合需要 24 小时监控的场景。

**准备工作：**
- 一台 CentOS 7.9 或 Ubuntu 服务器
- SSH 访问权限
- 服务器可以访问互联网（可能需要代理）

**部署步骤：**

1. **测试服务器连接**（可选）
   ```bash
   ./test-connection.sh
   ```

2. **一键部署**
   ```bash
   ./quick-deploy.sh
   ```
   
   按提示输入服务器信息，脚本会自动完成所有配置！

3. **查看运行状态**
   ```bash
   ssh root@your-server-ip "pm2 status"
   ```

> 📖 详细部署文档：
> - [QUICKSTART.md](QUICKSTART.md) - 快速开始指南
> - [DEPLOYMENT.md](DEPLOYMENT.md) - 完整部署文档

### 方式二：本地运行

适合测试或临时使用。

#### 1. 安装依赖

```bash
cd twitter-monitor
npm install
```

### 2. 配置环境变量

复制 `.env.example` 文件为 `.env`：

```bash
cp .env.example .env
```

然后编辑 `.env` 文件，填入你的配置：

```env
# Twitter API 配置
TWITTER_BEARER_TOKEN=你的Twitter_Bearer_Token
TWITTER_USERNAME=cz_binance

# Telegram 配置
TELEGRAM_BOT_TOKEN=你的Telegram_Bot_Token
TELEGRAM_CHAT_ID=你的Telegram_Chat_ID

# 代理配置（可选）
HTTP_PROXY=http://username:password@ip:1337
HTTPS_PROXY=http://username:password@ip:1337

# 监控配置
CHECK_INTERVAL=60000
```

## 配置说明

### 1. 获取 Twitter Bearer Token

1. 访问 [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. 创建一个新的 App（如果还没有）
3. 在 App 设置中找到 "Keys and tokens"
4. 生成或查看 "Bearer Token"

### 2. 获取 Telegram Bot Token

1. 在 Telegram 中搜索 [@BotFather](https://t.me/botfather)
2. 发送 `/newbot` 命令创建新机器人
3. 按提示设置机器人名称和用户名
4. 获取 Bot Token（格式：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`）

### 3. 获取 Telegram Chat ID

**方法一：通过 GetIDsBot**
1. 在 Telegram 中搜索 [@getidsbot](https://t.me/getidsbot)
2. 启动机器人，它会返回你的 Chat ID

**方法二：通过群组**
1. 将你的 Bot 添加到目标群组
2. 在群组中发送一条消息
3. 访问：`https://api.telegram.org/bot<你的BOT_TOKEN>/getUpdates`
4. 在返回的 JSON 中找到 `chat.id`

### 4. 代理配置（可选）

如果需要使用代理访问 Twitter API，请设置：

```env
HTTP_PROXY=http://username:password@ip:1337
HTTPS_PROXY=http://username:password@ip:1337
```

如果不需要代理，可以注释掉或删除这两行。

## 使用方法

### 本地运行

启动监控：
```bash
npm start
```

或者：
```bash
node index.js
```

停止监控：按 `Ctrl + C`

### 远程服务器运行

```bash
# 查看状态
ssh root@your-server-ip "pm2 status"

# 查看日志
ssh root@your-server-ip "pm2 logs twitter-monitor"

# 重启应用
ssh root@your-server-ip "pm2 restart twitter-monitor"

# 停止应用
ssh root@your-server-ip "pm2 stop twitter-monitor"
```

## 配置参数

- `TWITTER_USERNAME`: 要监控的推特用户名（不含 @）
  - 单个用户：`cz_binance`
  - **多个用户**：`cz_binance,elonmusk,vitalikbuterin`（用逗号分隔）
  - 详见 [MULTI_USER_GUIDE.md](MULTI_USER_GUIDE.md)
- `CHECK_INTERVAL`: 检查新推文的间隔时间（毫秒），默认 60000（60秒）

## 输出示例

```
╔══════════════════════════════════════╗
║   Twitter 监控系统 v1.0              ║
║   Twitter Monitor & Telegram Alert   ║
╚══════════════════════════════════════╝

🔍 正在获取用户信息: @cz_binance

✅ 用户信息获取成功:
   名称: CZ 🔶 BNB
   用户名: @cz_binance
   ID: 902926941413453824
   粉丝数: 9500000

🔗 测试 Telegram 连接...
✅ 消息已发送到 Telegram

📌 初始化完成，当前最新推文 ID: 1234567890123456789

🚀 开始监控 @cz_binance
⏱️  检查间隔: 60 秒

按 Ctrl+C 停止监控

[14:30:25] ✓ 已检查，暂无新推文
[14:31:25] ✓ 已检查，暂无新推文

🆕 发现 1 条新推文！

📨 推文 ID: 1234567890123456790
   内容: GM! Have a great weekend everyone!
   
✅ 已发送推文通知到 Telegram: 1234567890123456790
```

## Telegram 通知格式

```
🚨 新推文提醒 🚨

👤 用户: CZ 🔶 BNB (@cz_binance)
📅 时间: 2025/11/01 14:30:00

📝 内容:
GM! Have a great weekend everyone!

🔗 链接: https://twitter.com/cz_binance/status/1234567890123456790

📊 互动数据:
❤️ 点赞: 1500
🔄 转发: 300
💬 回复: 150
```

## 📁 项目文件说明

```
twitter-monitor/
├── index.js              # 主入口文件
├── monitor.js            # 监控核心逻辑
├── twitterApi.js         # Twitter API 封装
├── telegramBot.js        # Telegram 通知功能
├── config.js             # 配置管理
├── package.json          # 项目配置
├── .env                  # 环境变量（需要配置）
├── .env.example          # 环境变量示例
├── ecosystem.config.js   # PM2 配置文件
├── deploy.sh             # 服务器端部署脚本
├── update.sh             # 应用更新脚本
├── quick-deploy.sh       # 本地一键部署脚本
├── test-connection.sh    # 服务器连接测试脚本
├── README.md             # 项目说明
├── QUICKSTART.md         # 快速开始指南
└── DEPLOYMENT.md         # 详细部署文档
```

## 📝 注意事项

1. **API 限制**: Twitter API 有速率限制，建议检查间隔不要设置太短（建议至少 30 秒）
2. **代理配置**: 如果在某些地区无法直接访问 Twitter API，需要配置代理
3. **Bot 权限**: 确保 Telegram Bot 已添加到目标群组，并有发送消息的权限
4. **持续运行**: 远程部署已自动使用 PM2 保持程序持续运行
5. **安全性**: 建议使用 SSH 密钥登录服务器，不要在代码中硬编码敏感信息

## 🔧 本地使用 PM2（可选）

如果要在本地保持后台运行：

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start index.js --name twitter-monitor

# 查看状态
pm2 status

# 查看日志
pm2 logs twitter-monitor

# 停止应用
pm2 stop twitter-monitor
```

## 故障排除

### 1. Twitter API 速率限制（429 错误）⚠️ 最常见

**问题：** Twitter 免费 API 限制 15 次请求/15分钟，初始化时很容易超限

**解决方案 A：等待并调整配置**
```bash
# 1. 等待 15 分钟
# 2. 修改 .env，增加检查间隔
CHECK_INTERVAL=600000  # 10分钟

# 3. 减少监控用户（建议不超过3个）
TWITTER_USERNAME=user1,user2
```

**解决方案 B：使用用户缓存（强烈推荐）** ⭐
```bash
# 运行缓存创建工具
node create-user-cache.js

# 按提示输入：
# 1. 访问 https://tweeterid.com/ 获取用户 ID
# 2. 输入用户 ID、用户名、显示名称
# 3. 完成后重启程序

pm2 restart twitter-monitor
```

创建缓存后，程序将使用本地数据，**不再消耗 API 配额**！

### 2. Twitter API 返回 401 错误
- 检查 Bearer Token 是否正确
- 确认 Token 没有过期

### 3. Telegram 无法发送消息
- 检查 Bot Token 是否正确
- 确认 Chat ID 是否正确
- 确认 Bot 已添加到群组（如果是群组）

### 4. 代理连接失败
- 检查代理地址、端口、用户名、密码是否正确
- 不要使用占位符值（如 `username:password@ip:1337`）
- 如不需要代理，注释掉 .env 中的代理配置
- 尝试使用 curl 命令测试代理是否可用

## 🎯 优化建议

### 获取配置建议

运行配置建议工具，获取针对你的用户数量的最优配置：

```bash
node config-advisor.js
```

工具会根据你要监控的用户数量，自动计算：
- ✅ 最优检查间隔
- ✅ 预计 API 使用量
- ✅ 配额使用百分比
- ✅ 多种配置方案对比

### 推荐配置

| 监控用户数 | 推荐间隔 | 每小时调用 | 配额使用 |
|-----------|----------|-----------|----------|
| 1 个用户 | 2 分钟 | 30 次 | 21.6k/月 (21%) |
| 2 个用户 | 3 分钟 | 40 次 | 28.8k/月 (28%) |
| 3 个用户 | 5 分钟 | 36 次 | 25.9k/月 (25%) |
| 4-5 个用户 | 10 分钟 | 24-30 次 | 17-21k/月 (17-21%) |

### API 使用统计

程序运行时会自动显示 API 使用统计：

```
📊 API 使用统计:
   运行时长: 120 分钟
   总调用: 48 次
   成功: 48 | 失败: 0
   速率限制: 0 次
   平均: 24 次/小时
   ✅ 调用频率正常
```

### 优化技巧

1. **使用用户缓存**：减少 API 调用
   ```bash
   node create-user-cache.js
   ```

2. **优先监控活跃用户**：发推频率高的用户

3. **合理设置间隔**：根据用户数量调整

4. **定期检查统计**：确保在配额范围内

## 许可证

MIT License

## 作者

Created with ❤️ for Twitter monitoring
