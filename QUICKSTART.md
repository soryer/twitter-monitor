# 🚀 快速开始 - CentOS 7.9 远程部署

## 📦 部署方式选择

### 方式一：自动一键部署（最简单，推荐）

这是最简单的方式，只需要在本地运行一个命令：

```bash
cd /Users/soyosan/Projkt/twitter-monitor
./quick-deploy.sh
```

脚本会提示你输入：
- 服务器 IP 地址
- SSH 用户名（默认 root）
- SSH 端口（默认 22）
- 远程路径（默认 /root/twitter-monitor）

然后自动完成：
1. ✓ 测试 SSH 连接
2. ✓ 上传项目文件
3. ✓ 安装 Node.js 和依赖
4. ✓ 配置并启动应用
5. ✓ 设置开机自启动

**完成后应用就会在服务器上 24/7 运行！**

---

### 方式二：手动部署（更可控）

#### 步骤 1: 上传项目到服务器

```bash
# 使用 scp 上传整个项目
scp -r /Users/soyosan/Projkt/twitter-monitor root@your-server-ip:/root/

# 或使用 rsync（更快，支持断点续传）
rsync -avz --exclude 'node_modules' \
    twitter-monitor/ root@your-server-ip:/root/twitter-monitor/
```

#### 步骤 2: 登录服务器

```bash
ssh root@your-server-ip
```

#### 步骤 3: 运行部署脚本

```bash
cd /root/twitter-monitor
chmod +x deploy.sh
./deploy.sh
```

脚本会自动：
- 安装 Node.js（如果未安装）
- 安装项目依赖
- 配置 PM2
- 启动应用
- 设置开机自启动

---

## ⚙️ 配置 .env 文件

**重要：** 在启动应用前，必须配置 `.env` 文件！

### 方式 A: 在本地配置后上传

1. 在本地编辑 `.env` 文件
2. 使用 `quick-deploy.sh` 时选择上传

### 方式 B: 在服务器上配置

```bash
ssh root@your-server-ip
cd /root/twitter-monitor
vi .env
```

填入配置：

```env
TWITTER_BEARER_TOKEN=你的_Twitter_Bearer_Token
TWITTER_USERNAME=cz_binance
TELEGRAM_BOT_TOKEN=你的_Telegram_Bot_Token
TELEGRAM_CHAT_ID=你的_Telegram_Chat_ID
HTTP_PROXY=http://username:password@ip:1337
HTTPS_PROXY=http://username:password@ip:1337
CHECK_INTERVAL=60000
```

保存：按 `ESC`，输入 `:wq`，回车

---

## 🔧 获取必要的 Token

### 1. Twitter Bearer Token

1. 访问 https://developer.twitter.com/en/portal/dashboard
2. 创建项目和 App
3. 在 "Keys and tokens" 中生成 Bearer Token

### 2. Telegram Bot Token

1. 在 Telegram 搜索 `@BotFather`
2. 发送 `/newbot` 创建机器人
3. 按提示设置名称，获取 Token

### 3. Telegram Chat ID

**个人聊天：**
1. 搜索 `@getidsbot`
2. 启动机器人，获取你的 ID

**群组聊天：**
1. 将你的 Bot 添加到群组
2. 在群组发送一条消息
3. 访问：`https://api.telegram.org/bot<你的BOT_TOKEN>/getUpdates`
4. 找到 `"chat":{"id":-123456789}` 的值

---

## 📊 管理应用

### 常用 PM2 命令

```bash
# 查看状态
pm2 status

# 查看实时日志
pm2 logs twitter-monitor

# 查看最近 100 行日志
pm2 logs twitter-monitor --lines 100

# 停止应用
pm2 stop twitter-monitor

# 重启应用
pm2 restart twitter-monitor

# 删除应用
pm2 delete twitter-monitor

# 实时监控
pm2 monit
```

### 远程管理（从本地）

```bash
# 查看远程日志
ssh root@your-server-ip "pm2 logs twitter-monitor --lines 50 --nostream"

# 重启远程应用
ssh root@your-server-ip "pm2 restart twitter-monitor"

# 查看远程状态
ssh root@your-server-ip "pm2 status"
```

---

## 🔄 更新应用

### 方式 1: 使用更新脚本（推荐）

```bash
# 在服务器上
cd /root/twitter-monitor
./update.sh
```

### 方式 2: 重新部署

```bash
# 在本地
./quick-deploy.sh
```

---

## ✅ 验证部署

### 1. 检查应用是否运行

```bash
ssh root@your-server-ip "pm2 status"
```

应该看到 `twitter-monitor` 状态为 `online`

### 2. 查看日志

```bash
ssh root@your-server-ip "pm2 logs twitter-monitor --lines 20"
```

应该看到类似输出：
```
✅ 用户信息获取成功
🔗 测试 Telegram 连接...
✅ 消息已发送到 Telegram
🚀 开始监控 @cz_binance
```

### 3. 测试 Telegram 通知

应用启动时会自动发送一条测试消息到 Telegram 群组。

---

## ❗ 常见问题

### 1. SSH 连接失败

```bash
# 测试连接
ssh root@your-server-ip

# 如果提示密码错误，使用 -v 查看详细信息
ssh -v root@your-server-ip
```

### 2. 权限被拒绝

```bash
# 如果是权限问题，使用 root 用户
ssh root@your-server-ip

# 或者切换到 root
sudo su -
```

### 3. Twitter API 连接失败

检查服务器是否能访问 Twitter：

```bash
ssh root@your-server-ip

# 测试连接
curl -I https://api.x.com

# 如果失败，需要配置代理
```

### 4. 应用启动失败

```bash
# 查看详细错误
ssh root@your-server-ip "pm2 logs twitter-monitor --err"

# 手动运行查看错误
ssh root@your-server-ip "cd /root/twitter-monitor && node index.js"
```

---

## 🔐 安全建议

### 1. 使用 SSH 密钥登录（推荐）

```bash
# 在本地生成密钥（如果还没有）
ssh-keygen -t rsa -b 4096

# 复制公钥到服务器
ssh-copy-id root@your-server-ip

# 之后可以免密登录
ssh root@your-server-ip
```

### 2. 创建专用用户（推荐）

```bash
# 登录服务器
ssh root@your-server-ip

# 创建用户
useradd -m -s /bin/bash twittermon
passwd twittermon

# 移动项目
mv /root/twitter-monitor /home/twittermon/
chown -R twittermon:twittermon /home/twittermon/twitter-monitor

# 切换用户并启动
su - twittermon
cd /home/twittermon/twitter-monitor
pm2 start index.js --name twitter-monitor
pm2 save
```

---

## 📞 需要帮助？

部署过程中遇到问题，可以：

1. 查看详细部署文档：`DEPLOYMENT.md`
2. 查看应用日志：`pm2 logs twitter-monitor`
3. 检查配置文件：`cat .env`

---

## 🎯 快速命令参考

```bash
# === 部署 ===
./quick-deploy.sh                    # 一键部署

# === 管理 ===
ssh root@your-server-ip              # 登录服务器
pm2 status                           # 查看状态
pm2 logs twitter-monitor             # 查看日志
pm2 restart twitter-monitor          # 重启应用

# === 更新 ===
./update.sh                          # 更新应用

# === 监控 ===
pm2 monit                            # 实时监控
```

---

**部署完成后，你的 Twitter 监控系统将 24/7 在远程服务器运行！** 🎉
