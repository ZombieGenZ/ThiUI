import { createContext, useContext, useState, ReactNode } from 'react';
import { Alert } from '../components/Alert';

interface AlertConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertConfig | null>(null);

  const showAlert = (config: AlertConfig) => {
    setAlert(config);
  };

  const showSuccess = (message: string, duration = 5000) => {
    showAlert({ type: 'success', message, duration });
  };

  const showError = (message: string, duration = 5000) => {
    showAlert({ type: 'error', message, duration });
  };

  const showWarning = (message: string, duration = 5000) => {
    showAlert({ type: 'warning', message, duration });
  };

  const showInfo = (message: string, duration = 5000) => {
    showAlert({ type: 'info', message, duration });
  };

  const hideAlert = () => {
    setAlert(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert, showSuccess, showError, showWarning, showInfo }}>
      {children}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          duration={alert.duration}
          onClose={hideAlert}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
}
