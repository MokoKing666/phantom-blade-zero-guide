import { PageShell } from '../components/layout/PageShell';

export function Search() {
  return (
    <PageShell title="搜索" lead="在页面、地图标记与图鉴条目中检索。">
      <p className="note">搜索索引在构建期生成，运行时不发起网络请求。</p>
    </PageShell>
  );
}
