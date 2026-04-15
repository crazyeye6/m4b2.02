export interface CountryInfo {
  name: string;
  code: string;
  currency: string;
  currencySymbol: string;
  vatRate: number;
  isEU: boolean;
  isGBR: boolean;
}

export const COUNTRIES: CountryInfo[] = [
  { name: 'United States', code: 'US', currency: 'USD', currencySymbol: '$', vatRate: 0, isEU: false, isGBR: false },
  { name: 'United Kingdom', code: 'GB', currency: 'GBP', currencySymbol: '£', vatRate: 20, isEU: false, isGBR: true },
  { name: 'Canada', code: 'CA', currency: 'CAD', currencySymbol: 'CA$', vatRate: 0, isEU: false, isGBR: false },
  { name: 'Australia', code: 'AU', currency: 'AUD', currencySymbol: 'AU$', vatRate: 0, isEU: false, isGBR: false },
  { name: 'Germany', code: 'DE', currency: 'EUR', currencySymbol: '€', vatRate: 19, isEU: true, isGBR: false },
  { name: 'France', code: 'FR', currency: 'EUR', currencySymbol: '€', vatRate: 20, isEU: true, isGBR: false },
  { name: 'Netherlands', code: 'NL', currency: 'EUR', currencySymbol: '€', vatRate: 21, isEU: true, isGBR: false },
  { name: 'Spain', code: 'ES', currency: 'EUR', currencySymbol: '€', vatRate: 21, isEU: true, isGBR: false },
  { name: 'Italy', code: 'IT', currency: 'EUR', currencySymbol: '€', vatRate: 22, isEU: true, isGBR: false },
  { name: 'Sweden', code: 'SE', currency: 'SEK', currencySymbol: 'kr', vatRate: 25, isEU: true, isGBR: false },
  { name: 'Denmark', code: 'DK', currency: 'DKK', currencySymbol: 'kr', vatRate: 25, isEU: true, isGBR: false },
  { name: 'Norway', code: 'NO', currency: 'NOK', currencySymbol: 'kr', vatRate: 25, isEU: false, isGBR: false },
  { name: 'Finland', code: 'FI', currency: 'EUR', currencySymbol: '€', vatRate: 24, isEU: true, isGBR: false },
  { name: 'Belgium', code: 'BE', currency: 'EUR', currencySymbol: '€', vatRate: 21, isEU: true, isGBR: false },
  { name: 'Austria', code: 'AT', currency: 'EUR', currencySymbol: '€', vatRate: 20, isEU: true, isGBR: false },
  { name: 'Portugal', code: 'PT', currency: 'EUR', currencySymbol: '€', vatRate: 23, isEU: true, isGBR: false },
  { name: 'Poland', code: 'PL', currency: 'PLN', currencySymbol: 'zł', vatRate: 23, isEU: true, isGBR: false },
  { name: 'Ireland', code: 'IE', currency: 'EUR', currencySymbol: '€', vatRate: 23, isEU: true, isGBR: false },
  { name: 'Switzerland', code: 'CH', currency: 'CHF', currencySymbol: 'CHF', vatRate: 0, isEU: false, isGBR: false },
  { name: 'Singapore', code: 'SG', currency: 'SGD', currencySymbol: 'S$', vatRate: 0, isEU: false, isGBR: false },
  { name: 'Japan', code: 'JP', currency: 'JPY', currencySymbol: '¥', vatRate: 0, isEU: false, isGBR: false },
  { name: 'South Korea', code: 'KR', currency: 'KRW', currencySymbol: '₩', vatRate: 0, isEU: false, isGBR: false },
  { name: 'India', code: 'IN', currency: 'USD', currencySymbol: '$', vatRate: 0, isEU: false, isGBR: false },
  { name: 'Brazil', code: 'BR', currency: 'USD', currencySymbol: '$', vatRate: 0, isEU: false, isGBR: false },
  { name: 'Mexico', code: 'MX', currency: 'USD', currencySymbol: '$', vatRate: 0, isEU: false, isGBR: false },
  { name: 'South Africa', code: 'ZA', currency: 'USD', currencySymbol: '$', vatRate: 0, isEU: false, isGBR: false },
  { name: 'UAE', code: 'AE', currency: 'USD', currencySymbol: '$', vatRate: 0, isEU: false, isGBR: false },
  { name: 'New Zealand', code: 'NZ', currency: 'NZD', currencySymbol: 'NZ$', vatRate: 0, isEU: false, isGBR: false },
  { name: 'Other', code: 'XX', currency: 'USD', currencySymbol: '$', vatRate: 0, isEU: false, isGBR: false },
];

export function getCountryInfo(code: string): CountryInfo {
  return COUNTRIES.find(c => c.code === code) ?? COUNTRIES[COUNTRIES.length - 1];
}

export function detectUserCountry(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.startsWith('America/')) return 'US';
    if (tz.startsWith('Europe/London')) return 'GB';
    if (tz.startsWith('Europe/Berlin') || tz === 'Europe/Busingen') return 'DE';
    if (tz.startsWith('Europe/Paris')) return 'FR';
    if (tz.startsWith('Europe/Amsterdam')) return 'NL';
    if (tz.startsWith('Europe/Madrid')) return 'ES';
    if (tz.startsWith('Europe/Rome')) return 'IT';
    if (tz.startsWith('Europe/Stockholm')) return 'SE';
    if (tz.startsWith('Europe/Copenhagen')) return 'DK';
    if (tz.startsWith('Europe/Oslo')) return 'NO';
    if (tz.startsWith('Europe/Helsinki')) return 'FI';
    if (tz.startsWith('Europe/Brussels')) return 'BE';
    if (tz.startsWith('Europe/Vienna')) return 'AT';
    if (tz.startsWith('Europe/Lisbon')) return 'PT';
    if (tz.startsWith('Europe/Warsaw')) return 'PL';
    if (tz.startsWith('Europe/Dublin')) return 'IE';
    if (tz.startsWith('Europe/Zurich')) return 'CH';
    if (tz.startsWith('Australia/')) return 'AU';
    if (tz.startsWith('Pacific/Auckland')) return 'NZ';
    if (tz.startsWith('Asia/Singapore')) return 'SG';
    if (tz.startsWith('Asia/Tokyo')) return 'JP';
    if (tz.startsWith('Asia/Seoul')) return 'KR';
    if (tz.startsWith('Asia/Kolkata') || tz.startsWith('Asia/Calcutta')) return 'IN';
    if (tz.startsWith('America/Sao_Paulo') || tz.startsWith('America/Manaus')) return 'BR';
    if (tz.startsWith('America/Mexico_City')) return 'MX';
    if (tz.startsWith('Asia/Dubai')) return 'AE';
    if (tz.startsWith('Africa/Johannesburg')) return 'ZA';
    if (tz.startsWith('Canada/')) return 'CA';
  } catch {
    // ignore
  }
  return 'US';
}

export interface VatCalculation {
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  reverseCharge: boolean;
  vatApplies: boolean;
  vatLabel: string;
}

export function calculateVAT(
  subtotal: number,
  countryCode: string,
  purchaseType: 'business' | 'individual',
  vatNumberValid: boolean
): VatCalculation {
  const country = getCountryInfo(countryCode);
  const isVATTerritory = country.isEU || country.isGBR;

  if (!isVATTerritory) {
    return { subtotal, vatRate: 0, vatAmount: 0, total: subtotal, reverseCharge: false, vatApplies: false, vatLabel: 'No VAT' };
  }

  if (purchaseType === 'business' && vatNumberValid) {
    return { subtotal, vatRate: 0, vatAmount: 0, total: subtotal, reverseCharge: true, vatApplies: false, vatLabel: 'Reverse charge (0%)' };
  }

  const rate = country.vatRate;
  const vatAmount = Math.round(subtotal * rate / 100 * 100) / 100;
  return {
    subtotal,
    vatRate: rate,
    vatAmount,
    total: subtotal + vatAmount,
    reverseCharge: false,
    vatApplies: true,
    vatLabel: `VAT ${rate}%`,
  };
}

const EU_VAT_PREFIXES: Record<string, string> = {
  AT: 'ATU', BE: 'BE0', BG: 'BG', CY: 'CY', CZ: 'CZ', DE: 'DE', DK: 'DK', EE: 'EE',
  ES: 'ES', FI: 'FI', FR: 'FR', GR: 'EL', HR: 'HR', HU: 'HU', IE: 'IE', IT: 'IT',
  LT: 'LT', LU: 'LU', LV: 'LV', MT: 'MT', NL: 'NL', PL: 'PL', PT: 'PT', RO: 'RO',
  SE: 'SE', SI: 'SI', SK: 'SK',
};

export function formatVatHint(countryCode: string): string {
  const prefix = EU_VAT_PREFIXES[countryCode];
  if (countryCode === 'GB') return 'e.g. GB123456789';
  if (prefix) return `e.g. ${prefix}...`;
  return 'VAT number';
}

export function validateVatFormat(vatNumber: string, countryCode: string): boolean {
  const cleaned = vatNumber.replace(/[\s\-\.]/g, '').toUpperCase();
  if (cleaned.length < 8) return false;

  if (countryCode === 'GB') {
    return /^GB[0-9]{9}([0-9]{3})?$/.test(cleaned) || /^GBGD[0-9]{3}$/.test(cleaned) || /^GBHA[0-9]{3}$/.test(cleaned);
  }

  const prefix = EU_VAT_PREFIXES[countryCode];
  if (prefix) {
    return cleaned.startsWith(prefix) || cleaned.startsWith(countryCode);
  }

  return cleaned.length >= 8;
}
