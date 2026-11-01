import { lazy } from 'react';
import { Route, Routes } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import { SsrSuspense } from './components/common/SsrSuspense';
import { About } from './pages/About';
import { Achievements } from './pages/Achievements';
import { Bosses } from './pages/Bosses';
import { Changelog } from './pages/Changelog';
import { Collectibles } from './pages/Collectibles';
import { Combat } from './pages/Combat';
import { Database } from './pages/Database';
import { Favorites } from './pages/Favorites';
import { Home } from './pages/Home';
import { Lore } from './pages/Lore';
import { NotFound } from './pages/NotFound';
import { Quests } from './pages/Quests';
import { Search } from './pages/Search';
import { Start } from './pages/Start';
import { Weapons } from './pages/Weapons';

/**
 * 地图页独立 chunk：Leaflet 体积较大且仅此页需要，
 * 通过 React.lazy 拆出，SSG 阶段对该 chunk 注入 modulepreload。
 */
const MapPage = lazy(() => import('./pages/MapPage').then((m) => ({ default: m.MapPage })));

/**
 * 纯路由表，SSR 与 CSR 共用。
 * 具体路由清单（用于 SSG 逐页渲染）由 src/generated/routes.json 提供。
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="start" element={<Start />} />
        <Route path="combat" element={<Combat />} />
        <Route path="weapons" element={<Weapons />} />
        <Route path="bosses" element={<Bosses />} />
        <Route
          path="map"
          element={
            <SsrSuspense>
              <MapPage />
            </SsrSuspense>
          }
        />
        <Route path="collectibles" element={<Collectibles />} />
        <Route path="quests" element={<Quests />} />
        <Route path="lore" element={<Lore />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="changelog" element={<Changelog />} />
        <Route path="database" element={<Database />} />
        <Route path="search" element={<Search />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
