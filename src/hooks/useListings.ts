import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { calcDynamicPrice } from '../lib/dynamicPricing';
import { scoreListings } from '../lib/matchScore';
import type { BuyerPreferences } from './useBuyerPreferences';
import type { Listing, FilterState, DeadlineWindow } from '../types';

const PREFS_KEY = 'etw_buyer_prefs_v3';

function loadPrefs(): BuyerPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { tags: [], locations: [], budgetMin: 0, budgetMax: 0, goal: null, timing: null, audienceSize: null, hasCompletedOnboarding: false };
    return JSON.parse(raw) as BuyerPreferences;
  } catch {
    return { tags: [], locations: [], budgetMin: 0, budgetMax: 0, goal: null, timing: null, audienceSize: null, hasCompletedOnboarding: false };
  }
}

function getDeadlineCutoff(window: DeadlineWindow): string | null {
  if (!window) return null;
  const d = new Date();
  if (window === 'today') d.setHours(23, 59, 59, 999);
  else if (window === '3days') { d.setDate(d.getDate() + 3); d.setHours(23, 59, 59, 999); }
  else if (window === '1week') { d.setDate(d.getDate() + 7); d.setHours(23, 59, 59, 999); }
  else if (window === '2weeks') { d.setDate(d.getDate() + 14); d.setHours(23, 59, 59, 999); }
  return d.toISOString();
}

export function useListings(filters: FilterState) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    liveCount: 0,
    avgDiscount: 0,
    totalSavings: 0,
  });

  const fetchListings = useCallback(async () => {
    setLoading(true);

    const allTagSlugs = [
      ...(filters.selectedTags ?? []),
      ...(filters.selectedGeographies ?? []),
      ...(filters.selectedNiches ?? []),
    ];
    const hasTagFilter = allTagSlugs.length > 0;

    let query = supabase.from('listings').select('*, media_profile:media_profiles(*), newsletter:newsletters(*)').eq('status', 'live');

    if (filters.category !== 'all') {
      query = query.eq('media_type', filters.category);
    }

    if (filters.priceMax > 0) {
      query = query.lte('discounted_price', filters.priceMax);
    }

    if (filters.priceMin > 0) {
      query = query.gte('discounted_price', filters.priceMin);
    }

    if (filters.deadlineWindow) {
      const cutoff = getDeadlineCutoff(filters.deadlineWindow);
      if (cutoff) query = query.lte('deadline_at', cutoff);
    }

    if (filters.slotDate) {
      const start = new Date(filters.slotDate + 'T00:00:00');
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.slotDate + 'T00:00:00');
      end.setHours(23, 59, 59, 999);
      query = query.gte('posting_date_start', start.toISOString()).lte('posting_date_start', end.toISOString());
    }

    if (filters.searchQuery && filters.searchQuery.trim()) {
      query = query.textSearch('search_vector', filters.searchQuery.trim(), {
        type: 'websearch',
        config: 'english',
      });
    }

    const sort = filters.sort ?? 'deadline_asc';
    if (sort === 'deadline_asc') {
      query = query.order('deadline_at', { ascending: true });
    } else if (sort === 'price_asc') {
      query = query.order('discounted_price', { ascending: true }).order('deadline_at', { ascending: true });
    } else if (sort === 'price_desc') {
      query = query.order('discounted_price', { ascending: false }).order('deadline_at', { ascending: true });
    } else if (sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('deadline_at', { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      setListings([]);
      setLoading(false);
      return;
    }

    let result = (data as Listing[]) || [];

    result = result.map(l => {
      const autoDiscount = l.auto_discount_enabled !== false;
      const pricing = calcDynamicPrice(l.original_price, l.deadline_at, autoDiscount);
      return {
        ...l,
        discounted_price: pricing.currentPrice,
      };
    });

    if (filters.discountMin > 0) {
      result = result.filter(l => {
        const pct = Math.round(((l.original_price - l.discounted_price) / l.original_price) * 100);
        return pct >= filters.discountMin;
      });
    }

    if (filters.discountMode === 'discounted_only') {
      result = result.filter(l => l.discounted_price < l.original_price);
    } else if (filters.discountMode === 'no_discount_only') {
      result = result.filter(l => l.auto_discount_enabled === false);
    }

    if (filters.audienceMin > 0) {
      result = result.filter(l => {
        const reach = l.subscribers ?? l.downloads ?? l.followers ?? 0;
        return reach >= filters.audienceMin;
      });
    }

    if (hasTagFilter) {
      const { data: tagRows } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', allTagSlugs);

      if (tagRows && tagRows.length > 0) {
        const tagIds = tagRows.map((t: { id: string }) => t.id);
        const { data: listingTagRows } = await supabase
          .from('listing_tags')
          .select('listing_id')
          .in('tag_id', tagIds);

        if (listingTagRows) {
          const matchedListingIds = new Set(listingTagRows.map((r: { listing_id: string }) => r.listing_id));
          result = result.filter(l => matchedListingIds.has(l.id));
        } else {
          result = [];
        }
      } else {
        result = [];
      }
    }

    if (sort === 'discount_desc') {
      result = result.slice().sort((a, b) => {
        const pctA = (a.original_price - a.discounted_price) / a.original_price;
        const pctB = (b.original_price - b.discounted_price) / b.original_price;
        return pctB - pctA;
      });
    } else if (sort === 'audience_desc') {
      result = result.slice().sort((a, b) => {
        const reachA = a.subscribers ?? a.downloads ?? a.followers ?? 0;
        const reachB = b.subscribers ?? b.downloads ?? b.followers ?? 0;
        return reachB - reachA;
      });
    } else if (sort === 'best_stats') {
      const reaches = result.map(l => l.subscribers ?? l.downloads ?? l.followers ?? 0);
      const maxLog = Math.max(...reaches.map(r => r > 0 ? Math.log10(r) : 0), 1);
      const cpms = result.map(l => {
        const reach = l.subscribers ?? l.downloads ?? l.followers ?? 0;
        return reach > 0 ? (l.discounted_price / reach) * 1000 : Infinity;
      });
      const finiteCpms = cpms.filter(c => isFinite(c));
      const maxCpm = finiteCpms.length ? Math.max(...finiteCpms) : 1;

      const scored = result.map((l, i) => {
        const reach = reaches[i];
        const audienceScore = reach > 0 ? Math.log10(reach) / maxLog : 0;
        const discountScore = l.original_price > 0
          ? (l.original_price - l.discounted_price) / l.original_price
          : 0;
        const cpm = cpms[i];
        const cpmScore = isFinite(cpm) && maxCpm > 0 ? 1 - cpm / maxCpm : 0;
        const deadline = new Date(l.deadline_at).getTime();
        const hoursLeft = Math.max(0, (deadline - Date.now()) / (1000 * 60 * 60));
        const urgencyScore = hoursLeft < 24 ? 1 : hoursLeft < 72 ? 0.75 : hoursLeft < 120 ? 0.5 : 0.25;
        const composite = audienceScore * 0.30 + discountScore * 0.25 + cpmScore * 0.20 + urgencyScore * 0.25;
        return { listing: l, score: composite };
      });

      result = scored.sort((a, b) => b.score - a.score).map(s => s.listing);
    } else if (sort === 'recommended') {
      const prefs = loadPrefs();
      const scored = scoreListings(result, prefs);
      result = scored.map(s => s.listing);
    }

    setListings(result);
    setLoading(false);
  }, [filters]);

  const fetchStats = useCallback(async () => {
    const { data } = await supabase
      .from('listings')
      .select('original_price, discounted_price, deadline_at, status');

    if (!data) return;
    const live = data.filter(l => l.status === 'live');
    const liveWithPricing = live.map(l => {
      const pricing = calcDynamicPrice(l.original_price, l.deadline_at);
      return { ...l, currentPrice: pricing.currentPrice };
    });
    const totalSavings = liveWithPricing.reduce((s, l) => s + Math.max(0, l.original_price - l.currentPrice), 0);
    const discountedLive = liveWithPricing.filter(l => l.currentPrice < l.original_price);
    const avgDiscount = discountedLive.length
      ? Math.round(
          discountedLive.reduce((s, l) => s + ((l.original_price - l.currentPrice) / l.original_price) * 100, 0) /
            discountedLive.length
        )
      : 0;

    setStats({ liveCount: live.length, avgDiscount, totalSavings });
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const channel = supabase
      .channel('listings-status')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'listings' },
        (payload) => {
          const updated = payload.new as Listing;
          if (updated.status !== 'live') {
            setListings(prev => prev.filter(l => l.id !== updated.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setListings(prev => prev.filter(l => new Date(l.deadline_at).getTime() > now));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const updateListingStatus = (id: string, status: Listing['status']) => {
    if (status !== 'live') {
      setListings(prev => prev.filter(l => l.id !== id));
    } else {
      setListings(prev => prev.map(l => (l.id === id ? { ...l, status } : l)));
    }
  };

  return { listings, loading, stats, updateListingStatus, refetch: fetchListings };
}
