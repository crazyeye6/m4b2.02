export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface SupportedCurrency {
  code: string;
  symbol: string;
  name: string;
  rateFromUSD: number;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
];

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rateFromUSD: 1 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateFromUSD: 0.79 },
  { code: 'EUR', symbol: '€', name: 'Euro', rateFromUSD: 0.92 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateFromUSD: 1.36 },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', rateFromUSD: 1.53 },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', rateFromUSD: 1.65 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateFromUSD: 0.90 },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', rateFromUSD: 10.5 },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', rateFromUSD: 6.88 },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', rateFromUSD: 10.6 },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', rateFromUSD: 3.97 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateFromUSD: 1.34 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateFromUSD: 149 },
];

export const COUNTRY_TO_LANGUAGE: Record<string, string> = {
  US: 'en', GB: 'en', CA: 'en', AU: 'en', NZ: 'en', ZA: 'en', IN: 'en',
  DE: 'de', AT: 'de', CH: 'de',
  FR: 'fr', BE: 'fr',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es',
  PT: 'pt', BR: 'pt',
  NL: 'nl',
  SE: 'sv',
  JP: 'ja',
  DK: 'en', NO: 'en', FI: 'en', IE: 'en', PL: 'en', SG: 'en', AE: 'en', KR: 'en',
};

export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: 'USD', BR: 'USD', MX: 'USD', AR: 'USD', IN: 'USD', ZA: 'USD', AE: 'USD', CO: 'USD', KR: 'USD',
  GB: 'GBP',
  DE: 'EUR', FR: 'EUR', NL: 'EUR', ES: 'EUR', IT: 'EUR', BE: 'EUR',
  AT: 'EUR', PT: 'EUR', IE: 'EUR', FI: 'EUR',
  CA: 'CAD',
  AU: 'AUD',
  NZ: 'NZD',
  CH: 'CHF',
  SE: 'SEK', DK: 'DKK', NO: 'NOK',
  PL: 'PLN',
  SG: 'SGD',
  JP: 'JPY',
};

export function getCurrencyInfo(code: string): SupportedCurrency {
  return SUPPORTED_CURRENCIES.find(c => c.code === code) ?? SUPPORTED_CURRENCIES[0];
}

export function getLanguageInfo(code: string): SupportedLanguage {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) ?? SUPPORTED_LANGUAGES[0];
}
