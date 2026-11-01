import { PageShell } from '../components/layout/PageShell';

export function Database() {
  return (
    <PageShell
      title="游戏资料库"
      lead="区域、铃铛、分类与术语的结构化索引。"
    >
      <p className="note">
        资料库与互动地图共用同一套数据源，条目状态（已核验 / 单源 / 存在争议 / 待实测）逐条标注。
      </p>
    </PageShell>
  );
}
