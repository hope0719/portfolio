#!/bin/bash
# 个人作品集 · 一键更新到 GitHub Pages
#
# 说明：桌面目录受 macOS TCC 保护，无法直接创建 .git，
#       因此采用「/tmp 工作副本中转」的方式推送。
# 用法: ./deploy-update.sh "提交说明"（说明可省略，默认按时间生成）
set -u

SRC="$(cd "$(dirname "$0")" && pwd)"
WORK="/tmp/pf-deploy"
REPO="https://github.com/hope0719/portfolio.git"
MSG="${1:-更新作品集 $(date '+%Y-%m-%d %H:%M')}"

# 自愈：/tmp 被清理时重新克隆
if [ ! -d "$WORK/.git" ]; then
  echo "工作副本不存在，正在克隆 $REPO ..."
  rm -rf "$WORK"
  git clone -q "$REPO" "$WORK" || { echo "克隆失败，请检查网络或 gh 登录状态。"; exit 1; }
fi

# 同步文件（排除本地服务临时文件）
rsync -a --delete \
  --exclude '.git' --exclude '.DS_Store' \
  --exclude '.server.pid' --exclude '.server.log' \
  "$SRC/" "$WORK/"

cd "$WORK" || exit 1
git add -A

if git diff --cached --quiet; then
  echo "没有内容变化，无需提交。"
  exit 0
fi

git -c user.name=hope0719 -c user.email=hope0719@users.noreply.github.com \
  commit -q -m "$MSG"
git push -q origin main

echo ""
echo "  ✅ 已推送到 GitHub"
echo "  仓库: https://github.com/hope0719/portfolio"
echo "  线上: https://hope0719.github.io/portfolio/"
echo "  （GitHub Pages 重新构建约需 30-60 秒生效）"
echo ""
