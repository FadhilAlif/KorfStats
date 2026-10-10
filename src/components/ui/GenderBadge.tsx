import type { Gender } from '@/types/match';
import { cn } from '@/lib/utils/cn';

type GenderBadgeSize = 'xs' | 'sm' | 'md';

const SIZES: Record<GenderBadgeSize, string> = {
  xs: 'h-4 w-4 text-[9px]',
  sm: 'h-5 w-5 text-[10px]',
  md: 'h-6 w-6 text-xs',
};

const TONES: Record<Gender, string> = {
  MALE: 'bg-sky-100 text-sky-700 ring-sky-200',
  FEMALE: 'bg-rose-100 text-rose-700 ring-rose-200',
};

interface GenderBadgeProps {
  gender?: Gender;
  size?: GenderBadgeSize;
  /** Bila diisi, badge dirender sebagai tombol toggle. */
  onToggle?: () => void;
  className?: string;
}

/** Badge wajib L / P (Mixed-Gender Korfball). */
export function GenderBadge({ gender, size = 'sm', onToggle, className }: GenderBadgeProps) {
  if (!gender) return null;

  const label = gender === 'MALE' ? 'L' : 'P';
  const title = gender === 'MALE' ? 'Laki-laki' : 'Perempuan';
  const classes = cn(
    'inline-flex shrink-0 items-center justify-center rounded font-semibold ring-1 ring-inset',
    SIZES[size],
    TONES[gender],
    className
  );

  if (onToggle) {
    return (
      <button
        type="button"
        onClick={onToggle}
        title={`${title} — klik untuk mengubah`}
        aria-label={`Gender ${title}, klik untuk mengubah`}
        className={cn(classes, 'transition hover:brightness-95')}
      >
        {label}
      </button>
    );
  }

  return (
    <span className={classes} title={title} aria-label={title}>
      {label}
    </span>
  );
}
