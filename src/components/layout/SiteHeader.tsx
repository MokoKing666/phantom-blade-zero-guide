import { NavLink } from 'react-router';

const NAV = [
  { to: '/start', label: '新手入门' },
  { to: '/combat', label: '战斗系统' },
  { to: '/weapons', label: '武器图鉴' },
  { to: '/bosses', label: 'Boss 攻略' },
  { to: '/map', label: '互动地图' },
  { to: '/collectibles', label: '收集品' },
  { to: '/quests', label: '任务' },
  { to: '/database', label: '资料库' },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <NavLink to="/" className="site-header__brand">
          影境手册
        </NavLink>
        <nav aria-label="主导航" className="site-header__nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'site-header__link is-active' : 'site-header__link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
