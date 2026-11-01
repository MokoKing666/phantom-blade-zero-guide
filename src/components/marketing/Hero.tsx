import { Link } from 'react-router';

/**
 * 首页 Hero。
 * 标题为原创中性文案：不改编剧情、不复用官方标语。
 */
export function Hero() {
  return (
    <section className="hero section--dark" aria-labelledby="hero-title">
      <div className="shell hero__inner">
        <span className="label">影境手册 / PBZ Codex</span>
        <h1 id="hero-title" className="hero-title">
          先把路走对，
          <span className="hl hero-title__accent">再谈刀法。</span>
        </h1>
        <p className="lead hero__lead">
          《影之刃零》非官方中文攻略资料站。路线、Boss、武器、收集与地图，按可核验的来源整理。
        </p>
        <div className="hero__actions">
          <Link className="btn btn--primary" to="/map">
            进入互动地图
          </Link>
          <Link className="btn" to="/start">
            新手入门
          </Link>
        </div>
      </div>
    </section>
  );
}
