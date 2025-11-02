#!/bin/bash

###############################################################################
# 清理旧版本并从 GitHub 重新部署
# 使用方法: ./clean-and-redeploy.sh
###############################################################################

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}[信息]${NC} $1"
}

echo "╔═══════════════════════════════════════════════╗"
echo "║   清理旧版本并重新部署                        ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# 检查当前目录
CURRENT_DIR=$(pwd)
print_info "当前目录: $CURRENT_DIR"

# 获取 GitHub 仓库信息
read -p "GitHub 用户名 (默认: soryer): " GITHUB_USER
GITHUB_USER=${GITHUB_USER:-soryer}

read -p "仓库名称 (默认: twitter-monitor): " REPO_NAME
REPO_NAME=${REPO_NAME:-twitter-monitor}

read -p "是否为私有仓库？(y/n, 默认: y): " IS_PRIVATE
IS_PRIVATE=${IS_PRIVATE:-y}

if [[ $IS_PRIVATE =~ ^[Yy]$ ]]; then
    read -p "请输入 GitHub Personal Access Token: " GITHUB_TOKEN
    if [ -z "$GITHUB_TOKEN" ]; then
        print_error "未提供 Token，无法克隆私有仓库"
        exit 1
    fi
    CLONE_URL="https://${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"
else
    CLONE_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
fi

echo ""
print_warning "即将执行以下操作："
echo "  1. 停止正在运行的应用"
echo "  2. 备份配置文件 (.env)"
echo "  3. 备份推文记录 (last_tweet_id.json)"
echo "  4. 删除旧的项目文件"
echo "  5. 从 GitHub 克隆最新代码"
echo "  6. 恢复配置文件"
echo "  7. 重新部署应用"
echo ""

read -p "确认继续？(y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "操作已取消"
    exit 0
fi

# 1. 停止应用
print_message "步骤 1/7: 停止应用..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "twitter-monitor"; then
        pm2 stop twitter-monitor || true
        pm2 delete twitter-monitor || true
        print_message "应用已停止"
    else
        print_info "未找到运行中的应用"
    fi
else
    print_info "PM2 未安装，跳过停止应用"
fi

# 2. 备份配置文件
print_message "步骤 2/7: 备份配置文件..."
BACKUP_DIR="/tmp/twitter-monitor-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -f ".env" ]; then
    cp .env "$BACKUP_DIR/"
    print_message "配置文件已备份到: $BACKUP_DIR/.env"
else
    print_warning "未找到 .env 文件"
fi

# 3. 备份推文记录
print_message "步骤 3/7: 备份推文记录..."
if [ -f "last_tweet_id.json" ]; then
    cp last_tweet_id.json "$BACKUP_DIR/"
    print_message "推文记录已备份"
elif [ -f "last_tweet_id.txt" ]; then
    cp last_tweet_id.txt "$BACKUP_DIR/"
    print_message "推文记录已备份 (旧格式)"
fi

# 4. 删除旧文件
print_message "步骤 4/7: 删除旧的项目文件..."

# 获取父目录路径
PARENT_DIR=$(dirname "$CURRENT_DIR")
PROJECT_NAME=$(basename "$CURRENT_DIR")

cd "$PARENT_DIR"

# 删除旧的项目目录
if [ -d "$PROJECT_NAME" ]; then
    print_warning "即将删除: $PARENT_DIR/$PROJECT_NAME"
    rm -rf "$PROJECT_NAME"
    print_message "旧文件已删除"
fi

# 5. 克隆最新代码
print_message "步骤 5/7: 从 GitHub 克隆最新代码..."
print_info "克隆地址: https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

if git clone "$CLONE_URL" "$PROJECT_NAME"; then
    print_message "代码克隆成功"
else
    print_error "克隆失败，请检查仓库地址和 Token"
    exit 1
fi

cd "$PROJECT_NAME"

# 6. 恢复配置文件
print_message "步骤 6/7: 恢复配置文件..."

if [ -f "$BACKUP_DIR/.env" ]; then
    cp "$BACKUP_DIR/.env" .env
    chmod 600 .env
    print_message "配置文件已恢复"
else
    print_warning ".env 文件不存在，正在创建..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        chmod 600 .env
        print_warning "已从 .env.example 创建 .env 文件"
        print_warning "请手动编辑 .env 文件填入配置！"
    fi
fi

# 恢复推文记录
if [ -f "$BACKUP_DIR/last_tweet_id.json" ]; then
    cp "$BACKUP_DIR/last_tweet_id.json" .
    print_message "推文记录已恢复"
elif [ -f "$BACKUP_DIR/last_tweet_id.txt" ]; then
    print_info "发现旧格式的推文记录，建议手动迁移"
fi

# 7. 重新部署
print_message "步骤 7/7: 重新部署应用..."

# 赋予脚本执行权限
chmod +x *.sh 2>/dev/null || true

# 检查是否需要编辑配置
if ! grep -q "^TWITTER_BEARER_TOKEN=.\+$" .env 2>/dev/null || \
   ! grep -q "^TELEGRAM_BOT_TOKEN=.\+$" .env 2>/dev/null || \
   ! grep -q "^TELEGRAM_CHAT_ID=.\+$" .env 2>/dev/null; then
    print_warning ""
    print_warning "配置文件不完整！"
    print_warning "请先编辑 .env 文件："
    print_info "  vi .env"
    print_warning "然后运行部署脚本："
    print_info "  ./deploy.sh"
    echo ""
    read -p "是否现在编辑 .env 文件？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        vi .env
    fi
fi

# 运行部署脚本
if [ -f "deploy.sh" ]; then
    print_message "运行部署脚本..."
    ./deploy.sh
else
    print_warning "未找到 deploy.sh，手动安装依赖..."
    npm install --production
    
    if command -v pm2 &> /dev/null; then
        pm2 start index.js --name twitter-monitor
        pm2 save
        print_message "应用已启动"
    else
        print_warning "请手动启动应用：node index.js 或 pm2 start index.js"
    fi
fi

# 清理备份（可选）
echo ""
read -p "是否删除备份文件？(y/n, 默认: n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf "$BACKUP_DIR"
    print_message "备份已删除"
else
    print_info "备份文件保存在: $BACKUP_DIR"
    print_info "确认应用正常后可手动删除"
fi

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║   部署完成！                                  ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

print_message "应用状态："
if command -v pm2 &> /dev/null; then
    pm2 status
    echo ""
    print_info "查看日志: pm2 logs twitter-monitor"
    print_info "实时监控: pm2 monit"
fi

echo ""
print_message "🎉 清理并重新部署完成！"
