import { PageShell } from '../components/layout/PageShell';

export function Quests() {
  return (
    <PageShell
      title="主线与支线任务"
      lead="主线推进顺序、异闻支线的接取条件与失效节点。"
    >
      <p className="note">
        部分支线会随章节推进永久失效，条目中标注了截止节点；未核验的条目不显示。
      </p>
    </PageShell>
  );
}
