import React from 'react';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  accentColor = 'brand-primary'
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dark-border dark:border-dark-border light:border-light-border bg-dark-surface dark:bg-dark-surface light:bg-light-surface p-5 transition-all duration-300 hover:border-brand-primary/40 hover:shadow-card-dark">
      {/* Subtle top glow line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-secondary via-brand-bright to-transparent opacity-60" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-dark-muted dark:text-dark-muted light:text-light-muted">
          {title}
        </span>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dark-secondary/80 dark:bg-dark-secondary/80 light:bg-light-secondary text-brand-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-dark-text dark:text-dark-text light:text-light-text">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trendPositive ? 'text-risk-low' : 'text-risk-high'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-dark-muted dark:text-dark-muted light:text-light-muted">
          {subtitle}
        </p>
      )}
    </div>
  );
}
