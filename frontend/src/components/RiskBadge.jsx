import React from 'react';

export default function RiskBadge({ level, size = 'md' }) {
  const normalized = (level || 'LOW').toUpperCase();

  const config = {
    LOW: {
      label: 'Low Risk',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-400 dark:text-emerald-400 light:text-emerald-700',
      dot: 'bg-emerald-400',
    },
    MEDIUM: {
      label: 'Medium Risk',
      bg: 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30 text-amber-400 dark:text-amber-400 light:text-amber-700',
      dot: 'bg-amber-400',
    },
    HIGH: {
      label: 'High Risk',
      bg: 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/30 text-rose-400 dark:text-rose-400 light:text-rose-700',
      dot: 'bg-rose-400',
    },
  };

  const current = config[normalized] || config.LOW;
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${sizeClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot} animate-pulse`} />
      {current.label}
    </span>
  );
}
