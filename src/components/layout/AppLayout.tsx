import { Outlet } from 'react-router';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

/**
 * 站点外壳：跳转链接 + 页头 + 内容 + 页脚。
 * 所有非地图页共用；地图页使用独立的全屏外壳（见 MapPage）。
 */
export function AppLayout() {
  return (
    <>
      <a className="skip-link" href="#main">
        跳到主要内容
      </a>
      <SiteHeader />
      <Outlet />
      <SiteFooter />
    </>
  );
}
