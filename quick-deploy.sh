#!/bin/bash

###############################################################################
# 快速部署脚本 - 从本地直接部署到远程服务器
# 使用方法: ./quick-deploy.sh
###############################################################################

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "╔═══════════════════════════════════════════════╗"
echo "║   Twitter Monitor 快速部署工具                ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# 获取服务器信息
echo -e "${BLUE}请输入服务器信息:${NC}"
read -p "服务器 IP 地址: " SERVER_IP
read -p "SSH 用户名 (默认 root): " SSH_USER
SSH_USER=${SSH_USER:-root}
read -p "SSH 端口 (默认 22): " SSH_PORT
SSH_PORT=${SSH_PORT:-22}
read -p "远程部署路径 (默认 /root/twitter-monitor): " REMOTE_PATH
REMOTE_PATH=${REMOTE_PATH:-/root/twitter-monitor}

echo ""
echo -e "${YELLOW}准备部署到:${NC}"
echo "  服务器: $SSH_USER@$SERVER_IP:$SSH_PORT"
echo "  路径: $REMOTE_PATH"
echo ""

read -p "确认部署？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消部署"
    exit 0
fi

# 1. 测试 SSH 连接
echo -e "\n${GREEN}[1/6]${NC} 测试 SSH 连接..."
if ssh -p $SSH_PORT -o ConnectTimeout=5 $SSH_USER@$SERVER_IP "echo '连接成功'" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} SSH 连接正常"
else
    echo -e "${RED}✗${NC} SSH 连接失败，请检查服务器地址、用户名和密码"
    exit 1
fi

# 2. 创建远程目录
echo -e "\n${GREEN}[2/6]${NC} 创建远程目录..."
ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "mkdir -p $REMOTE_PATH"

# 3. 备份远程配置文件（如果存在）
echo -e "\n${GREEN}[3/6]${NC} 备份现有配置..."
ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "cd $REMOTE_PATH && [ -f .env ] && cp .env .env.backup.$(date +%Y%m%d_%H%M%S) || true"

# 4. 上传文件
echo -e "\n${GREEN}[4/6]${NC} 上传项目文件..."
rsync -avz -e "ssh -p $SSH_PORT" \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env' \
    --exclude 'logs' \
    --exclude '*.log' \
    --exclude 'last_tweet_id.txt' \
    ./ $SSH_USER@$SERVER_IP:$REMOTE_PATH/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} 文件上传完成"
else
    echo -e "${RED}✗${NC} 文件上传失败"
    exit 1
fi

# 5. 检查 .env 文件
echo -e "\n${GREEN}[5/6]${NC} 检查配置文件..."
ENV_EXISTS=$(ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "[ -f $REMOTE_PATH/.env ] && echo 'yes' || echo 'no'")

if [ "$ENV_EXISTS" == "no" ]; then
    echo -e "${YELLOW}⚠${NC} .env 文件不存在"
    read -p "是否上传本地 .env 文件？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -f ".env" ]; then
            scp -P $SSH_PORT .env $SSH_USER@$SERVER_IP:$REMOTE_PATH/
            echo -e "${GREEN}✓${NC} .env 文件已上传"
        else
            echo -e "${RED}✗${NC} 本地 .env 文件不存在"
            echo -e "${YELLOW}请在服务器上手动创建 .env 文件${NC}"
        fi
    else
        echo -e "${YELLOW}请在服务器上手动创建 .env 文件${NC}"
    fi
fi

# 6. 执行远程部署脚本
echo -e "\n${GREEN}[6/6]${NC} 执行部署脚本..."
ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "cd $REMOTE_PATH && chmod +x deploy.sh && ./deploy.sh"

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║   部署完成！                                  ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}常用命令:${NC}"
echo "  连接服务器:     ssh -p $SSH_PORT $SSH_USER@$SERVER_IP"
echo "  查看日志:       ssh -p $SSH_PORT $SSH_USER@$SERVER_IP 'pm2 logs twitter-monitor'"
echo "  重启应用:       ssh -p $SSH_PORT $SSH_USER@$SERVER_IP 'pm2 restart twitter-monitor'"
echo ""
