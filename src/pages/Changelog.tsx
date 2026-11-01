import { PageShell } from '../components/layout/PageShell';

export function Changelog() {
  return (
    <PageShell title="更新日志" lead="内容核验、数据修订与站点功能变更记录。">
      <p className="note">每次数据变更会同时更新对应条目的核验日期。</p>
    </PageShell>
  );
}
