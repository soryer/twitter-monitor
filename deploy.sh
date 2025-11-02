#!/bin/bash

###############################################################################
# Twitter Monitor 自动部署脚本
# 适用于 CentOS 7.9
# 使用方法: chmod +x deploy.sh && ./deploy.sh
###############################################################################

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
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

# 显示欢迎信息
echo "╔═══════════════════════════════════════════════╗"
echo "║   Twitter Monitor 自动部署脚本                ║"
echo "║   CentOS 7.9                                  ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -eq 0 ]; then 
    print_warning "当前以 root 用户运行，建议创建专用用户运行应用"
fi

# 1. 检查系统版本
print_message "步骤 1/8: 检查系统版本..."
if [ -f /etc/centos-release ]; then
    centos_version=$(cat /etc/centos-release)
    print_info "系统版本: $centos_version"
else
    print_warning "无法确定系统版本，继续安装..."
fi

# 2. 检查并安装 Node.js
print_message "步骤 2/8: 检查 Node.js..."
if command -v node &> /dev/null; then
    node_version=$(node --version)
    print_info "Node.js 已安装: $node_version"
else
    print_warning "Node.js 未安装，开始安装 Node.js 16.x..."
    curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -
    yum install -y nodejs
    print_message "Node.js 安装完成: $(node --version)"
fi

# 3. 检查并安装依赖
print_message "步骤 3/8: 安装项目依赖..."
if [ -f "package.json" ]; then
    npm install --production
    print_message "依赖安装完成"
else
    print_error "package.json 文件不存在，请确认在正确的目录中"
    exit 1
fi

# 4. 检查配置文件
print_message "步骤 4/8: 检查配置文件..."
if [ -f ".env" ]; then
    print_info ".env 文件已存在"
    # 检查必要的配置项
    if ! grep -q "TWITTER_BEARER_TOKEN=.\+" .env || \
       ! grep -q "TELEGRAM_BOT_TOKEN=.\+" .env || \
       ! grep -q "TELEGRAM_CHAT_ID=.\+" .env; then
        print_warning ".env 文件存在但配置不完整，请手动编辑"
        print_info "请编辑 .env 文件，填入以下配置："
        print_info "  - TWITTER_BEARER_TOKEN"
        print_info "  - TELEGRAM_BOT_TOKEN"
        print_info "  - TELEGRAM_CHAT_ID"
        read -p "是否现在编辑 .env 文件？(y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            vi .env
        fi
    fi
else
    print_warning ".env 文件不存在，正在创建..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_message ".env 文件已创建，请配置必要参数"
        print_info "请编辑 .env 文件，填入以下配置："
        print_info "  - TWITTER_BEARER_TOKEN"
        print_info "  - TELEGRAM_BOT_TOKEN"
        print_info "  - TELEGRAM_CHAT_ID"
        read -p "是否现在编辑 .env 文件？(y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            vi .env
        else
            print_error "请手动编辑 .env 文件后再运行应用"
            exit 1
        fi
    else
        print_error ".env.example 文件不存在"
        exit 1
    fi
fi

# 保护 .env 文件
chmod 600 .env
print_info ".env 文件权限已设置为 600"

# 5. 安装 PM2
print_message "步骤 5/8: 检查 PM2..."
if command -v pm2 &> /dev/null; then
    pm2_version=$(pm2 --version)
    print_info "PM2 已安装: $pm2_version"
else
    print_warning "PM2 未安装，开始安装..."
    npm install -g pm2
    print_message "PM2 安装完成: $(pm2 --version)"
fi

# 6. 停止旧的实例（如果存在）
print_message "步骤 6/8: 检查现有实例..."
if pm2 list | grep -q "twitter-monitor"; then
    print_warning "发现现有实例，正在停止..."
    pm2 stop twitter-monitor
    pm2 delete twitter-monitor
    print_message "旧实例已停止"
fi

# 7. 启动应用
print_message "步骤 7/8: 启动应用..."
pm2 start index.js --name twitter-monitor

# 等待应用启动
sleep 3

# 检查应用状态
if pm2 list | grep -q "online.*twitter-monitor"; then
    print_message "应用启动成功！"
else
    print_error "应用启动失败，请查看日志: pm2 logs twitter-monitor"
    exit 1
fi

# 8. 配置开机自启动
print_message "步骤 8/8: 配置开机自启动..."
pm2 save
if [ "$EUID" -eq 0 ]; then
    # Root 用户
    pm2 startup systemd -u root --hp /root
else
    # 普通用户
    print_info "请以 root 权限执行以下命令以配置开机自启动："
    pm2 startup
fi

# 安装 PM2 日志轮转
print_message "安装 PM2 日志轮转模块..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true

# 显示应用状态
echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║   部署完成！                                  ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

print_message "应用状态："
pm2 status

echo ""
print_info "常用命令："
print_info "  查看状态:   pm2 status"
print_info "  查看日志:   pm2 logs twitter-monitor"
print_info "  停止应用:   pm2 stop twitter-monitor"
print_info "  重启应用:   pm2 restart twitter-monitor"
print_info "  删除应用:   pm2 delete twitter-monitor"
print_info "  实时监控:   pm2 monit"
echo ""

# 显示最近的日志
print_message "最近的日志输出："
pm2 logs twitter-monitor --lines 20 --nostream

echo ""
print_message "🎉 部署成功！Twitter 监控系统正在运行..."
print_info "提示: 使用 'pm2 logs twitter-monitor' 查看实时日志"
