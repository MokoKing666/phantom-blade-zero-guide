import { expect, test } from '@playwright/test';

test('首页可访问、标题正确、无控制台错误', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  const res = await page.goto('/');
  expect(res?.status()).toBe(200);

  await expect(page.locator('h1')).toContainText('先把路走对');
  await expect(page.locator('.site-header__brand')).toContainText('影境手册');
  await expect(page.locator('.site-footer')).toContainText('非官方');

  expect(errors).toEqual([]);
});

// 以下两条依赖逐路由静态产物（map/index.html、404.html），
// 在 P7 完成 SSG 之前 vite preview 无法命中，故暂时 fixme。
test.fixme('地图页可访问且显示拓扑免责横幅（P7 后启用）', async ({ page }) => {
  const res = await page.goto('/map');
  expect(res?.status()).toBe(200);

  await expect(page.locator('h1')).toContainText('地图探索');
  await expect(page.locator('.topology-banner')).toContainText('不代表游戏内真实地形');
});

test.fixme('未知路径渲染 404 且不泄漏请求路径（P7 后启用）', async ({ page }) => {
  await page.goto('/a/b/c');
  await expect(page.locator('h1')).toContainText('页面不存在');
  await expect(page.locator('main')).not.toContainText('/a/b/c');
});
