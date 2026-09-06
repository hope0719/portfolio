#!/bin/bash
# 停止作品集局域网服务
set -u

DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$DIR/.server.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "未找到 PID 文件，服务可能未运行。"
  exit 0
fi

PID="$(cat "$PID_FILE")"

if kill -0 "$PID" 2>/dev/null; then
  kill "$PID" && echo "已停止服务 (PID $PID)"
else
  echo "进程 $PID 已不存在，清理 PID 文件。"
fi

rm -f "$PID_FILE"
