import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, Mic2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import type { Newsletter } from '../../types';
import NewsletterForm from './NewsletterForm';
import NewsletterCard from './NewsletterCard';
import type { NewsletterFormData } from './types';

interface Props {
  onCreateListingForNewsletter?: (newsletter: Newsletter) => void;
  onNewslettersChanged?: (newsletters: Newsletter[]) => void;
}

export default function NewsletterManager({ onCreateListingForNewsletter, onNewslettersChanged }: Props) {
  const { user } = useAuth();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchNewsletters = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('newsletters')
      .select('*')
      .eq('seller_user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    const list = (data as Newsletter[]) ?? [];
    setNewsletters(list);
    onNewslettersChanged?.(list);
    setLoading(false);
  }, [user, onNewslettersChanged]);

  useEffect(() => { fetchNewsletters(); }, [fetchNewsletters]);

  const handleCreate = async (form: NewsletterFormData) => {
    if (!user) return;
    await supabase.from('newsletters').insert({
      seller_user_id: user.id,
      seller_email: user.email,
      name: form.name.trim(),
      publisher_name: form.publisher_name.trim(),
      subscriber_count: form.subscriber_count ? parseInt(form.subscriber_count) : null,
      avg_open_rate: form.avg_open_rate.trim() || null,
      niche: form.niche || null,
      primary_geography: form.primary_geography || null,
      send_frequency: form.send_frequency || null,
      description: form.description.trim() || null,
      website_url: form.website_url.trim() || null,
    });
    setShowForm(false);
    await fetchNewsletters();
  };

  const handleUpdate = async (id: string, form: NewsletterFormData) => {
    await supabase.from('newsletters').update({
      subscriber_count: form.subscriber_count ? parseInt(form.subscriber_count) : null,
      avg_open_rate: form.avg_open_rate.trim() || null,
      niche: form.niche || null,
      primary_geography: form.primary_geography || null,
      send_frequency: form.send_frequency || null,
      description: form.description.trim() || null,
      website_url: form.website_url.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    setEditingId(null);
    await fetchNewsletters();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this podcast? Existing listings will not be affected.')) return;
    await supabase.from('newsletters').update({ is_active: false }).eq('id', id);
    await fetchNewsletters();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-[#1d1d1f] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#6e6e73] text-xs mt-0.5">
            {newsletters.length === 0
              ? 'Add your first podcast to speed up listing creation.'
              : `${newsletters.length} podcast${newsletters.length > 1 ? 's' : ''}`}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); }}
            className="flex items-center gap-1.5 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New podcast
          </button>
        )}
      </div>

      {showForm && (
        <NewsletterForm
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {newsletters.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-10 gap-3 bg-white border border-black/[0.06] rounded-3xl">
          <div className="w-12 h-12 bg-[#f5f5f7] border border-black/[0.06] rounded-2xl flex items-center justify-center">
            <Mic2 className="w-6 h-6 text-[#aeaeb2]" />
          </div>
          <div className="text-center">
            <p className="text-[#1d1d1f] font-semibold text-sm mb-1">No podcasts yet</p>
            <p className="text-[#6e6e73] text-sm mb-4 max-w-xs leading-relaxed">
              Add your podcasts here. When creating a listing, pick a podcast and all its data is filled in automatically.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold text-sm px-5 py-2.5 rounded-2xl transition-all"
            >
              Add first podcast
            </button>
          </div>
        </div>
      )}

      {newsletters.map(nl => (
        editingId === nl.id ? (
          <NewsletterForm
            key={nl.id}
            existing={nl}
            onSave={form => handleUpdate(nl.id, form)}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <NewsletterCard
            key={nl.id}
            newsletter={nl}
            onEdit={() => { setEditingId(nl.id); setShowForm(false); }}
            onDelete={() => handleDelete(nl.id)}
            onCreateListing={() => onCreateListingForNewsletter?.(nl)}
          />
        )
      ))}
    </div>
  );
}
