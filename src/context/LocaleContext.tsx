import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  COUNTRY_TO_LANGUAGE,
  COUNTRY_TO_CURRENCY,
  getCurrencyInfo,
  getLanguageInfo,
  type SupportedLanguage,
  type SupportedCurrency,
} from '../lib/localeConfig';
import { detectUserCountry } from '../lib/vat';

const LS_LANG_KEY = 'etw_language';
const LS_CURRENCY_KEY = 'etw_currency';
const LS_COUNTRY_KEY = 'etw_detected_country';

interface LocaleContextValue {
  language: SupportedLanguage;
  currency: SupportedCurrency;
  detectedCountry: string;
  setLanguage: (code: string) => void;
  setCurrency: (code: string) => void;
  convertPrice: (usdAmount: number) => number;
  formatPrice: (usdAmount: number) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

async function detectCountryFromIP(): Promise<string | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const data = await res.json();
    return data.country_code ?? null;
  } catch {
    return null;
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [detectedCountry, setDetectedCountry] = useState<string>('US');
  const [langCode, setLangCode] = useState<string>(() => localStorage.getItem(LS_LANG_KEY) ?? '');
  const [currencyCode, setCurrencyCode] = useState<string>(() => localStorage.getItem(LS_CURRENCY_KEY) ?? '');

  useEffect(() => {
    const run = async () => {
      const cached = localStorage.getItem(LS_COUNTRY_KEY);
      let country = cached;

      if (!country) {
        country = await detectCountryFromIP();
        if (!country) {
          country = detectUserCountry();
        }
        if (country) {
          localStorage.setItem(LS_COUNTRY_KEY, country);
        }
      }

      const resolved = country ?? 'US';
      setDetectedCountry(resolved);

      if (!localStorage.getItem(LS_LANG_KEY)) {
        const lang = COUNTRY_TO_LANGUAGE[resolved] ?? 'en';
        setLangCode(lang);
      }
      if (!localStorage.getItem(LS_CURRENCY_KEY)) {
        const cur = COUNTRY_TO_CURRENCY[resolved] ?? 'USD';
        setCurrencyCode(cur);
      }
    };

    run();
  }, []);

  const handleSetLanguage = useCallback((code: string) => {
    setLangCode(code);
    localStorage.setItem(LS_LANG_KEY, code);
  }, []);

  const handleSetCurrency = useCallback((code: string) => {
    setCurrencyCode(code);
    localStorage.setItem(LS_CURRENCY_KEY, code);
  }, []);

  const currency = getCurrencyInfo(currencyCode || 'USD');
  const language = getLanguageInfo(langCode || 'en');

  const convertPrice = useCallback((usdAmount: number) => {
    return Math.round(usdAmount * currency.rateFromUSD);
  }, [currency]);

  const formatPrice = useCallback((usdAmount: number) => {
    const converted = convertPrice(usdAmount);
    const isHighValue = currency.code === 'JPY' || currency.code === 'KRW';
    if (isHighValue) {
      return `${currency.symbol}${converted.toLocaleString()}`;
    }
    return `${currency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }, [convertPrice, currency]);

  return (
    <LocaleContext.Provider value={{
      language,
      currency,
      detectedCountry,
      setLanguage: handleSetLanguage,
      setCurrency: handleSetCurrency,
      convertPrice,
      formatPrice,
    }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
