import type { Language } from '../contexts/LanguageContext';

export function getLocalizedValue(
  translations: Record<string, string> | null | undefined,
  language: Language,
  fallback?: string
): string {
  if (translations) {
    const candidate = translations[language];
    if (candidate && candidate.trim()) {
      return candidate;
    }

    const alternative = language === 'en' ? translations.vi : translations.en;
    if (alternative && alternative.trim()) {
      return alternative;
    }
  }

  if (fallback) {
    return fallback;
  }

  if (translations?.en) {
    return translations.en;
  }

  if (translations?.vi) {
    return translations.vi;
  }

  return '';
}

export function formatCurrency(value: number, language: Language, currency: string = 'USD'): string {
  try {
    const locale = language === 'vi' ? 'vi-VN' : 'en-US';
    const fractionDigits = currency === 'USD' ? 2 : 0;
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  } catch (error) {
    console.error('Unable to format currency:', error);
    return `${value.toFixed(0)} ${currency}`;
  }
}
