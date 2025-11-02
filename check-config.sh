#!/bin/bash

###############################################################################
# 配置检查脚本
# 检查 .env 文件是否配置正确
###############################################################################

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "╔═══════════════════════════════════════════════╗"
echo "║   配置文件检查工具                            ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# 检查 .env 文件是否存在
if [ ! -f ".env" ]; then
    echo -e "${RED}✗ .env 文件不存在${NC}"
    echo ""
    if [ -f ".env.example" ]; then
        echo "建议："
        echo "  1. 复制示例文件: cp .env.example .env"
        echo "  2. 编辑配置文件: vi .env"
        echo "  3. 填入必要的配置项"
    fi
    exit 1
fi

echo -e "${GREEN}✓ .env 文件存在${NC}"
echo ""

# 检查必需的配置项
MISSING_CONFIGS=()
WARNINGS=()

echo "检查必需配置项："

# Twitter Bearer Token
if grep -q "^TWITTER_BEARER_TOKEN=.\+$" .env; then
    TOKEN=$(grep "^TWITTER_BEARER_TOKEN=" .env | cut -d'=' -f2)
    if [ "$TOKEN" != "your_twitter_bearer_token_here" ] && [ -n "$TOKEN" ]; then
        echo -e "  ${GREEN}✓${NC} TWITTER_BEARER_TOKEN 已配置"
    else
        echo -e "  ${RED}✗${NC} TWITTER_BEARER_TOKEN 未配置或使用默认值"
        MISSING_CONFIGS+=("TWITTER_BEARER_TOKEN")
    fi
else
    echo -e "  ${RED}✗${NC} TWITTER_BEARER_TOKEN 缺失"
    MISSING_CONFIGS+=("TWITTER_BEARER_TOKEN")
fi

# Twitter Username
if grep -q "^TWITTER_USERNAME=.\+$" .env; then
    USERNAME=$(grep "^TWITTER_USERNAME=" .env | cut -d'=' -f2)
    echo -e "  ${GREEN}✓${NC} TWITTER_USERNAME: $USERNAME"
else
    echo -e "  ${YELLOW}⚠${NC} TWITTER_USERNAME 未配置，将使用默认值"
    WARNINGS+=("TWITTER_USERNAME")
fi

# Telegram Bot Token
if grep -q "^TELEGRAM_BOT_TOKEN=.\+$" .env; then
    TOKEN=$(grep "^TELEGRAM_BOT_TOKEN=" .env | cut -d'=' -f2)
    if [ "$TOKEN" != "your_telegram_bot_token_here" ] && [ -n "$TOKEN" ]; then
        echo -e "  ${GREEN}✓${NC} TELEGRAM_BOT_TOKEN 已配置"
    else
        echo -e "  ${RED}✗${NC} TELEGRAM_BOT_TOKEN 未配置或使用默认值"
        MISSING_CONFIGS+=("TELEGRAM_BOT_TOKEN")
    fi
else
    echo -e "  ${RED}✗${NC} TELEGRAM_BOT_TOKEN 缺失"
    MISSING_CONFIGS+=("TELEGRAM_BOT_TOKEN")
fi

# Telegram Chat ID
if grep -q "^TELEGRAM_CHAT_ID=.\+$" .env; then
    CHAT_ID=$(grep "^TELEGRAM_CHAT_ID=" .env | cut -d'=' -f2)
    if [ "$CHAT_ID" != "your_telegram_chat_id_here" ] && [ -n "$CHAT_ID" ]; then
        echo -e "  ${GREEN}✓${NC} TELEGRAM_CHAT_ID 已配置"
    else
        echo -e "  ${RED}✗${NC} TELEGRAM_CHAT_ID 未配置或使用默认值"
        MISSING_CONFIGS+=("TELEGRAM_CHAT_ID")
    fi
else
    echo -e "  ${RED}✗${NC} TELEGRAM_CHAT_ID 缺失"
    MISSING_CONFIGS+=("TELEGRAM_CHAT_ID")
fi

echo ""
echo "检查可选配置项："

# HTTP Proxy
if grep -q "^HTTP_PROXY=.\+$" .env; then
    PROXY=$(grep "^HTTP_PROXY=" .env | cut -d'=' -f2)
    if [ "$PROXY" != "http://username:password@ip:1337" ]; then
        echo -e "  ${GREEN}✓${NC} HTTP_PROXY 已配置"
    else
        echo -e "  ${YELLOW}⚠${NC} HTTP_PROXY 使用示例值"
    fi
else
    echo -e "  ${YELLOW}⚠${NC} HTTP_PROXY 未配置（如需代理请配置）"
fi

# HTTPS Proxy
if grep -q "^HTTPS_PROXY=.\+$" .env; then
    PROXY=$(grep "^HTTPS_PROXY=" .env | cut -d'=' -f2)
    if [ "$PROXY" != "http://username:password@ip:1337" ]; then
        echo -e "  ${GREEN}✓${NC} HTTPS_PROXY 已配置"
    else
        echo -e "  ${YELLOW}⚠${NC} HTTPS_PROXY 使用示例值"
    fi
else
    echo -e "  ${YELLOW}⚠${NC} HTTPS_PROXY 未配置（如需代理请配置）"
fi

# Check Interval
if grep -q "^CHECK_INTERVAL=.\+$" .env; then
    INTERVAL=$(grep "^CHECK_INTERVAL=" .env | cut -d'=' -f2)
    echo -e "  ${GREEN}✓${NC} CHECK_INTERVAL: ${INTERVAL}ms ($((INTERVAL/1000))秒)"
else
    echo -e "  ${YELLOW}⚠${NC} CHECK_INTERVAL 未配置，将使用默认值(60秒)"
fi

# 汇总结果
echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║   检查结果                                    ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

if [ ${#MISSING_CONFIGS[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ 所有必需配置项都已配置！${NC}"
    echo ""
    echo "下一步："
    echo "  本地运行: npm start"
    echo "  或"
    echo "  部署到服务器: ./quick-deploy.sh"
    exit 0
else
    echo -e "${RED}✗ 缺少以下必需配置项：${NC}"
    for config in "${MISSING_CONFIGS[@]}"; do
        echo "  - $config"
    done
    echo ""
    echo "请编辑 .env 文件并填入正确的值："
    echo "  vi .env"
    echo ""
    echo "或者使用其他编辑器："
    echo "  nano .env"
    echo "  code .env"
    exit 1
fi
