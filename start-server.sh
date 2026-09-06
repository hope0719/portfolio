#!/bin/bash
# 个人作品集 · 局域网访问服务启动脚本
# 用法: ./start-server.sh [端口]   默认端口 8000
set -u

PORT="${1:-8000}"
DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$DIR/.server.pid"
LOG_FILE="$DIR/.server.log"
PY="/Users/hope/.workbuddy/binaries/python/versions/3.13.12/bin/python3"

# 自动探测内网 IP（优先 Wi-Fi en0，其次有线 en1..en3）
LAN_IP=""
for iface in en0 en1 en2 en3; do
  ip="$(ipconfig getifaddr "$iface" 2>/dev/null)"
  if [ -n "$ip" ]; then LAN_IP="$ip"; break; fi
done

if [ -z "$LAN_IP" ]; then
  echo "未检测到局域网 IP，请确认已连接 Wi-Fi 或有线网络。"
  exit 1
fi

# 端口占用检查
if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "端口 $PORT 已被占用，请换一个端口，例如: $0 8123"
  exit 1
fi

cd "$DIR" || exit 1
nohup "$PY" -m http.server "$PORT" --bind "$LAN_IP" > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"

sleep 1.2

if ! kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "服务启动失败，日志如下："
  tail -n 20 "$LOG_FILE"
  rm -f "$PID_FILE"
  exit 1
fi

echo ""
echo "  服务已启动 (PID $(cat "$PID_FILE"))"
echo "  ────────────────────────────────────────"
echo "  本机访问:     http://127.0.0.1:$PORT"
echo "  局域网访问:   http://$LAN_IP:$PORT"
echo "  ────────────────────────────────────────"
echo "  停止服务: ./stop-server.sh"
echo ""
