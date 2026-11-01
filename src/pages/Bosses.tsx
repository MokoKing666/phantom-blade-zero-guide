import { PageShell } from '../components/layout/PageShell';

export function Bosses() {
  return (
    <PageShell
      title="Boss 攻略"
      lead="按章节顺序整理的 Boss 打法、配装建议与可错过节点。"
    >
      <p className="note">条目按来源逐条核验后录入；未核验的条目不显示为已确认资料。</p>
    </PageShell>
  );
}
