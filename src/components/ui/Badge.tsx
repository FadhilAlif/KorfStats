import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export type BadgeTone = 'neutral' | 'brand' | 'teal' | 'amber' | 'rose' | 'success' | 'outline';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100',
  teal: 'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100',
  amber: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-100',
  rose: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100',
  outline: 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-4',
        TONES[tone],
        className
      )}
      {...props}
    />
  );
}
