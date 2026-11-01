/**
 * 部署基路径常量。
 *
 * BASE 形如 `/phantom-blade-zero-guide/`（末尾带斜杠，来自 Vite `base`）。
 * BASENAME 去掉末尾斜杠，供 BrowserRouter 的 `basename` 使用。
 *
 * 铁律：客户端 BrowserRouter 与服务端 StaticRouter 必须共用同一 BASENAME；
 * StaticRouter 的 `location` 必须是**含 basename 的完整路径**（由 toFullPath 生成），
 * 因为 react-router 内部会用 basename 对 pathname 做前缀剥离。
 */
export const BASE: string = import.meta.env.BASE_URL;

export const BASENAME: string = BASE.replace(/\/$/, '');

/** 路由路径 → 含 basename 的完整路径 */
export function toFullPath(routePath: string): string {
  if (routePath === '/') return `${BASENAME}/`;
  return `${BASENAME}${routePath.startsWith('/') ? routePath : `/${routePath}`}`;
}

/** 完整路径 → 路由路径（剥离 basename） */
export function toRoutePath(fullPath: string): string {
  if (!fullPath.startsWith(BASENAME)) return fullPath;
  const rest = fullPath.slice(BASENAME.length);
  return rest === '' ? '/' : rest;
}
