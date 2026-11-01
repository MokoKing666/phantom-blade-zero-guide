/**
 * 投影与缩放计算。
 *
 * 固定原点投影：lat = -y，与画布尺寸无关。
 * 因此画布扩展（改 CanvasBox）不会移动任何既有坐标。
 *
 * 本文件不 import leaflet 运行时，只依赖结构类型，SSR 与单元测试均可安全使用。
 */
import type { CanvasBox, Point } from './types';

/** 与 L.LatLngBounds 结构兼容（无需引入 leaflet 运行时） */
export interface BoundsLike {
  getWest(): number;
  getEast(): number;
  getSouth(): number;
  getNorth(): number;
}

export interface Projection {
  readonly box: CanvasBox;
  toLatLng(x: number, y: number): [number, number];
  toXY(lat: number, lng: number): Point;
  bounds(): [[number, number], [number, number]];
}

export const isCoord = (v: unknown): v is number => Number.isSafeInteger(v);

/**
 * 归一化 -0 → 0。
 * `-0` 与 `0` 数值相等但 `Object.is` 不等，会让单元测试与 layout:check 的
 * 逐位比对出现假差异；JSON.stringify(-0) 又会变成 "0"，导致磁盘与内存不一致。
 */
const nz = (v: number): number => (v === 0 ? 0 : v);

export function assertCanvasBox(box: CanvasBox): void {
  for (const [k, v] of Object.entries(box)) {
    if (!isCoord(v)) throw new RangeError(`CanvasBox.${k} 非安全整数：${String(v)}`);
  }
  if (!(box.minX < box.maxX)) throw new RangeError('CanvasBox.minX 必须小于 maxX');
  if (!(box.minY < box.maxY)) throw new RangeError('CanvasBox.minY 必须小于 maxY');
}

export function createProjection(box: CanvasBox): Projection {
  assertCanvasBox(box);
  return {
    box,
    toLatLng: (x, y) => [nz(-y), nz(x)],
    toXY: (lat, lng) => ({ x: nz(lng), y: nz(-lat) }),
    bounds: () => [
      [nz(-box.maxY), nz(box.minX)],
      [nz(-box.minY), nz(box.maxX)],
    ],
  };
}

/**
 * 依据内容边界与容器尺寸计算最小缩放级别。
 * 参数非法立即抛错，避免除零与 NaN 静默传播。
 */
export function minZoomFor(b: BoundsLike, cw: number, ch: number, snap = 0.25): number {
  if (!Number.isFinite(cw) || cw <= 0) throw new RangeError(`容器宽非法：${String(cw)}`);
  if (!Number.isFinite(ch) || ch <= 0) throw new RangeError(`容器高非法：${String(ch)}`);
  if (!Number.isFinite(snap) || snap <= 0) throw new RangeError(`snap 非法：${String(snap)}`);

  const w = b.getEast() - b.getWest();
  const h = b.getNorth() - b.getSouth();
  if (!Number.isFinite(w) || w <= 0) throw new RangeError(`内容宽非法：${String(w)}`);
  if (!Number.isFinite(h) || h <= 0) throw new RangeError(`内容高非法：${String(h)}`);

  return Math.floor(Math.log2(Math.min(cw / w, ch / h)) / snap) * snap;
}
