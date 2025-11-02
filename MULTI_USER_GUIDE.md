# 多用户监控指南

## 📝 配置多个用户

Twitter Monitor 现在支持同时监控多个 Twitter 用户！

### 方法：在 .env 文件中配置

编辑 `.env` 文件，在 `TWITTER_USERNAME` 中使用**逗号分隔**多个用户名：

```env
# 单个用户
TWITTER_USERNAME=cz_binance

# 多个用户（用逗号分隔，注意不要有空格）
TWITTER_USERNAME=cz_binance,elonmusk,vitalikbuterin

# 或者（可以有空格，程序会自动处理）
TWITTER_USERNAME=cz_binance, elonmusk, vitalikbuterin
```

## 🚀 使用示例

### 示例 1：监控 3 个加密货币 KOL

```env
TWITTER_USERNAME=cz_binance,vitalikbuterin,brian_armstrong
```

### 示例 2：监控多个名人

```env
TWITTER_USERNAME=elonmusk,BillGates,BarackObama
```

### 示例 3：监控行业专家

```env
TWITTER_USERNAME=naval,balajis,punk6529
```

## 📊 运行效果

启动后会显示：

```
🔍 正在获取用户信息...
   监控用户: cz_binance, elonmusk, vitalikbuterin

   正在获取 @cz_binance 的信息...
   ✓ CZ 🔶 BNB (@cz_binance)
     ID: 902926941413453824
     粉丝数: 9500000

   正在获取 @elonmusk 的信息...
   ✓ Elon Musk (@elonmusk)
     ID: 44196397
     粉丝数: 180000000

   正在获取 @vitalikbuterin 的信息...
   ✓ vitalik.eth (@VitalikButerin)
     ID: 295218901
     粉丝数: 5200000

✅ 所有用户信息获取成功！共 3 个用户

🚀 开始监控 3 个用户:
   • @cz_binance (CZ 🔶 BNB)
   • @elonmusk (Elon Musk)
   • @vitalikbuterin (vitalik.eth)

⏱️  检查间隔: 60 秒
```

## 📱 通知效果

每个用户的推文都会独立发送通知到 Telegram，格式为：

```
🚨 新推文提醒 🚨

👤 用户: CZ 🔶 BNB (@cz_binance)
📅 时间: 2025/11/02 14:30:00

📝 内容:
GM! Have a great weekend everyone!

🔗 链接: https://twitter.com/cz_binance/status/...
```

## ⚙️ 工作原理

1. **独立追踪**：每个用户的最新推文 ID 独立保存在 `last_tweet_id.json` 文件中
2. **轮询检查**：按顺序检查所有用户的新推文
3. **智能去重**：每个用户的推文独立去重，不会重复通知

### 数据文件格式

`last_tweet_id.json` 文件内容示例：

```json
{
  "cz_binance": "1234567890123456789",
  "elonmusk": "9876543210987654321",
  "vitalikbuterin": "5555555555555555555"
}
```

## 📈 性能考虑

### API 限制

Twitter API 有速率限制：
- **免费版本**：15 次请求 / 15 分钟
- **基础版本**：300 次请求 / 15 分钟

### 建议配置

根据监控用户数量调整检查间隔：

| 用户数量 | 建议间隔 | API 调用频率 |
|---------|---------|-------------|
| 1-2 个   | 30-60 秒 | 2-4 次/分钟 |
| 3-5 个   | 60-90 秒 | 3-5 次/分钟 |
| 6-10 个  | 90-120 秒| 5-10 次/分钟|
| 10+ 个   | 120+ 秒  | 需要付费 API|

### 配置检查间隔

在 `.env` 文件中调整：

```env
# 监控 1-2 个用户
CHECK_INTERVAL=60000

# 监控 3-5 个用户
CHECK_INTERVAL=90000

# 监控 6-10 个用户
CHECK_INTERVAL=120000
```

## 💡 最佳实践

### 1. 合理数量

建议监控 **3-5 个用户**：
- ✅ API 限制内
- ✅ 通知不会太频繁
- ✅ 管理更容易

### 2. 重要用户优先

如果要监控很多用户，考虑：
- 按重要性分组
- 重要用户单独部署（短间隔）
- 次要用户合并部署（长间隔）

### 3. 分组策略

**方案 A：按主题分组**
- 实例 1：加密货币 KOL
- 实例 2：科技公司 CEO
- 实例 3：政治人物

**方案 B：按重要性分组**
- 实例 1（30秒）：最重要的 1-2 个用户
- 实例 2（60秒）：重要的 3-5 个用户
- 实例 3（120秒）：一般关注的 10+ 个用户

## 🔧 管理命令

### 查看监控状态

```bash
# 查看日志
pm2 logs twitter-monitor

# 应该看到类似输出：
# [14:30:25] ✓ 已检查所有用户，暂无新推文
# 
# 🆕 @cz_binance 发现 1 条新推文！
# 📨 推文 ID: 1234567890
#    用户: @cz_binance
#    内容: GM! ...
```

### 修改监控用户

```bash
# 1. 停止应用
pm2 stop twitter-monitor

# 2. 编辑配置
vi .env
# 修改 TWITTER_USERNAME=...

# 3. 删除旧的记录文件（重新初始化）
rm last_tweet_id.json

# 4. 重启应用
pm2 restart twitter-monitor
```

### 添加新用户

```bash
# 1. 停止应用
pm2 stop twitter-monitor

# 2. 编辑配置，添加新用户
vi .env
# TWITTER_USERNAME=cz_binance,elonmusk,新用户名

# 3. 重启应用（会自动为新用户初始化）
pm2 restart twitter-monitor
```

## 🚨 注意事项

### 1. 用户名格式

- ✅ **正确**：`cz_binance,elonmusk,vitalikbuterin`
- ✅ **正确**：`cz_binance, elonmusk, vitalikbuterin`（允许空格）
- ❌ **错误**：`@cz_binance,@elonmusk`（不要加 @）
- ❌ **错误**：`cz_binance;elonmusk`（不要用分号）

### 2. API 限制

监控太多用户可能触发 API 限制：
- 免费版：建议不超过 3 个用户
- 基础版：建议不超过 10 个用户
- 如需更多，考虑使用付费 API 或分多个实例

### 3. Telegram 通知频率

如果监控的用户发推频繁，Telegram 消息可能很多：
- 可以创建专门的通知群组
- 设置消息免打扰
- 只监控真正重要的用户

## 📊 示例配置

### 完整的多用户配置

```env
# Twitter API
TWITTER_BEARER_TOKEN=your_token_here

# 监控 3 个加密货币 KOL
TWITTER_USERNAME=cz_binance,vitalikbuterin,brian_armstrong

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# 代理（如需要）
HTTP_PROXY=http://proxy:port
HTTPS_PROXY=http://proxy:port

# 3 个用户，90 秒检查一次
CHECK_INTERVAL=90000
```

## 🎯 快速开始

1. **编辑配置**
   ```bash
   vi .env
   ```

2. **添加多个用户（用逗号分隔）**
   ```env
   TWITTER_USERNAME=user1,user2,user3
   ```

3. **重启应用**
   ```bash
   pm2 restart twitter-monitor
   ```

4. **查看日志确认**
   ```bash
   pm2 logs twitter-monitor
   ```

---

**就是这么简单！** 🎉

现在你可以同时监控多个 Twitter 用户的推文了！
