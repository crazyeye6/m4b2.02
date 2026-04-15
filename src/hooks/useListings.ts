import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Listing, FilterState } from '../types';

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

    if (filters.dateFrom) {
      query = query.gte('deadline_at', new Date(filters.dateFrom).toISOString());
    }

    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      query = query.lte('deadline_at', end.toISOString());
    }

    query = query.order('deadline_at', { ascending: true });

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
