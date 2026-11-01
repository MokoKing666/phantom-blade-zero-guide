interface NumberRailProps {
  /** 当前高亮项（从 1 开始） */
  current?: number;
  /** 项目数，默认 8（主线章节数） */
  total?: number;
  label?: string;
}

/**
 * 编号栏：左侧竖排章节号 01–08。
 * 全站最强识别符号，替代图片承担秩序感。
 */
export function NumberRail({ current, total = 8, label }: NumberRailProps) {
  const items = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <nav className="number-rail" aria-label={label ?? '章节编号'}>
      {items.map((n) => {
        const text = String(n).padStart(2, '0');
        return (
          <span
            key={n}
            className="number-rail__item"
            aria-current={current === n ? 'page' : undefined}
          >
            {text}
          </span>
        );
      })}
    </nav>
  );
}
