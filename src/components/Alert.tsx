import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { CSSProperties, useEffect } from 'react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Alert({ type = 'info', message, onClose, duration = 5000 }: AlertProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      accent: 'from-emerald-500 to-emerald-400',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      text: 'text-emerald-700',
      progress: 'from-emerald-500 via-emerald-400 to-emerald-500',
    },
    error: {
      accent: 'from-rose-500 to-rose-400',
      icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
      text: 'text-rose-700',
      progress: 'from-rose-500 via-rose-400 to-rose-500',
    },
    warning: {
      accent: 'from-amber-500 to-amber-400',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      text: 'text-amber-700',
      progress: 'from-amber-500 via-amber-400 to-amber-500',
    },
    info: {
      accent: 'from-sky-500 to-sky-400',
      icon: <Info className="w-5 h-5 text-sky-600" />,
      text: 'text-sky-700',
      progress: 'from-sky-500 via-sky-400 to-sky-500',
    },
  } as const;

  const style = config[type];
  const progressStyle: CSSProperties = {
    animationDuration: `${duration}ms`,
  };

  return (
    <div className="fixed inset-x-0 top-24 z-[90] flex justify-end px-4 sm:px-6 animate-slide-in-right">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/90 shadow-xl shadow-neutral-900/10 backdrop-blur-lg">
        <span className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${style.accent}`} aria-hidden="true" />
        <div className="flex items-start gap-3 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">{style.icon}</div>
          <div className="flex-1">
            <p className={`text-sm font-semibold leading-tight ${style.text}`}>{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-neutral-400 hover:border-neutral-200 hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {duration > 0 && (
          <div
            className={`alert-progress absolute bottom-0 left-0 h-1 origin-right bg-gradient-to-r ${style.progress}`}
            style={progressStyle}
          />
        )}
      </div>
    </div>
  );
}
