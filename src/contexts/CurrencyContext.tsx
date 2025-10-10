import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Language } from './LanguageContext';
import { formatCurrency } from '../utils/i18n';

type Currency = 'USD' | 'VND';

interface CurrencyContextValue {
  currency: Currency;
  exchangeRate: number;
  setCurrency: (currency: Currency) => void;
  toggleCurrency: () => void;
  convertAmount: (value: number, fromCurrency?: Currency) => number;
  formatPrice: (value: number, language: Language, fromCurrency?: Currency) => string;
}

const STORAGE_KEY = 'thiui.currency';
const DEFAULT_RATE = Number(import.meta.env.VITE_USD_TO_VND_RATE ?? '25000');

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window === 'undefined') {
      return 'USD';
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'VND' ? 'VND' : 'USD';
  });
  const [exchangeRate] = useState<number>(DEFAULT_RATE);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next);
  }, []);

  const toggleCurrency = useCallback(() => {
    setCurrencyState(prev => (prev === 'USD' ? 'VND' : 'USD'));
  }, []);

  const convertAmount = useCallback(
    (value: number, fromCurrency: Currency = 'USD') => {
      if (!Number.isFinite(value)) {
        return 0;
      }

      if (fromCurrency === currency) {
        return value;
      }

      if (fromCurrency === 'USD' && currency === 'VND') {
        return value * exchangeRate;
      }

      if (fromCurrency === 'VND' && currency === 'USD') {
        return value / (exchangeRate || 1);
      }

      return value;
    },
    [currency, exchangeRate]
  );

  const formatPrice = useCallback(
    (value: number, language: Language, fromCurrency: Currency = 'USD') => {
      const converted = convertAmount(value, fromCurrency);
      return formatCurrency(converted, language, currency);
    },
    [convertAmount, currency]
  );

  const contextValue = useMemo(
    () => ({ currency, exchangeRate, setCurrency, toggleCurrency, convertAmount, formatPrice }),
    [convertAmount, currency, exchangeRate, formatPrice, setCurrency, toggleCurrency]
  );

  return <CurrencyContext.Provider value={contextValue}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

export type { Currency };
