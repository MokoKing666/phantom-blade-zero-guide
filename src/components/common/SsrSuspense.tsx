import { Suspense, type ReactNode } from 'react';

/**
 * 统一的 Suspense 包装。
 *
 * fallback 必须带 `data-ssr-fallback="1"`，SSG 阶段据此断言产物中不含 fallback。
 * 页面与组件**禁止**直接使用 `<Suspense>`（由 ESLint 规则约束），
 * 否则漏掉标记会导致「SSG 输出了 fallback 却被当成正文」。
 */
export function SsrSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div data-ssr-fallback="1" aria-hidden="true" />}>{children}</Suspense>
  );
}
