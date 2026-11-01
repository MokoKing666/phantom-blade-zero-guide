interface Stat {
  value: string;
  unit?: string;
  label: string;
}

/**
 * 数据带。所有数值均为已核实事实，来源见 docs/DATA-SOURCES.md。
 * 发行日期按 Steam 商店页口径显示，不做时区换算。
 */
const STATS: Stat[] = [
  { value: '8', unit: '个', label: '主线章节' },
  { value: '66', unit: '项', label: 'Steam 成就' },
  { value: '15', unit: '种', label: '游戏支持的语言' },
  { value: '2026-10-28', label: '发行日期（Steam 商店页）' },
];

export function StatBand() {
  return (
    <section className="stat-band section--gray" aria-label="游戏基础数据">
      <div className="shell">
        <dl className="stat-band__grid">
          {STATS.map((s) => (
            <div key={s.label} className="stat-band__item">
              <dt className="label">{s.label}</dt>
              <dd className="data-value">
                {s.value}
                {s.unit ? <span className="data-unit">{s.unit}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
        <p className="note stat-band__note">
          日期口径：Steam 商店页（未做时区换算）；部分时区或数据库可能显示为 10-29。
        </p>
      </div>
    </section>
  );
}
