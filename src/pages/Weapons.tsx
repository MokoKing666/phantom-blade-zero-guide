import { PageShell } from '../components/layout/PageShell';

export function Weapons() {
  return (
    <PageShell
      title="武器图鉴"
      lead="主武器与影之武装的面板、获取方式与升级材料。"
    >
      <p className="note">条目按来源逐条核验后录入；未核验的条目不显示为已确认资料。</p>
    </PageShell>
  );
}
