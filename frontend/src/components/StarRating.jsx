import React from 'react';

const Star = ({ filled, half }) => (
  <svg viewBox="0 0 20 20" className="w-4 h-4 shrink-0" aria-hidden="true">
    <defs>
      <linearGradient id="half-fill">
        <stop offset="50%" stopColor="currentColor" />
        <stop offset="50%" stopColor="transparent" />
      </linearGradient>
    </defs>
    <path
      d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L10 15l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8L10 1.5z"
      fill={half ? 'url(#half-fill)' : filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1"
    />
  </svg>
);

// Read-only star display for an average rating like 4.3
export default function StarRating({ value = 0, count, size = 'sm' }) {
  const rounded = Math.round((value || 0) * 2) / 2;
  const stars = [1, 2, 3, 4, 5].map((n) => {
    if (rounded >= n) return 'full';
    if (rounded + 0.5 === n) return 'half';
    return 'empty';
  });

  return (
    <span className={`inline-flex items-center gap-1 text-clay-500 ${size === 'lg' ? 'text-lg' : ''}`}>
      <span className="flex items-center gap-0.5">
        {stars.map((s, i) => (
          <Star key={i} filled={s === 'full'} half={s === 'half'} />
        ))}
      </span>
      <span className="font-mono text-[13px] text-ink/70 ml-1">
        {value ? value.toFixed(1) : '—'}
        {typeof count === 'number' && <span className="text-ink/40"> ({count})</span>}
      </span>
    </span>
  );
}
