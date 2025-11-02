#!/bin/bash

###############################################################################
# Twitter Monitor 更新脚本
# 使用方法: chmod +x update.sh && ./update.sh
###############################################################################

set -e

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[错误]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[警告]${NC} $1"
}

echo "╔═══════════════════════════════════════════════╗"
echo "║   Twitter Monitor 更新脚本                    ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# 1. 备份配置文件
print_message "步骤 1/5: 备份配置文件..."
if [ -f ".env" ]; then
    cp .env .env.backup
    print_message "配置文件已备份到 .env.backup"
fi

# 2. 备份 last_tweet_id.txt
if [ -f "last_tweet_id.txt" ]; then
    cp last_tweet_id.txt last_tweet_id.txt.backup
    print_message "推文 ID 记录已备份"
fi

# 3. 拉取最新代码（如果使用 Git）
print_message "步骤 2/5: 检查更新..."
if [ -d ".git" ]; then
    print_message "拉取最新代码..."
    git pull
else
    print_warning "不是 Git 仓库，跳过代码更新"
    print_warning "请手动上传新文件"
    read -p "是否已上传新文件？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "请先上传新文件再运行更新脚本"
        exit 1
    fi
fi

# 4. 安装/更新依赖
print_message "步骤 3/5: 更新依赖..."
npm install --production
print_message "依赖更新完成"

# 5. 重启应用
print_message "步骤 4/5: 重启应用..."
if pm2 list | grep -q "twitter-monitor"; then
    pm2 restart twitter-monitor
    print_message "应用已重启"
else
    print_warning "应用未运行，正在启动..."
    pm2 start index.js --name twitter-monitor
fi

# 6. 检查状态
print_message "步骤 5/5: 检查应用状态..."
sleep 2
pm2 status twitter-monitor

echo ""
print_message "🎉 更新完成！"
print_message "查看日志: pm2 logs twitter-monitor"
