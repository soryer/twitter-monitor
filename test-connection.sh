#!/bin/bash

###############################################################################
# 服务器连接测试脚本
# 用于测试能否正常连接服务器，以及服务器环境是否满足要求
###############################################################################

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "╔═══════════════════════════════════════════════╗"
echo "║   服务器环境检测工具                          ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# 获取服务器信息
read -p "服务器 IP 地址: " SERVER_IP
read -p "SSH 用户名 (默认 root): " SSH_USER
SSH_USER=${SSH_USER:-root}
read -p "SSH 端口 (默认 22): " SSH_PORT
SSH_PORT=${SSH_PORT:-22}

echo ""
echo -e "${BLUE}开始检测服务器: $SSH_USER@$SERVER_IP:$SSH_PORT${NC}"
echo ""

# 1. SSH 连接测试
echo -e "${YELLOW}[1/8]${NC} 测试 SSH 连接..."
if ssh -p $SSH_PORT -o ConnectTimeout=10 -o BatchMode=no $SSH_USER@$SERVER_IP "echo 'SSH 连接成功'" 2>/dev/null; then
    echo -e "${GREEN}✓ SSH 连接正常${NC}"
else
    echo -e "${RED}✗ SSH 连接失败${NC}"
    echo "可能的原因："
    echo "  1. IP 地址或端口错误"
    echo "  2. 服务器防火墙阻止连接"
    echo "  3. SSH 服务未运行"
    echo "  4. 用户名或密码错误"
    exit 1
fi

# 2. 检查操作系统
echo -e "\n${YELLOW}[2/8]${NC} 检查操作系统..."
OS_INFO=$(ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d'\"' -f2")
if [ -n "$OS_INFO" ]; then
    echo -e "${GREEN}✓ 操作系统: $OS_INFO${NC}"
else
    echo -e "${YELLOW}⚠ 无法确定操作系统版本${NC}"
fi

# 3. 检查 Node.js
echo -e "\n${YELLOW}[3/8]${NC} 检查 Node.js..."
NODE_VERSION=$(ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "node --version 2>/dev/null")
if [ -n "$NODE_VERSION" ]; then
    echo -e "${GREEN}✓ Node.js 已安装: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js 未安装${NC}"
    echo -e "${BLUE}  部署脚本将自动安装 Node.js${NC}"
fi

# 4. 检查 npm
echo -e "\n${YELLOW}[4/8]${NC} 检查 npm..."
NPM_VERSION=$(ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "npm --version 2>/dev/null")
if [ -n "$NPM_VERSION" ]; then
    echo -e "${GREEN}✓ npm 已安装: $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm 未安装${NC}"
    echo -e "${BLUE}  部署脚本将自动安装 npm${NC}"
fi

# 5. 检查 PM2
echo -e "\n${YELLOW}[5/8]${NC} 检查 PM2..."
PM2_VERSION=$(ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "pm2 --version 2>/dev/null")
if [ -n "$PM2_VERSION" ]; then
    echo -e "${GREEN}✓ PM2 已安装: $PM2_VERSION${NC}"
else
    echo -e "${RED}✗ PM2 未安装${NC}"
    echo -e "${BLUE}  部署脚本将自动安装 PM2${NC}"
fi

# 6. 检查磁盘空间
echo -e "\n${YELLOW}[6/8]${NC} 检查磁盘空间..."
DISK_USAGE=$(ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "df -h / | tail -1 | awk '{print \$5}' | sed 's/%//'")
if [ -n "$DISK_USAGE" ] && [ "$DISK_USAGE" -lt 90 ]; then
    echo -e "${GREEN}✓ 磁盘使用率: ${DISK_USAGE}%${NC}"
else
    echo -e "${YELLOW}⚠ 磁盘使用率较高: ${DISK_USAGE}%${NC}"
fi

# 7. 检查内存
echo -e "\n${YELLOW}[7/8]${NC} 检查内存..."
MEMORY_INFO=$(ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "free -h | grep Mem | awk '{print \$2\" (可用: \"\$7\")\"}'")
if [ -n "$MEMORY_INFO" ]; then
    echo -e "${GREEN}✓ 内存: $MEMORY_INFO${NC}"
fi

# 8. 测试网络连接
echo -e "\n${YELLOW}[8/8]${NC} 测试网络连接..."

# 测试 Twitter API
echo -n "  - Twitter API: "
TWITTER_TEST=$(ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "curl -s -o /dev/null -w '%{http_code}' --connect-timeout 10 https://api.x.com 2>/dev/null")
if [ "$TWITTER_TEST" == "200" ] || [ "$TWITTER_TEST" == "400" ] || [ "$TWITTER_TEST" == "401" ]; then
    echo -e "${GREEN}✓ 可访问${NC}"
else
    echo -e "${RED}✗ 无法访问 (可能需要代理)${NC}"
fi

# 测试 Telegram API
echo -n "  - Telegram API: "
TG_TEST=$(ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "curl -s -o /dev/null -w '%{http_code}' --connect-timeout 10 https://api.telegram.org 2>/dev/null")
if [ "$TG_TEST" == "200" ] || [ "$TG_TEST" == "404" ]; then
    echo -e "${GREEN}✓ 可访问${NC}"
else
    echo -e "${RED}✗ 无法访问${NC}"
fi

# 汇总
echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║   检测完成                                    ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# 检查是否可以部署
CAN_DEPLOY=true

if [ -z "$NODE_VERSION" ]; then
    echo -e "${YELLOW}⚠ Node.js 未安装，但部署脚本会自动安装${NC}"
fi

if [ "$TWITTER_TEST" != "200" ] && [ "$TWITTER_TEST" != "400" ] && [ "$TWITTER_TEST" != "401" ]; then
    echo -e "${YELLOW}⚠ 无法访问 Twitter API，请确保在 .env 中配置代理${NC}"
fi

if [ "$TG_TEST" != "200" ] && [ "$TG_TEST" != "404" ]; then
    echo -e "${RED}✗ 无法访问 Telegram API，Telegram 通知可能无法工作${NC}"
    CAN_DEPLOY=false
fi

echo ""
if [ "$CAN_DEPLOY" = true ]; then
    echo -e "${GREEN}✓ 服务器环境满足部署要求！${NC}"
    echo ""
    echo "下一步："
    echo "  1. 确保已配置 .env 文件"
    echo "  2. 运行部署脚本: ./quick-deploy.sh"
else
    echo -e "${RED}✗ 服务器环境存在问题，请先解决上述问题${NC}"
fi

echo ""
