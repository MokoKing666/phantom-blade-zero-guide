# Vendored: apple-marketing-design

本目录是第三方设计规范的本地副本，供 `npm run audit:style` 与设计实施参考使用。

| 项 | 值 |
|---|---|
| 上游仓库 | https://github.com/MokoKing666/apple-marketing-design |
| 提交 | `ffdce3e36e565c3c8028621d0bc8bc231cdda1b2` |
| 提交日期 | 2026-10-31 |
| 许可证 | MIT（见同目录 `LICENSE`，Copyright (c) 2026 Moko） |
| 复制方式 | `cp -r <clone> scripts/vendor/apple-marketing-design`，移除 `.git` |
| 用途 | 设计规范参考 + `scripts/audit_apple_style.py` 合规校验 |
| 修改 | 无。本目录内容与上游提交一致，不在本地编辑 |

## 更新流程

1. 在上游仓库检出目标提交。
2. 用该提交内容整体替换本目录（保留 `VENDOR.md`）。
3. 更新上表的提交号与日期。
4. 运行 `npm run audit:style` 确认校验脚本仍可执行。
