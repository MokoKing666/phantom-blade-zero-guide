import { Link } from 'react-router';

/**
 * 404 页面。
 *
 * 硬约束（见计划 §E.10.6）：**不得渲染当前请求路径**。
 * SSG 阶段用 `/__not-found__` 预渲染本页，而浏览器可能在任意未知路径渲染它；
 * 一旦渲染请求路径，预渲染产物与客户端 DOM 就会不一致，触发 hydration mismatch。
 */
export function NotFound() {
  return (
    <main>
      <h1>页面不存在</h1>
      <p>你访问的页面没有找到。可能是链接已失效，或该条目尚未收录。</p>
      <Link to="/">返回首页</Link>
    </main>
  );
}
