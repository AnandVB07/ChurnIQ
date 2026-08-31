import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function ShapFactorBar({ factors = [] }) {
  if (!factors || factors.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-dark-muted dark:text-dark-muted light:text-light-muted">
        No factor attribution data available.
      </div>
    );
  }

  // Find max absolute value for relative scaling
  const maxAbs = Math.max(...factors.map(f => Math.abs(f.shap_value || f.abs_impact || 0.01)));

  return (
    <div className="space-y-3">
      {factors.map((factor, idx) => {
        const isRiskDriver = (factor.shap_value > 0) || (factor.impact === 'INCREASES_RISK');
        const absVal = Math.abs(factor.shap_value || factor.abs_impact || 0);
        const widthPct = Math.min(100, Math.max(12, Math.round((absVal / maxAbs) * 100)));

        return (
          <div key={idx} className="group rounded-lg bg-dark-secondary/50 dark:bg-dark-secondary/50 light:bg-light-secondary/60 p-2.5 transition-all hover:bg-dark-secondary dark:hover:bg-dark-secondary light:hover:bg-light-secondary">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-medium text-dark-text dark:text-dark-text light:text-light-text">
                {isRiskDriver ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-rose-400" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-emerald-400" />
                )}
                <span>{factor.feature_label || factor.feature}</span>
              </div>
              <span
                className={`font-mono text-xs font-semibold ${
                  isRiskDriver ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {factor.shap_value > 0 ? '+' : ''}
                {Number(factor.shap_value).toFixed(3)}
              </span>
            </div>

            {/* Visual Bar */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-dark-bg/60 dark:bg-dark-bg/60 light:bg-light-border">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isRiskDriver
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                }`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
