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

    const allTagSlugs = [
      ...(filters.selectedTags ?? []),
      ...(filters.selectedGeographies ?? []),
      ...(filters.selectedNiches ?? []),
    ];
    const hasTagFilter = allTagSlugs.length > 0;

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

    if (filters.endingThisWeek) {
      const endOfWindow = new Date();
      endOfWindow.setDate(endOfWindow.getDate() + 7);
      endOfWindow.setHours(23, 59, 59, 999);
      query = query.lte('deadline_at', endOfWindow.toISOString());
    }

    if (filters.searchQuery && filters.searchQuery.trim()) {
      query = query.textSearch('search_vector', filters.searchQuery.trim(), {
        type: 'websearch',
        config: 'english',
      });
    }

    query = query.order('deadline_at', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    let result = (data as Listing[]) || [];

    if (filters.discountMin > 0) {
      result = result.filter(l => {
        const pct = Math.round(((l.original_price - l.discounted_price) / l.original_price) * 100);
        return pct >= filters.discountMin;
      });
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
