#!/usr/bin/env bash
# Apple Marketing Design Language — 安装脚本
# 用法: ./install.sh [--target claude|codex|cursor|gemini|dir] [--dir <路径>]

set -euo pipefail

SKILL_NAME="apple-marketing-design"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

TARGET="claude"
CUSTOM_DIR=""

usage() {
  cat <<'EOF'
用法: ./install.sh [选项]

选项:
  --target <name>   安装目标，默认 claude
                      claude  安装到 ~/.claude/skills/
                      codex   安装到 ./.agent-skills/（配 AGENTS.md）
                      cursor  安装到 ./.agent-skills/（配 .cursor/rules/）
                      gemini  安装到 ./.agent-skills/（配 GEMINI.md）
                      dir     安装到 --dir 指定的目录
  --dir <path>      配合 --target dir 使用，指定技能目录的父目录
  -h, --help        显示本帮助

示例:
  ./install.sh
  ./install.sh --target codex
  ./install.sh --target dir --dir "$HOME/.config/my-agent/skills"
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) TARGET="${2:-}"; shift 2 ;;
    --dir)    CUSTOM_DIR="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "未知参数: $1" >&2; usage; exit 1 ;;
  esac
done

case "$TARGET" in
  claude) DEST="$HOME/.claude/skills/$SKILL_NAME" ;;
  codex|cursor|gemini) DEST="$PWD/.agent-skills/$SKILL_NAME" ;;
  dir)
    if [[ -z "$CUSTOM_DIR" ]]; then
      echo "错误: --target dir 需要同时指定 --dir <路径>" >&2
      exit 1
    fi
    DEST="$CUSTOM_DIR/$SKILL_NAME"
    ;;
  *)
    echo "错误: 不支持的 target「$TARGET」" >&2
    usage
    exit 1
    ;;
esac

if [[ ! -f "$SRC_DIR/SKILL.md" ]]; then
  echo "错误: 在 $SRC_DIR 下找不到 SKILL.md，请在仓库目录内运行本脚本" >&2
  exit 1
fi

# 安全护栏：仅当目标目录确实是本技能时才覆盖
if [[ -e "$DEST" ]]; then
  if [[ -f "$DEST/SKILL.md" ]] && grep -q "^name: $SKILL_NAME" "$DEST/SKILL.md" 2>/dev/null; then
    echo "检测到已安装版本，将覆盖: $DEST"
    rm -rf "$DEST"
  else
    echo "错误: $DEST 已存在且不是本技能，为避免误删已中止。" >&2
    echo "请先手动移走该目录，或改用 --target dir --dir <其他路径>" >&2
    exit 1
  fi
fi

mkdir -p "$(dirname "$DEST")"

if command -v rsync >/dev/null 2>&1; then
  rsync -a --exclude '.git' --exclude 'install' --exclude 'README.md' \
        --exclude 'LICENSE' --exclude 'CHANGELOG.md' \
        "$SRC_DIR"/ "$DEST"/
else
  mkdir -p "$DEST"
  cp -R "$SRC_DIR"/SKILL.md "$SRC_DIR"/references "$SRC_DIR"/assets "$SRC_DIR"/scripts "$DEST"/
fi

echo "已安装到: $DEST"
echo

case "$TARGET" in
  claude)
    echo "下一步: 重启会话，然后用自然语言描述任务即可，例如"
    echo "  「做一个产品落地页，风格要极简、大留白」"
    ;;
  codex)
    echo "下一步: 在项目根目录的 AGENTS.md 中加入一行"
    echo "  - 设计类任务请先阅读 .agent-skills/$SKILL_NAME/SKILL.md"
    ;;
  cursor)
    echo "下一步: 新建 .cursor/rules/$SKILL_NAME.mdc，内容为"
    echo "  ---"
    echo "  description: Apple 风格营销设计规范"
    echo "  alwaysApply: false"
    echo "  ---"
    echo "  设计类任务请先阅读 .agent-skills/$SKILL_NAME/SKILL.md"
    ;;
  gemini)
    echo "下一步: 在 GEMINI.md 中加入一行"
    echo "  - 设计类任务请先阅读 .agent-skills/$SKILL_NAME/SKILL.md"
    ;;
  dir)
    echo "下一步: 在你的工具中把该目录注册为技能目录。"
    ;;
esac
