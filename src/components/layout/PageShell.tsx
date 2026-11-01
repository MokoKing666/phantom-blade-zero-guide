import type { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
  /** 页面主标题 */
  title?: string;
  /** 标题下方的引导语 */
  lead?: string;
  /** 是否使用深色背景 */
  dark?: boolean;
}

/**
 * 页面内容骨架。页头与页脚由 AppLayout 提供，这里只负责 main 容器与标题层级。
 */
export function PageShell({ children, title, lead, dark = false }: PageShellProps) {
  return (
    <main id="main" className={dark ? 'shell section section--dark' : 'shell section'}>
      {title ? <h1>{title}</h1> : null}
      {lead ? <p className="lead">{lead}</p> : null}
      {children}
    </main>
  );
}
