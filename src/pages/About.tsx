import { PageShell } from '../components/layout/PageShell';
import { BladeRule } from '../components/marketing/BladeRule';
import {
  ASSET_POLICY_VERSION,
  CONTENT_POLICY_SUMMARY,
  HAS_LICENSED_ASSETS,
  NON_AFFILIATION_NOTICE,
  SITE_CONTACT_EMAIL,
  SITE_IS_NONCOMMERCIAL,
} from '../lib/compliance';

export function About() {
  return (
    <PageShell title="关于本站" lead="站点定位、权利归属、内容来源与处理机制。">
      <h2>定位</h2>
      <p>{NON_AFFILIATION_NOTICE}</p>
      <p>
        本站为玩家自发的资料整理项目，{SITE_IS_NONCOMMERCIAL ? '不包含任何商业内容（无广告、赞助、付费与捐赠入口）。' : ''}
      </p>

      <BladeRule />

      <h2>内容来源</h2>
      <p>{CONTENT_POLICY_SUMMARY}</p>
      <p>
        每条重要资料都记录来源与核验日期，并标注状态：<strong>已核验</strong>（两个独立来源或官方来源）、
        <strong>单源</strong>（仅一个来源）、<strong>存在争议</strong>（来源结论冲突）、
        <strong>待实测</strong>（尚未在游戏内确认）。未取得任何来源的条目不会被展示。
      </p>

      <BladeRule />

      <h2>素材与字体</h2>
      <p>
        本站{HAS_LICENSED_ASSETS ? '包含已登记授权的素材。' : '不包含游戏美术、音频、视频、UI 图像或官方标识。'}
        视觉部分为原创排版与几何图形；OG 图为原创几何图。素材政策版本：{ASSET_POLICY_VERSION}。
      </p>
      <p>本站使用 MiSans 字体（小米），依 MiSans 字体许可协议嵌入使用，不提供字体文件下载。</p>

      <BladeRule />

      <h2>权利归属</h2>
      <p>
        游戏名称、角色名称、物品名称与相关术语的权利归其各自所有者。本站对这些名称的使用仅用于说明讨论对象。
      </p>

      <BladeRule />

      <h2>联系与处理</h2>
      {SITE_CONTACT_EMAIL ? (
        <p>
          联系邮箱：<a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>
        </p>
      ) : (
        <p className="note">联系方式待配置。</p>
      )}
      <p>
        如认为本站内容存在问题，请通过仓库的 <strong>Takedown</strong> Issue 模板提交说明。本站的处理方式是：
        <strong>收到有效通知后先行下架争议内容，再行沟通</strong>。
      </p>
      <p className="note">本站不承诺具体处理时限。</p>
    </PageShell>
  );
}
