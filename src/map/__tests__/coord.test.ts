import { describe, expect, it } from 'vitest';
import { createProjection, minZoomFor, type BoundsLike } from '../coord';
import type { CanvasBox } from '../types';

const BOX: CanvasBox = { minX: 0, minY: 0, maxX: 4096, maxY: 4096 };

function boundsOf(w: number, h: number, minX = 0, minY = 0): BoundsLike {
  // 与 createProjection(box).bounds() 的语义一致：lat 向下为负
  return {
    getWest: () => minX,
    getEast: () => minX + w,
    getSouth: () => -(minY + h),
    getNorth: () => -minY,
  };
}

describe('createProjection', () => {
  const p = createProjection(BOX);

  it('四角映射（含负坐标）', () => {
    expect(p.toLatLng(0, 0)).toEqual([0, 0]);
    expect(p.toLatLng(0, -1200)).toEqual([1200, 0]);
    expect(p.toLatLng(-400, -1200)).toEqual([1200, -400]);
    expect(p.toLatLng(800, 600)).toEqual([-600, 800]);
  });

  it('往返一致', () => {
    const pts = [
      [0, 0],
      [0, -1200],
      [-400, -1200],
      [800, 600],
      [4096, 4096],
    ] as const;
    for (const [x, y] of pts) {
      const [lat, lng] = p.toLatLng(x, y);
      expect(p.toXY(lat, lng)).toEqual({ x, y });
    }
    for (let i = 0; i < 100; i++) {
      const x = Math.trunc((i * 37) % 4096) - 2048;
      const y = Math.trunc((i * 91) % 4096) - 2048;
      const [lat, lng] = p.toLatLng(x, y);
      expect(p.toXY(lat, lng)).toEqual({ x, y });
    }
  });

  it('y 大者在下方（镜像检测）', () => {
    const [latTop] = p.toLatLng(0, 0);
    const [latBottom] = p.toLatLng(0, 4096);
    expect(latTop).toBeGreaterThan(latBottom);
  });

  it('bounds 覆盖整个画布', () => {
    expect(p.bounds()).toEqual([
      [-4096, 0],
      [0, 4096],
    ]);
  });

  it('画布扩展后既有坐标逐位不变', () => {
    const before = createProjection({ minX: 0, minY: 0, maxX: 4096, maxY: 4096 });
    const after = createProjection({ minX: -500, minY: -300, maxX: 4096, maxY: 4096 });
    const samples: Array<[number, number]> = [
      [0, 0],
      [512, 1024],
      [4096, 4096],
      [-500, -300],
    ];
    for (const [x, y] of samples) {
      expect(after.toLatLng(x, y)).toEqual(before.toLatLng(x, y));
    }
  });

  it('CanvasBox 非法时抛错', () => {
    expect(() => createProjection({ minX: 0, minY: 0, maxX: 0, maxY: 10 })).toThrow(RangeError);
    expect(() =>
      createProjection({ minX: 0, minY: 0, maxX: 10.5, maxY: 10 }),
    ).toThrow(RangeError);
  });
});

describe('minZoomFor', () => {
  it('算例 1：4096 内容 / 375x667 → -3.5', () => {
    expect(minZoomFor(boundsOf(4096, 4096), 375, 667, 0.25)).toBe(-3.5);
  });

  it('算例 2：4096 内容 / 1280x800 → -2.5', () => {
    expect(minZoomFor(boundsOf(4096, 4096), 1280, 800, 0.25)).toBe(-2.5);
  });

  it('算例 3：1200x900 内容 / 375x667 → -1.75', () => {
    expect(minZoomFor(boundsOf(1200, 900), 375, 667, 0.25)).toBe(-1.75);
  });

  it('算例 4：800x800 内容 / 800x800 → 0', () => {
    expect(minZoomFor(boundsOf(800, 800), 800, 800, 0.25)).toBe(0);
  });

  it('参数守卫', () => {
    expect(() => minZoomFor(boundsOf(100, 100), 0, 100)).toThrow(RangeError);
    expect(() => minZoomFor(boundsOf(100, 100), 100, Number.NaN)).toThrow(RangeError);
    expect(() => minZoomFor(boundsOf(100, 100), 100, 100, 0)).toThrow(RangeError);
    expect(() => minZoomFor(boundsOf(0, 100), 100, 100)).toThrow(RangeError);
  });
});
