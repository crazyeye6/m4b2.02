import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Listing, FilterState, DateRangeOption } from '../types';

function getDateRangeBounds(range: DateRangeOption): { from: string; to: string } | null {
  if (!range) return null;
  const now = new Date();
  const startOfDay = (d: Date) => { d.setHours(0, 0, 0, 0); return d; };
  const endOfDay = (d: Date) => { d.setHours(23, 59, 59, 999); return d; };

  const weekStart = (d: Date) => {
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    return startOfDay(new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff));
  };

  const today = startOfDay(new Date(now));
  const thisWeekStart = weekStart(new Date(now));

  if (range === 'today') {
    return { from: today.toISOString(), to: endOfDay(new Date(today)).toISOString() };
  }
  if (range === 'tomorrow') {
    const t = new Date(today); t.setDate(t.getDate() + 1);
    return { from: t.toISOString(), to: endOfDay(new Date(t)).toISOString() };
  }
  if (range === 'this_week') {
    const end = new Date(thisWeekStart); end.setDate(end.getDate() + 6);
    return { from: today.toISOString(), to: endOfDay(end).toISOString() };
  }
  if (range === 'next_week') {
    const start = new Date(thisWeekStart); start.setDate(start.getDate() + 7);
    const end = new Date(start); end.setDate(end.getDate() + 6);
    return { from: startOfDay(start).toISOString(), to: endOfDay(end).toISOString() };
  }
  if (range === 'week_3') {
    const start = new Date(thisWeekStart); start.setDate(start.getDate() + 14);
    const end = new Date(start); end.setDate(end.getDate() + 6);
    return { from: startOfDay(start).toISOString(), to: endOfDay(end).toISOString() };
  }
  if (range === 'week_4') {
    const start = new Date(thisWeekStart); start.setDate(start.getDate() + 21);
    const end = new Date(start); end.setDate(end.getDate() + 6);
    return { from: startOfDay(start).toISOString(), to: endOfDay(end).toISOString() };
  }
  if (range === 'this_month') {
    const end = new Date(today); end.setDate(end.getDate() + 30);
    return { from: today.toISOString(), to: endOfDay(end).toISOString() };
  }
  return null;
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
    let query = supabase.from('listings').select('*');

    if (filters.category !== 'all') {
      query = query.eq('media_type', filters.category);
    }

    if (filters.priceMax > 0) {
      query = query.lte('discounted_price', filters.priceMax);
    }

    if (filters.priceMin > 0) {
      query = query.gte('discounted_price', filters.priceMin);
    }

    if (filters.dateRange) {
      const bounds = getDateRangeBounds(filters.dateRange);
      if (bounds) {
        query = query.gte('deadline_at', bounds.from).lte('deadline_at', bounds.to);
      }
    }

    if (filters.sortBy === 'ending_soon') {
      query = query.order('deadline_at', { ascending: true });
    } else if (filters.sortBy === 'best_value') {
      query = query.order('discounted_price', { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    let result = (data as Listing[]) || [];

    if (filters.geography) {
      result = result.filter(l =>
        l.location.toLowerCase().includes(filters.geography.toLowerCase())
      );
    }

    if (filters.niche) {
      result = result.filter(l =>
        l.audience.toLowerCase().includes(filters.niche.toLowerCase())
      );
    }

    if (filters.discountMin > 0) {
      result = result.filter(l => {
        const pct = Math.round(((l.original_price - l.discounted_price) / l.original_price) * 100);
        return pct >= filters.discountMin;
      });
    }

    if (filters.sortBy === 'biggest_discount') {
      result = result.sort((a, b) => {
        const da = (a.original_price - a.discounted_price) / a.original_price;
        const db = (b.original_price - b.discounted_price) / b.original_price;
        return db - da;
      });
    }

    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    result = result.filter(l => new Date(l.deadline_at).getTime() >= cutoff);

    setListings(result);
    setLoading(false);
  }, [filters]);

  const fetchStats = useCallback(async () => {
    const { data } = await supabase
      .from('listings')
      .select('original_price, discounted_price, status');

    if (!data) return;
    const live = data.filter(l => l.status === 'live');
    const totalSavings = data.reduce((s, l) => s + (l.original_price - l.discounted_price), 0);
    const avgDiscount = data.length
      ? Math.round(
          data.reduce((s, l) => s + ((l.original_price - l.discounted_price) / l.original_price) * 100, 0) /
            data.length
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

  const updateListingStatus = (id: string, status: Listing['status']) => {
    setListings(prev => prev.map(l => (l.id === id ? { ...l, status } : l)));
  };

  return { listings, loading, stats, updateListingStatus, refetch: fetchListings };
}
