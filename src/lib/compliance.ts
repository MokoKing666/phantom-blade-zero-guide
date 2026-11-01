/**
 * 站点合规常量。
 *
 * 任何页面都不得绕过这些值：它们决定了页脚声明、素材插槽是否可用、
 * 以及是否渲染联系方式。
 */

/** 本站为非商业项目：无广告、无赞助、无付费内容、无捐赠入口 */
export const SITE_IS_NONCOMMERCIAL = true;

/**
 * 是否持有已授权的游戏素材。
 * 当前为 false —— 本机游戏资源加密且受 DRM 保护，未取得任何再分发授权。
 * 置为 true 前必须在 docs/asset-manifest.json 登记 license 并通过 verify:assets。
 */
export const HAS_LICENSED_ASSETS = false;

/** 素材政策版本；素材政策变更时递增，便于追溯 */
export const ASSET_POLICY_VERSION = 1;

/**
 * 联系邮箱。留空表示未配置。
 * 未配置时页面**不渲染任何联系方式**（只显示「联系方式待配置」），禁止编造。
 */
export const SITE_CONTACT_EMAIL: string | null = null;

/** 非官方声明文案（页脚常驻） */
export const NON_AFFILIATION_NOTICE =
  '本站为非官方玩家资料站，与 PARAWULIN PRODUCTION LIMITED、S-GAME 无关联，未获授权或认可。' +
  '站内名称与术语的权利归其各自所有者。';

/** 内容处理原则说明（/about 使用） */
export const CONTENT_POLICY_SUMMARY =
  '本站只记录事实性信息并使用原创表述；不使用游戏美术、音频、视频、UI 图像，不复制剧情原文与物品描述原文。';
