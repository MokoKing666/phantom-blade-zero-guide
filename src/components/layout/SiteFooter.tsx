import { Link } from 'react-router';
import { NON_AFFILIATION_NOTICE } from '../../lib/compliance';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="blade-rule" />
        <p className="note">{NON_AFFILIATION_NOTICE}</p>
        <nav aria-label="页脚导航" className="site-footer__nav">
          <Link to="/about">关于本站</Link>
          <Link to="/changelog">更新日志</Link>
          <Link to="/database">资料库</Link>
        </nav>
        <p className="note site-footer__meta">
          本站使用 MiSans 字体（小米）。字体依 MiSans 字体许可协议嵌入使用，不提供字体文件下载。
        </p>
      </div>
    </footer>
  );
}
