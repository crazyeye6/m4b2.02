import { useState, useEffect, useCallback } from 'react';

export type PrefCategory = 'SaaS' | 'Marketing' | 'Business' | 'Finance' | 'E-commerce' | 'Creator' | 'Tech' | 'DTC';
export type PrefLocation = 'UK' | 'Ireland' | 'US' | 'Europe' | 'Global';
export type PrefGoal = 'awareness' | 'conversions' | 'lead_generation';
export type PrefTiming = 'this_week' | 'next_3_days' | 'last_minute';
export type PrefAudienceSize = 'small' | 'mid' | 'large';

export interface BuyerPreferences {
  categories: PrefCategory[];
  locations: PrefLocation[];
  budgetMin: number;
  budgetMax: number;
  goal: PrefGoal | null;
  timing: PrefTiming | null;
  audienceSize: PrefAudienceSize | null;
  hasCompletedOnboarding: boolean;
}

const DEFAULT_PREFS: BuyerPreferences = {
  categories: [],
  locations: [],
  budgetMin: 0,
  budgetMax: 0,
  goal: null,
  timing: null,
  audienceSize: null,
  hasCompletedOnboarding: false,
};

const STORAGE_KEY = 'etw_buyer_prefs_v2';

function load(): BuyerPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function useBuyerPreferences() {
  const [prefs, setPrefsState] = useState<BuyerPreferences>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, [prefs]);

  const setPrefs = useCallback((partial: Partial<BuyerPreferences>) => {
    setPrefsState(p => ({ ...p, ...partial }));
  }, []);

  const reset = useCallback(() => {
    setPrefsState({ ...DEFAULT_PREFS });
  }, []);

  return { prefs, setPrefs, reset };
}
