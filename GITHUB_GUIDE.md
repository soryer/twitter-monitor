# 🚀 GitHub 部署指南

本文档说明如何将 Twitter Monitor 推送到 GitHub 并在远程服务器上使用。

---

## 📦 推送到 GitHub

### 方法 1：通过 GitHub 网页创建仓库（推荐）

#### 步骤 1：在 GitHub 创建新仓库

1. 登录 GitHub (https://github.com)
2. 点击右上角 "+" → "New repository"
3. 填写仓库信息：
   - **Repository name**: `twitter-monitor`（或其他名称）
   - **Description**: `Twitter 推特监控系统 - 实时监控并推送到 Telegram`
   - **Public** 或 **Private**（建议选 Private，因为包含配置信息）
   - ⚠️ **不要**勾选 "Add a README file"（我们已经有了）
   - ⚠️ **不要**勾选 "Add .gitignore"（我们已经有了）
4. 点击 "Create repository"

#### 步骤 2：推送代码到 GitHub

GitHub 会显示命令，但你可以直接使用以下命令：

```bash
cd /Users/soyosan/Projkt/twitter-monitor

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/twitter-monitor.git

# 推送代码
git branch -M main
git push -u origin main
```

例如，如果你的 GitHub 用户名是 `soryer`：
```bash
git remote add origin https://github.com/soryer/twitter-monitor.git
git branch -M main
git push -u origin main
```

### 方法 2：使用 GitHub CLI（如果已安装）

```bash
cd /Users/soyosan/Projkt/twitter-monitor

# 创建私有仓库并推送
gh repo create twitter-monitor --private --source=. --push

# 或创建公开仓库并推送
gh repo create twitter-monitor --public --source=. --push
```

---

## 🖥️ 在远程服务器上使用

### 方式 1：直接从 GitHub 克隆

```bash
# 登录服务器
ssh root@your-server-ip

# 克隆仓库（替换为你的 GitHub 用户名）
git clone https://github.com/YOUR_USERNAME/twitter-monitor.git
cd twitter-monitor

# 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 方式 2：使用私有仓库（需要认证）

#### 选项 A：使用 Personal Access Token（推荐）

1. **生成 Token**
   - 访问 https://github.com/settings/tokens
   - 点击 "Generate new token" → "Generate new token (classic)"
   - 选择权限：`repo`（全部勾选）
   - 点击 "Generate token"
   - **复制并保存** Token（只显示一次）

2. **在服务器上克隆**
   ```bash
   # 使用 Token 克隆（替换 TOKEN 和 YOUR_USERNAME）
   git clone https://TOKEN@github.com/YOUR_USERNAME/twitter-monitor.git
   
   # 例如：
   # git clone https://ghp_xxxxxxxxxxxx@github.com/soryer/twitter-monitor.git
   ```

#### 选项 B：使用 SSH 密钥

1. **在服务器上生成 SSH 密钥**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   cat ~/.ssh/id_ed25519.pub
   ```

2. **添加到 GitHub**
   - 复制公钥内容
   - 访问 https://github.com/settings/keys
   - 点击 "New SSH key"
   - 粘贴公钥，点击 "Add SSH key"

3. **克隆仓库**
   ```bash
   git clone git@github.com:YOUR_USERNAME/twitter-monitor.git
   ```

---

## 🔄 更新代码

### 在本地更新后推送到 GitHub

```bash
cd /Users/soyosan/Projkt/twitter-monitor

# 添加更改
git add .

# 提交
git commit -m "更新说明"

# 推送
git push
```

### 在服务器上拉取更新

```bash
# 登录服务器
ssh root@your-server-ip

# 进入项目目录
cd /root/twitter-monitor

# 拉取最新代码
git pull

# 安装新依赖（如有）
npm install --production

# 重启应用
pm2 restart twitter-monitor
```

### 自动更新脚本

项目已包含 `update.sh` 脚本，可以一键更新：

```bash
ssh root@your-server-ip "cd /root/twitter-monitor && ./update.sh"
```

---

## 🔒 安全建议

### 1. 使用私有仓库

如果仓库包含敏感信息或配置，建议设为私有：
- 在 GitHub 仓库设置中
- Settings → Danger Zone → Change visibility → Make private

### 2. 不要提交敏感文件

`.gitignore` 已配置忽略以下文件：
- `.env` - 环境变量（包含 Token）
- `node_modules/` - 依赖包
- `*.log` - 日志文件
- `last_tweet_id.json` - 推文记录

### 3. 配置文件管理

**在服务器上手动创建 `.env` 文件：**

```bash
# 克隆后
cd twitter-monitor

# 复制示例文件
cp .env.example .env

# 编辑配置
vi .env
# 填入你的 Token
```

**或者从本地安全上传：**

```bash
# 在本地
scp .env root@your-server-ip:/root/twitter-monitor/
```

---

## 📚 完整部署流程

### 场景：首次部署到新服务器

```bash
# 1. 在本地推送到 GitHub
cd /Users/soyosan/Projkt/twitter-monitor
git remote add origin https://github.com/YOUR_USERNAME/twitter-monitor.git
git push -u origin main

# 2. 登录服务器
ssh root@your-server-ip

# 3. 克隆仓库
git clone https://github.com/YOUR_USERNAME/twitter-monitor.git
cd twitter-monitor

# 4. 配置环境变量
cp .env.example .env
vi .env
# 填入你的配置

# 5. 运行部署脚本
chmod +x deploy.sh
./deploy.sh

# 6. 完成！查看状态
pm2 status
pm2 logs twitter-monitor
```

### 场景：代码更新后重新部署

```bash
# 1. 在本地推送更新
cd /Users/soyosan/Projkt/twitter-monitor
git add .
git commit -m "更新功能"
git push

# 2. 在服务器上更新
ssh root@your-server-ip
cd /root/twitter-monitor
./update.sh

# 或者手动更新
git pull
npm install --production
pm2 restart twitter-monitor
```

---

## 🌟 GitHub 仓库设置建议

### 1. 添加 README 徽章

在 README.md 顶部添加徽章（可选）：

```markdown
![Node.js](https://img.shields.io/badge/Node.js-16+-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Status](https://img.shields.io/badge/Status-Production-success)
```

### 2. 添加 Topics

在 GitHub 仓库页面添加相关标签：
- `twitter`
- `telegram`
- `monitor`
- `nodejs`
- `automation`

### 3. 设置 Branch Protection（可选）

Settings → Branches → Add rule:
- 保护 `main` 分支
- 需要 Pull Request 审查

---

## 🎯 快速命令参考

```bash
# === 本地操作 ===

# 查看状态
git status

# 提交更改
git add .
git commit -m "更新说明"
git push

# 查看日志
git log --oneline

# === 服务器操作 ===

# 克隆仓库
git clone https://github.com/YOUR_USERNAME/twitter-monitor.git

# 拉取更新
git pull

# 查看远程仓库
git remote -v

# === 一键更新 ===

# 在服务器上
cd /root/twitter-monitor && ./update.sh
```

---

## ❓ 常见问题

### Q1: 推送时要求输入用户名和密码？

**A:** GitHub 已不支持密码认证，请使用 Personal Access Token：

```bash
# 用户名：你的 GitHub 用户名
# 密码：使用 Personal Access Token（不是 GitHub 密码）
```

### Q2: 如何更改远程仓库地址？

```bash
# 查看当前远程仓库
git remote -v

# 更改地址
git remote set-url origin https://github.com/NEW_USERNAME/twitter-monitor.git
```

### Q3: 克隆私有仓库失败？

**A:** 使用 Personal Access Token 或 SSH 密钥，详见上面的说明。

### Q4: 如何删除已提交的敏感文件？

```bash
# 从 Git 历史中删除文件（谨慎操作！）
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 强制推送
git push origin --force --all
```

---

## 📞 需要帮助？

- 📖 查看 [GitHub 文档](https://docs.github.com)
- 💬 查看 [Git 基础教程](https://git-scm.com/book/zh/v2)

---

**准备好了吗？开始推送到 GitHub 吧！** 🚀
