import { PageShell } from '../components/layout/PageShell';

export function Lore() {
  return (
    <PageShell
      title="剧情资料"
      lead="章节结构、人物关系、事件顺序与结局分支条件。"
    >
      <p className="note">
        本页只记录事实性信息与原创表述，不收录剧情原文、对白或旁白逐字转述。含剧透内容默认折叠。
      </p>
    </PageShell>
  );
}
