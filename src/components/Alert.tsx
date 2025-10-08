import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

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
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600" />,
    },
  };

  const style = config[type];

  return (
    <div className="fixed top-24 right-4 z-50 animate-slide-in-right">
      <div
        className={`${style.bgColor} ${style.borderColor} border rounded-lg shadow-lg p-4 flex items-start space-x-3 max-w-md min-w-80`}
      >
        <div className="flex-shrink-0">{style.icon}</div>
        <div className={`flex-1 ${style.textColor} text-sm font-medium`}>{message}</div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${style.textColor} hover:opacity-70 transition-opacity`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
