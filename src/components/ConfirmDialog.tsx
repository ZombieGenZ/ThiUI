import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger' | 'success';
  icon?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

const toneStyles: Record<NonNullable<ConfirmDialogProps['tone']>, {
  header: string;
  badge: string;
  confirmButton: string;
  icon: ReactNode;
}> = {
  default: {
    header: 'from-brand-100/60 via-white to-white',
    badge: 'bg-brand-50 text-brand-600 border-brand-100',
    confirmButton: 'bg-brand-600 hover:bg-brand-700 text-white',
    icon: <CheckCircle2 className="h-5 w-5 text-brand-600" />,
  },
  danger: {
    header: 'from-rose-100/70 via-white to-white',
    badge: 'bg-rose-50 text-rose-600 border-rose-100',
    confirmButton: 'bg-rose-600 hover:bg-rose-700 text-white',
    icon: <AlertTriangle className="h-5 w-5 text-rose-600" />,
  },
  success: {
    header: 'from-emerald-100/60 via-white to-white',
    badge: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    confirmButton: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
  },
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  const style = toneStyles[tone];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200/70 bg-white shadow-xl shadow-neutral-900/10 animate-fade-in-scale">
        <div className={`bg-gradient-to-br ${style.header} px-6 py-5`}
        >
          <div className="flex items-center gap-3">
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border ${style.badge}`}>
              {icon ?? style.icon}
            </span>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
              <p className="text-sm text-neutral-600">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="absolute right-5 top-5 rounded-full p-2 text-neutral-500 hover:bg-white/60"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex flex-col gap-2 text-sm text-neutral-500">
            <p>
              Please confirm to continue. This action may update live data and cannot be undone.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-neutral-200 px-5 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
              }}
              className={`rounded-xl px-5 py-2 text-sm font-semibold shadow-sm ${style.confirmButton}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
