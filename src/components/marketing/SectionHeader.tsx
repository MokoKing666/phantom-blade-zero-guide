import type { ReactNode } from 'react';

interface SectionHeaderProps {
  label?: string;
  title: ReactNode;
  lead?: string;
}

export function SectionHeader({ label, title, lead }: SectionHeaderProps) {
  return (
    <header>
      {label ? <span className="label">{label}</span> : null}
      <h2>{title}</h2>
      {lead ? <p className="lead">{lead}</p> : null}
    </header>
  );
}
