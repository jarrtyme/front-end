#!/bin/bash
# 字体转换脚本
# 将 TTF 字体文件转换为 WOFF2 和 WOFF 格式（网页优化格式）

set -e

FONT_DIR="$(cd "$(dirname "$0")" && pwd)"
TTF_FILE="$FONT_DIR/SF-Pro.ttf"

echo "开始转换字体文件..."

# 检查 fonttools 是否安装
if ! command -v pyftsubset &> /dev/null && ! python3 -c "import fontTools" 2>/dev/null; then
    echo "正在安装 fonttools..."
    pip3 install fonttools --user
    export PATH="$HOME/Library/Python/3.9/bin:$PATH"
fi

# 检查文件是否存在
if [ ! -f "$TTF_FILE" ]; then
    echo "错误: 找不到 $TTF_FILE"
    exit 1
fi

# 转换为 WOFF2
echo "转换为 WOFF2 格式..."
python3 -m fontTools.woff2 compress "$TTF_FILE" -o "$FONT_DIR/SF-Pro.woff2" 2>/dev/null || \
pyftsubset "$TTF_FILE" --output-file="$FONT_DIR/SF-Pro.woff2" --flavor=woff2 2>/dev/null || \
echo "警告: WOFF2 转换失败，将使用 TTF 格式"

# 转换为 WOFF
echo "转换为 WOFF 格式..."
python3 -m fontTools.woff compress "$TTF_FILE" -o "$FONT_DIR/SF-Pro.woff" 2>/dev/null || \
pyftsubset "$TTF_FILE" --output-file="$FONT_DIR/SF-Pro.woff" --flavor=woff 2>/dev/null || \
echo "警告: WOFF 转换失败，将使用 TTF 格式"

echo "转换完成！"
echo "生成的文件:"
ls -lh "$FONT_DIR"/SF-Pro.* 2>/dev/null || true

