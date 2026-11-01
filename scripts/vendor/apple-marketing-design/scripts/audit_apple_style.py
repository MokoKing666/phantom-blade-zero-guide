#!/usr/bin/env python3
"""
Apple 宣传设计语言 · 合规校验器

用法:
    python audit_style.py <文件或目录> [更多文件...]
    python audit_style.py ./dist --json

检查项:
    色值    是否越出规范色板
    字重    是否出现 700 以上
    行距    是否符合 1.0/1.1/1.2/1.5/1.8
    间距    是否为 4 的倍数
    字体族  是否混入禁止字体
    文案    感叹号 / 黑话 / 过长句子

退出码: 0 = PASS 或仅有 WARN, 1 = 存在 FAIL
"""

import argparse
import json
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------- 规范定义

NEUTRAL = {
    "#000000", "#171918", "#1d1d1f", "#6c6b6f", "#86868b",
    "#d2d2d7", "#f5f5f7", "#f6f5f8", "#ffffff",
}

ACCENT = {
    "#147d89", "#db404d", "#42a288", "#0031ea", "#6c41e6",
}

GRADIENT = {
    "#eca9ff", "#bf67ff", "#a2daff",
    "#f6d3bd", "#cc9cd7", "#8a9aff",
    "#d5f1e2", "#0bdb60",
}

PALETTE = NEUTRAL | ACCENT | GRADIENT

ALLOWED_WEIGHTS = {100, 200, 300, 400, 500, 600, "lighter", "normal", "bold"}

# 行距按区间判定：标题 1.0–1.25 / 氛围 1.45–1.60 / 信息 1.75–1.85
LINE_HEIGHT_RANGES = [(1.0, 1.25), (1.45, 1.60), (1.75, 1.85)]

BANNED_FONTS = [
    "comic sans", "arial black", "impact", "papyrus",
    "微软雅黑", "宋体", "楷体", "仿宋", "华文行楷", "幼圆",
]

BANNED_WORDS = [
    "赋能", "闭环", "生态化反", "全链路", "底层逻辑",
    "极致体验", "重新定义", "颠覆", "遥遥领先",
]

CSS_EXTS = {".css", ".scss", ".less"}
MARKUP_EXTS = {".html", ".htm", ".svg", ".jsx", ".tsx", ".vue", ".svelte"}

# ---------------------------------------------------------------- 收集文件


def collect(targets):
    files = []
    for t in targets:
        p = Path(t)
        if p.is_dir():
            for ext in CSS_EXTS | MARKUP_EXTS:
                files.extend(p.rglob(f"*{ext}"))
        elif p.is_file():
            files.append(p)
    return sorted({f.resolve() for f in files})


# ---------------------------------------------------------------- 检查逻辑


class Report:
    def __init__(self):
        self.items = []

    def add(self, level, path, line, rule, msg):
        self.items.append({
            "level": level,
            "file": str(path),
            "line": line,
            "rule": rule,
            "message": msg,
        })

    @property
    def fails(self):
        return [i for i in self.items if i["level"] == "FAIL"]

    @property
    def warns(self):
        return [i for i in self.items if i["level"] == "WARN"]


def lineno(text, pos):
    return text.count("\n", 0, pos) + 1


def _in_derived_context(text, pos, window=140):
    """渐变 / 阴影 / 滤镜里的中间色属于合理派生，不计入越界。"""
    start = max(0, pos - window)
    ctx = text[start:pos].lower()
    return any(k in ctx for k in ("gradient(", "shadow", "filter:", "blur("))


def check_colors(path, text, rep):
    for m in re.finditer(r"#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b", text):
        raw = m.group(0).lower()
        if len(raw) == 4:  # #fff -> #ffffff
            raw = "#" + "".join(c * 2 for c in raw[1:])
        if raw in PALETTE:
            continue
        if _in_derived_context(text, m.start()):
            continue
        rep.add(
            "WARN", path, lineno(text, m.start()), "color",
            f"色值 {raw} 不在规范色板内。确认它取自产品图，或改用 "
            f"#1D1D1F / #6C6B6F / #147D89 等规范色。",
        )


def check_weights(path, text, rep):
    for m in re.finditer(r"font-weight\s*:\s*([^;}\n]+)", text, re.I):
        val = m.group(1).strip().lower()
        num = re.match(r"(\d{3})", val)
        if num and int(num.group(1)) >= 700:
            rep.add(
                "FAIL", path, lineno(text, m.start()), "weight",
                f"font-weight: {val} 超过 Semibold(600)。Apple 最高只用 600，"
                f"加粗会破坏层级。",
            )


def check_line_height(path, text, rep):
    for m in re.finditer(r"line-height\s*:\s*([\d.]+)\s*(?=[;}\s]|$)", text, re.I):
        try:
            val = float(m.group(1))
        except ValueError:
            continue
        if val < 1.0 or val > 3.0:
            continue  # px 值或其他单位，跳过
        if any(lo <= val <= hi for lo, hi in LINE_HEIGHT_RANGES):
            continue
        rep.add(
            "WARN", path, lineno(text, m.start()), "line-height",
            f"line-height: {val} 落在空档。标题用 1.0–1.25，氛围型(Light) 用 "
            f"1.45–1.6，信息型(Regular) 用 1.75–1.85。",
        )


def check_spacing(path, text, rep):
    props = r"(?:padding|margin|gap|row-gap|column-gap)"
    for m in re.finditer(props + r"(?:-\w+)?\s*:\s*([^;}\n]+)", text, re.I):
        val = m.group(1)
        for n in re.finditer(r"(\d+)px", val):
            px = int(n.group(1))
            if px == 0 or px % 4 == 0:
                continue
            if px in (1, 2, 3):  # 1px 边框 / 微调允许
                continue
            rep.add(
                "WARN", path, lineno(text, m.start()), "spacing",
                f"间距 {px}px 不是 4 的倍数。规范间距：4/8/12/16/24/32/40/64/96。",
            )


def check_fonts(path, text, rep):
    for m in re.finditer(r"font-family\s*:\s*([^;}\n]+)", text, re.I):
        val = m.group(1).lower()
        if val.strip().startswith("var(") or val.strip() in ("inherit", "unset"):
            continue  # 变量引用 / 继承，交由变量定义处校验
        for bad in BANNED_FONTS:
            if bad in val:
                rep.add(
                    "FAIL", path, lineno(text, m.start()), "font",
                    f"字体族包含禁用字体「{bad}」。全篇只用一套字族，"
                    f"层级靠字重建立。",
                )
        if "system-ui" not in val and "noto sans" not in val \
                and "pingfang" not in val and "sf pro" not in val \
                and "inter" not in val and "sans-serif" not in val:
            rep.add(
                "WARN", path, lineno(text, m.start()), "font",
                f"字体族「{val.strip()[:40]}」不在推荐列表。"
                f"推荐 SF Pro Display / PingFang SC / Noto Sans SC / Inter。",
            )


def strip_tags(html):
    """移除标签但保持字符偏移不变，便于回溯原始行号。"""
    def blank(m):
        return re.sub(r"[^\n]", " ", m.group(0))

    html = re.sub(r"<(script|style)[^>]*>.*?</\1>", blank, html, flags=re.S | re.I)
    return re.sub(r"<[^>]+>", blank, html)


def check_copy(path, text, rep):
    if path.suffix.lower() not in MARKUP_EXTS:
        return  # 纯样式文件不做文案检查
    body = strip_tags(text) if path.suffix.lower() in {".html", ".htm"} else text

    for m in re.finditer(r"[！!]", body):
        rep.add(
            "WARN", path, lineno(text, m.start()), "copy",
            "出现感叹号。Apple 中文文案几乎不用感叹号，语气越平，自信越强。",
        )

    for w in BANNED_WORDS:
        for m in re.finditer(re.escape(w), body):
            rep.add(
                "FAIL", path, lineno(text, m.start()), "copy",
                f"出现黑话「{w}」。改用具体事实或数字。",
            )

    # 中文长句：单行内无标点连续超过 40 字
    for i, line in enumerate(body.split("\n")):
        s = re.sub(r"\s+", "", line)
        if len(s) > 40 and not re.search(r"[，。、；：！？,.;:?!]", s):
            rep.add(
                "WARN", path, i + 1, "copy",
                f"存在 {len(s)} 字无断句的长句。标题 ≤ 8 字，说明 ≤ 30 字。",
            )


CHECKERS = [check_colors, check_weights, check_line_height, check_spacing,
            check_fonts, check_copy]

# ---------------------------------------------------------------- 主流程


def run(targets):
    files = collect(targets)
    rep = Report()

    if not files:
        print("未找到可检查的 .css / .html / .jsx / .vue 文件。", file=sys.stderr)
        return 1, rep

    for f in files:
        try:
            text = f.read_text(encoding="utf-8", errors="ignore")
        except OSError as e:
            print(f"跳过 {f}: {e}", file=sys.stderr)
            continue
        for checker in CHECKERS:
            try:
                checker(f, text, rep)
            except Exception as e:  # 单个检查器异常不应中断整体
                print(f"检查器 {checker.__name__} 在 {f} 失败: {e}", file=sys.stderr)

    return (1 if rep.fails else 0), rep


def print_report(rep, files_count, as_json=False):
    if as_json:
        print(json.dumps({
            "files": files_count,
            "fail": len(rep.fails),
            "warn": len(rep.warns),
            "items": rep.items,
        }, ensure_ascii=False, indent=2))
        return

    if not rep.items:
        print(f"PASS  已检查 {files_count} 个文件，未发现规范问题。")
        return

    for item in sorted(rep.items, key=lambda x: (x["level"] != "FAIL", x["file"], x["line"])):
        print(f"[{item['level']}] {item['file']}:{item['line']}  "
              f"({item['rule']})  {item['message']}")

    print()
    status = "FAIL" if rep.fails else "PASS (with warnings)"
    print(f"{status}  检查 {files_count} 个文件 | "
          f"FAIL {len(rep.fails)} | WARN {len(rep.warns)}")


def main():
    ap = argparse.ArgumentParser(description="Apple 宣传设计语言合规校验")
    ap.add_argument("targets", nargs="+", help="待检查的文件或目录")
    ap.add_argument("--json", action="store_true", help="输出 JSON 报告")
    args = ap.parse_args()

    code, rep = run(args.targets)
    files_count = len(collect(args.targets))
    print_report(rep, files_count, args.json)
    sys.exit(code)


if __name__ == "__main__":
    main()
