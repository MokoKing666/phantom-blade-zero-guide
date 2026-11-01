# 字体政策（FONT-POLICY）

## 采用的字体

MiSans（小米），本地文件来源已由项目所有者确认。

| 档位 | 文件 | 实际 `usWeightClass` | 用途 |
|---|---|---|---|
| 300 | `MiSans-Light.woff2` | 250 | 氛围型正文、大标题 |
| 400 | `MiSans-Regular.woff2` | 330 | 信息型正文（唯一预载） |
| 600 | `MiSans-Semibold.woff2` | 520 | 标题、数据（规范上限） |

其余 7 档（Thin 150 / ExtraLight 200 / Normal 305 / Medium 380 / Demibold 450 / Bold 630 / Heavy 700）**不使用**。全站禁止 ≥700 字重。

## 技术实现

- 文件位于 `src/assets/fonts/`，经 Vite 资源管线处理（自动加 hash 与 base 前缀）。
- `src/styles/fonts.css` 用**相对路径**引用，例如 `url('../assets/fonts/MiSans-Light.woff2')`。
  **不得**在纯 CSS 中写 `url('/fonts/…')` 或任何 JS 表达式。
- 三条 `@font-face` 统一 `font-family: "PBZ Sans"`，并显式声明 `font-weight: 300 / 400 / 600`。
  三个文件的 `name` 表各自声明了独立家族名（`MiSans Light`、`MiSans Semibold` 等），
  且 `usWeightClass` 是非标准值（250/330/520）——不显式声明 `font-weight` 会让它们全部落成 400。
- `font-display: swap`；`font-synthesis: none` 防止浏览器合成假 300/600。
- **仅预载 400**：由 SSG 从 manifest 取真实哈希文件名注入 `<link rel="preload">`；
  manifest 中找不到 `MiSans-Regular.woff2` 时**构建失败**，不静默跳过。

## 回退链

```css
--font-sans: "PBZ Sans", -apple-system, BlinkMacSystemFont, "Segoe UI",
             "PingFang SC", "HarmonyOS Sans SC", "Source Han Sans SC",
             "Noto Sans SC", "Microsoft YaHei", sans-serif;
```

## 许可边界

按 MiSans 字体许可协议：

- ✅ 允许嵌入式使用（网页 `@font-face` 属嵌入）
- ✅ 允许在项目中注明使用 MiSans
- ❌ 不单独提供字体文件下载
- ❌ 不擅自修改字体文件
- ❌ 不将字体作为独立字体包再分发

因此：

1. **不做 subset**（`pyftsubset` 属修改字体文件）。代价是三文件合计约 14.8 MB 随站点发布。
2. 页面不提供 `.woff2` 直链下载入口。
3. `public/fonts/LICENSE-MiSans.txt` 提供许可说明。
4. README 与 `/about` 注明「本站使用 MiSans 字体（小米）」。

若日后需降低体积，唯一合规路径是采用小米官方提供的网页子集包，不由本站自行切割。

## 覆盖率检查

`scripts/check-font-coverage.py`（fontTools 4.67.0，版本固定在 `requirements-dev.txt`）：

- 读取三个 woff2 的 `cmap`
- 扫描 `content/**` 与 `src/data/**` 的全部字符
- 输出未覆盖字符清单
- 正文常用字缺失 → 退出码 1

Windows 本机与 Linux CI 使用同一脚本：`python scripts/check-font-coverage.py`。

## 许可元数据说明

三个字体文件的 `name` 表**不含** license（ID 13）与 licenseURL（ID 14）字段，
`achVendID` 为 `HNYI`。授权依据来自小米官方 FAQ，而非字体文件内嵌信息。
