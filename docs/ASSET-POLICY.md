# 素材政策（ASSET-POLICY）

## 结论先行

本机游戏资源**结构性不可用**，本站**零游戏素材**。

| 能力 | 判定 | 依据 |
|---|---|---|
| 识别文件 | ✅ | 文件头、TOC 版本、entry 数、压缩方法可读 |
| 读取资源清单 | ❌ | pak 索引密文（香农熵 7.998） |
| 提取资源 | ❌ | 逐块 AES，无密钥 |
| 解码资源 | ❌ | 需密钥 + Oodle |
| 公开再分发 | ❌ | EULA 2.2(2) 禁止展示游戏内容 |

密钥位于受保护二进制内，提取密钥属 DRM 绕过，**本项目不做**。

## 本机可用美术资产清单（全部）

| 文件 | 大小 | 性质 | 可用于公开站 |
|---|---|---|---|
| `game.jpg` | 27,541 B | 整合包封面（非官方素材） | ❌ |
| `icon.ico` | 3,262 B | 32×32 图标（商标性素材） | ❌ |
| `Engine/Content/Slate/Cursor/invisible.cur` | — | 引擎隐形光标 | ❌ |
| `…/HardDifficulty.mp4.v2-encode.tmp` | — | 未完成转码残留 | ❌ |
| 散装 `.uasset` / `.umap` | 0 个 | — | 不存在 |

**结论：本机零可用美术素材。**

## 视觉替代方案

| 方案 | 风险 | 状态 |
|---|---|---|
| 原创排版 + 原创几何图形装置（CSS/SVG，非水墨场景画） | 零 | **采用** |
| 事实性文字数据（Boss 名、物品名、数量、位置描述） | 低（需注明来源） | **采用** |
| 官方 CDN 素材 | 中高（EULA 2.2(2) 禁止展示） | **默认禁用**，仅留插槽 |
| 自摄截图 | 中高（EULA 未授权公开展示） | **默认禁用** |
| 第三方攻略站图片 | 高（二次侵权） | 禁止 |
| AI 生成「游戏截图风格」图 | 高（冒充官方实机 + 误导） | 禁止 |

## 素材插槽

`public/licensed/` 为授权素材插槽，**默认空**（仅 `.gitkeep`）。

启用条件：取得**书面授权**，并在 `docs/asset-manifest.json` 登记 `license` 字段。
未登记的文件会被 `scripts/verify-assets.mjs` 拦截，构建失败。

## 构建闸门

`scripts/verify-assets.mjs` 规则：

1. 扫描 `public/**` 与 `src/**` 中所有被引用的媒体文件（png/jpg/jpeg/webp/svg/woff2/mp4/mp3 等）。
2. 每个文件必须在 `docs/asset-manifest.json` 中有条目。
3. 条目的 `license` 字段非空，且 `source` 可追溯。
4. 例外：`public/favicon.svg`（原创）、`src/assets/fonts/*.woff2`（MiSans，已在 manifest 登记）。

## 图标

`lucide-react`（ISC 许可）提供界面图标，属通用图标库，与游戏无关。

## 设计规范

`scripts/vendor/apple-marketing-design/` 是第三方设计规范副本（MIT，见其 `LICENSE` 与 `VENDOR.md`），
仅用于版式参考与合规校验，**不包含任何游戏素材**。
