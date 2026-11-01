import { expect, test } from '@playwright/test';

/**
 * 视觉走查基线：五档视口截图，供 docs/DESIGN-AUDIT.md 人工核对。
 * 不是像素级回归测试，只保证页面能渲染且无横向滚动。
 */
const VIEWPORTS = [
  { name: '1920', width: 1920, height: 1080 },
  { name: '1440', width: 1440, height: 900 },
  { name: '1280', width: 1280, height: 800 },
  { name: '768', width: 768, height: 1024 },
  { name: '375', width: 375, height: 667 },
];

for (const vp of VIEWPORTS) {
  test(`首页 ${vp.name} 无横向滚动`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      path: `docs/screenshots/home-${vp.name}.png`,
      fullPage: vp.name === '1440',
    });
  });
}
