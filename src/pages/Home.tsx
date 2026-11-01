import { Link } from 'react-router';
import { BladeRule } from '../components/marketing/BladeRule';
import { Hero } from '../components/marketing/Hero';
import { SectionHeader } from '../components/marketing/SectionHeader';
import { StatBand } from '../components/marketing/StatBand';

const BENTO = [
  { to: '/bosses', title: 'Boss 攻略', desc: '打法要点、配装与阶段拆解' },
  { to: '/weapons', title: '武器图鉴', desc: '主武器与影之武装的面板与获取' },
  { to: '/collectibles', title: '收集品图鉴', desc: '碎片、记忆之花、宝藏与材料' },
  { to: '/achievements', title: '成就与奖杯', desc: '66 项 Steam 成就的达成条件' },
];

export function Home() {
  return (
    <>
      <Hero />
      <StatBand />

      <section className="section" aria-labelledby="map-entry-title">
        <div className="shell">
          <SectionHeader
            label="核心功能"
            title={
              <span id="map-entry-title">
                八章地图，<span className="hl">一张图走完。</span>
              </span>
            }
            lead="按攻略流程组织的拓扑地图：标记、图层、路线、搜索与探索进度互相联动。当前为示意拓扑，不代表游戏内真实地形。"
          />
          <p>
            <Link className="btn btn--primary" to="/map">
              打开互动地图
            </Link>
          </p>
        </div>
      </section>

      <section className="section section--gray" aria-labelledby="bento-title">
        <div className="shell">
          <SectionHeader label="资料入口" title={<span id="bento-title">按需查，不绕路。</span>} />
          <div className="bento">
            {BENTO.map((item) => (
              <Link key={item.to} to={item.to} className="card card--gray bento__cell">
                <h3>{item.title}</h3>
                <p className="note">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark" aria-labelledby="status-title">
        <div className="shell">
          <SectionHeader
            label="当前进度"
            title={<span id="status-title">内容按区域分批核验。</span>}
            lead="首批深度核验为悲泣溪谷；其余区域先建立数据结构，标注「建设中」，不虚构条目。"
          />
          <BladeRule />
          <p className="note">
            每条资料都记录来源与核验日期；单一来源标注为「单源」，来源冲突标注为「存在争议」。
          </p>
        </div>
      </section>
    </>
  );
}
