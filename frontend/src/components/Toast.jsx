import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    error: <AlertCircle className="h-4 w-4 text-rose-400" />,
    info: <Info className="h-4 w-4 text-brand-primary" />,
  };

  const borders = {
    success: 'border-emerald-500/40 bg-emerald-950/40',
    error: 'border-rose-500/40 bg-rose-950/40',
    info: 'border-brand-primary/40 bg-brand-primary/10',
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border ${borders[type] || borders.info} p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5`}>
      {icons[type] || icons.info}
      <p className="text-xs font-medium text-dark-text dark:text-dark-text light:text-light-text">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-dark-muted hover:text-dark-text"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
