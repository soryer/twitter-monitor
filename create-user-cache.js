#!/usr/bin/env node
/**
 * 手动创建用户缓存工具
 * 用于在遇到 API 速率限制时，手动输入用户信息
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   手动创建用户缓存工具');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('   如何获取用户信息：');
  console.log('   1. 访问 https://tweeterid.com/');
  console.log('   2. 输入 Twitter 用户名（不带 @）');
  console.log('   3. 获取用户 ID 和显示名称\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const users = [];
  let addMore = true;

  while (addMore) {
    const userId = await question('请输入用户 ID: ');
    const username = await question('请输入用户名（不带 @）: ');
    const displayName = await question('请输入显示名称: ');

    users.push({
      id: userId.trim(),
      username: username.trim(),
      name: displayName.trim()
    });

    console.log(`\n✓ 已添加: ${displayName} (@${username})\n`);

    const more = await question('是否继续添加用户？(y/n): ');
    addMore = more.toLowerCase() === 'y';
    console.log('');
  }

  // 保存到文件
  const cacheFile = path.join(__dirname, 'user_cache.json');
  const cache = {
    timestamp: Date.now(),
    users: users
  };

  try {
    fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   ✅ 成功创建用户缓存！\n');
    console.log(`   文件位置: ${cacheFile}`);
    console.log(`   缓存用户数: ${users.length}`);
    console.log(`   缓存有效期: 24 小时\n`);
    console.log('   用户列表:');
    users.forEach(user => {
      console.log(`   - ${user.name} (@${user.username}) [${user.id}]`);
    });
    console.log('\n   现在可以重启监控程序了！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error(`\n❌ 保存失败: ${error.message}\n`);
    process.exit(1);
  }

  rl.close();
}

main().catch(error => {
  console.error(`\n❌ 错误: ${error.message}\n`);
  rl.close();
  process.exit(1);
});
