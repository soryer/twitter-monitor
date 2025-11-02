# 远程服务器部署指南 (CentOS 7.9)

本指南将帮助你在 CentOS 7.9 服务器上部署 Twitter 监控系统。

## 🖥️ 服务器要求

- 操作系统：CentOS 7.9
- 内存：至少 512MB
- Node.js：14.x 或更高版本
- 网络：可访问 Twitter API 和 Telegram API（可能需要代理）

## 📋 部署步骤

### 方法一：自动部署（推荐）

使用提供的自动部署脚本：

```bash
# 1. 将整个项目上传到服务器
scp -r twitter-monitor root@your-server-ip:/root/

# 2. 登录服务器
ssh root@your-server-ip

# 3. 进入项目目录
cd /root/twitter-monitor

# 4. 赋予部署脚本执行权限
chmod +x deploy.sh

# 5. 运行自动部署脚本
./deploy.sh
```

### 方法二：手动部署

#### 1. 连接到服务器

```bash
ssh root@your-server-ip
```

#### 2. 安装 Node.js

```bash
# 安装 Node.js 16.x（推荐）
curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -
yum install -y nodejs

# 验证安装
node --version
npm --version
```

#### 3. 安装 Git（如果需要从仓库拉取代码）

```bash
yum install -y git
```

#### 4. 上传项目文件

**选项 A：使用 SCP 上传**
```bash
# 在本地终端执行
scp -r /Users/soyosan/Projkt/twitter-monitor root@your-server-ip:/root/
```

**选项 B：使用 Git 克隆**
```bash
# 在服务器上执行
cd /root
git clone your-git-repo-url twitter-monitor
cd twitter-monitor
```

**选项 C：手动上传（使用 FTP 等工具）**

#### 5. 安装依赖

```bash
cd /root/twitter-monitor
npm install --production
```

#### 6. 配置环境变量

```bash
# 创建 .env 文件
cp .env.example .env

# 编辑配置文件
vi .env
```

按 `i` 进入编辑模式，填入你的配置：

```env
TWITTER_BEARER_TOKEN=你的_Bearer_Token
TWITTER_USERNAME=cz_binance
TELEGRAM_BOT_TOKEN=你的_Bot_Token
TELEGRAM_CHAT_ID=你的_Chat_ID
HTTP_PROXY=http://username:password@ip:1337
HTTPS_PROXY=http://username:password@ip:1337
CHECK_INTERVAL=60000
```

按 `ESC`，然后输入 `:wq` 保存退出。

#### 7. 安装 PM2（进程管理器）

```bash
npm install -g pm2
```

#### 8. 启动应用

```bash
# 启动应用
pm2 start index.js --name twitter-monitor

# 设置开机自启动
pm2 startup
pm2 save
```

## 🔧 PM2 常用命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs twitter-monitor

# 实时日志
pm2 logs twitter-monitor --lines 100

# 停止应用
pm2 stop twitter-monitor

# 重启应用
pm2 restart twitter-monitor

# 删除应用
pm2 delete twitter-monitor

# 查看详细信息
pm2 info twitter-monitor

# 监控
pm2 monit
```

## 🔄 更新应用

### 使用自动更新脚本

```bash
cd /root/twitter-monitor
./update.sh
```

### 手动更新

```bash
cd /root/twitter-monitor

# 停止应用
pm2 stop twitter-monitor

# 拉取最新代码（如果使用 Git）
git pull

# 安装新依赖（如有）
npm install --production

# 重启应用
pm2 restart twitter-monitor
```

## 🔐 安全建议

### 1. 使用非 root 用户运行

```bash
# 创建专用用户
useradd -m -s /bin/bash twittermon

# 将项目移动到用户目录
mv /root/twitter-monitor /home/twittermon/
chown -R twittermon:twittermon /home/twittermon/twitter-monitor

# 切换到该用户
su - twittermon

# 启动应用
cd /home/twittermon/twitter-monitor
pm2 start index.js --name twitter-monitor
pm2 startup
pm2 save
```

### 2. 配置防火墙（如果需要）

```bash
# CentOS 7 使用 firewalld
systemctl start firewalld
systemctl enable firewalld

# 如果应用需要开放端口（本项目不需要）
# firewall-cmd --permanent --add-port=3000/tcp
# firewall-cmd --reload
```

### 3. 保护 .env 文件

```bash
chmod 600 .env
```

## 📊 监控和日志

### 查看应用日志

```bash
# 查看实时日志
pm2 logs twitter-monitor --lines 50

# 查看错误日志
pm2 logs twitter-monitor --err

# 导出日志到文件
pm2 logs twitter-monitor > logs.txt
```

### 日志轮转配置

创建 PM2 日志配置：

```bash
pm2 install pm2-logrotate

# 配置日志最大大小（默认10MB）
pm2 set pm2-logrotate:max_size 10M

# 保留日志文件数量
pm2 set pm2-logrotate:retain 7

# 压缩日志
pm2 set pm2-logrotate:compress true
```

## 🌐 代理配置

如果你的服务器需要通过代理访问 Twitter API：

### 方法 1：在 .env 中配置

```env
HTTP_PROXY=http://username:password@proxy-ip:port
HTTPS_PROXY=http://username:password@proxy-ip:port
```

### 方法 2：系统级代理

```bash
# 编辑 /etc/profile
vi /etc/profile

# 添加以下内容
export http_proxy="http://username:password@proxy-ip:port"
export https_proxy="http://username:password@proxy-ip:port"

# 使配置生效
source /etc/profile

# 重启应用
pm2 restart twitter-monitor
```

## 🧪 测试部署

### 1. 测试网络连接

```bash
# 测试是否能访问 Twitter API
curl -i "https://api.x.com/2/users/by/username/cz_binance" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN"

# 如果需要代理
curl -x http://proxy-ip:port \
  -i "https://api.x.com/2/users/by/username/cz_binance" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN"
```

### 2. 测试 Telegram Bot

```bash
# 发送测试消息
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage" \
  -d "chat_id=YOUR_CHAT_ID" \
  -d "text=测试消息"
```

### 3. 手动运行测试

```bash
cd /root/twitter-monitor
node index.js
```

按 `Ctrl+C` 停止，如果一切正常，使用 PM2 启动。

## ❗ 常见问题

### 1. 连接 Twitter API 失败

**问题**：`ECONNREFUSED` 或 `ETIMEDOUT`

**解决方案**：
- 检查服务器是否能访问 `api.x.com`
- 配置代理
- 检查防火墙设置

### 2. Telegram 消息发送失败

**问题**：`EFORBIDDEN` 或 `chat not found`

**解决方案**：
- 确认 Bot Token 正确
- 确认 Chat ID 正确
- 确保 Bot 已加入群组（如果是群组）
- 在群组中给 Bot 发送一条消息激活

### 3. PM2 启动失败

**问题**：应用启动后立即退出

**解决方案**：
```bash
# 查看错误日志
pm2 logs twitter-monitor --err

# 检查 .env 文件是否存在
ls -la .env

# 手动运行查看错误
node index.js
```

### 4. 内存不足

**问题**：应用被系统杀死

**解决方案**：
```bash
# 限制 PM2 内存使用
pm2 start index.js --name twitter-monitor --max-memory-restart 300M

# 添加交换分区
dd if=/dev/zero of=/swapfile bs=1M count=1024
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## 📱 远程管理

### 使用 PM2 Web 监控

```bash
# 安装 PM2 Web
pm2 install pm2-server-monit

# 或使用 PM2 Plus（云端监控）
pm2 link YOUR_SECRET_KEY YOUR_PUBLIC_KEY
```

### SSH 密钥登录（推荐）

```bash
# 在本地生成密钥对（如果还没有）
ssh-keygen -t rsa -b 4096

# 复制公钥到服务器
ssh-copy-id root@your-server-ip

# 之后可以免密登录
ssh root@your-server-ip
```

## 🔄 备份和恢复

### 备份配置

```bash
# 备份 .env 文件
cp .env .env.backup

# 备份整个项目
tar -czf twitter-monitor-backup-$(date +%Y%m%d).tar.gz twitter-monitor/
```

### 恢复

```bash
# 解压备份
tar -xzf twitter-monitor-backup-20250101.tar.gz

# 恢复并启动
cd twitter-monitor
pm2 start index.js --name twitter-monitor
```

## 📞 支持

如有问题，请检查：
1. 日志文件：`pm2 logs twitter-monitor`
2. 网络连接：`curl` 测试
3. 配置文件：`.env` 是否正确

---

部署完成后，你的 Twitter 监控系统将 24/7 运行在服务器上！🎉
