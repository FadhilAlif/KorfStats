import { cn } from '@/lib/utils/cn';

interface ScorePillProps {
  value: number | string;
  label?: string;
  className?: string;
}

/** Kotak skor kuning khas borang resmi (#FFFF00). */
export function ScorePill({ value, label, className }: ScorePillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md bg-score px-2 py-0.5 font-mono text-xs font-bold text-slate-900 ring-1 ring-inset ring-yellow-500/60',
        className
      )}
    >
      {label && <span className="font-sans text-[10px] font-semibold uppercase tracking-wide">{label}</span>}
      {value}
    </span>
  );
}
