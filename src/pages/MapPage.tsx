import { PageShell } from '../components/layout/PageShell';

/**
 * 互动地图页。
 * P1 阶段为占位：完整的 Leaflet 视口、标记、图层、路线、搜索与进度在 P5 实现。
 * 该页通过 React.lazy 加载，保持独立 chunk。
 */
export function MapPage() {
  return (
    <PageShell title="地图探索" lead="按攻略流程组织的拓扑地图。">
      <p className="topology-banner" role="note">
        本页为攻略流程拓扑示意图，用于表达攻略推进顺序与要素归属，不代表游戏内真实地形、空间距离或坐标。
      </p>
      <p className="note">地图视口与标记系统正在建设中。</p>
    </PageShell>
  );
}
