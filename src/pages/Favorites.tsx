import { PageShell } from '../components/layout/PageShell';

export function Favorites() {
  return (
    <PageShell title="收藏" lead="你标记为收藏的页面与地图标记。">
      <p className="note">收藏保存在本机浏览器（localStorage），不上传任何服务器。</p>
    </PageShell>
  );
}
