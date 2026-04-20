import { useState, useEffect } from 'react';
import {
  ArrowLeft, Globe, Mail, Users, BarChart2, BookOpen, Zap,
  MapPin, Tag, ExternalLink, Shield, Clock, ChevronRight,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { MediaProfile, Listing } from '../types';

interface MediaProfilePageProps {
  profileId: string;
  onBack: () => void;
  onViewListing: (listing: Listing) => void;
}

function fmtCompact(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

export default function MediaProfilePage({ profileId, onBack, onViewListing }: MediaProfilePageProps) {
  const [profile, setProfile] = useState<MediaProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const [profileRes, listingsRes] = await Promise.all([
        supabase
          .from('media_profiles')
          .select('*')
          .eq('id', profileId)
          .eq('is_active', true)
          .maybeSingle(),
        supabase
          .from('listings')
          .select('*')
          .eq('media_profile_id', profileId)
          .eq('status', 'live')
          .order('deadline_at', { ascending: true }),
      ]);

      if (profileRes.error || !profileRes.data) {
        setNotFound(true);
      } else {
        setProfile(profileRes.data as MediaProfile);
        setListings((listingsRes.data as Listing[]) ?? []);
      }
      setLoading(false);
    }
    fetchData();
  }, [profileId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center pt-[52px]">
        <div className="w-6 h-6 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 pt-[52px]">
        <p className="text-[#1d1d1f] font-semibold text-lg">Media profile not found</p>
        <button onClick={onBack} className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>
      </div>
    );
  }

  const hasStats = profile.subscriber_count || profile.open_rate;

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-[52px]">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] text-sm font-medium transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back
        </button>

        <div className="bg-white rounded-3xl border border-black/[0.06] shadow-sm overflow-hidden mb-6">
          <div className="h-44 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
            {profile.cover_image_url && (
              <img
                src={profile.cover_image_url}
                alt=""
                className="w-full h-full object-cover object-center"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-white border-2 border-white shadow-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                {profile.logo_url ? (
                  <img
                    src={profile.logo_url}
                    alt={profile.newsletter_name}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <BookOpen className="w-7 h-7 text-[#aeaeb2]" />
                )}
              </div>
              <div className="pb-1 min-w-0">
                <h1 className="text-[#1d1d1f] text-2xl font-bold tracking-tight truncate">{profile.newsletter_name}</h1>
                {profile.tagline && (
                  <p className="text-[#6e6e73] text-sm mt-0.5">{profile.tagline}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {profile.category && (
                <span className="inline-flex items-center gap-1.5 bg-[#f5f5f7] border border-black/[0.06] text-[#6e6e73] text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Tag className="w-3 h-3" />
                  {profile.category}
                </span>
              )}
              {profile.primary_geography && (
                <span className="inline-flex items-center gap-1.5 bg-[#f5f5f7] border border-black/[0.06] text-[#6e6e73] text-xs font-semibold px-3 py-1.5 rounded-full">
                  <MapPin className="w-3 h-3" />
                  {profile.primary_geography}
                </span>
              )}
              {profile.audience_type && (
                <span className="inline-flex items-center gap-1.5 bg-[#f5f5f7] border border-black/[0.06] text-[#6e6e73] text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Users className="w-3 h-3" />
                  {profile.audience_type}
                </span>
              )}
              {profile.publishing_frequency && (
                <span className="inline-flex items-center gap-1.5 bg-[#f5f5f7] border border-black/[0.06] text-[#6e6e73] text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Clock className="w-3 h-3" />
                  {profile.publishing_frequency}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Website
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
              {profile.sample_issue_url && (
                <a
                  href={profile.sample_issue_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Sample issue
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
              {profile.media_kit_url && (
                <a
                  href={profile.media_kit_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Media kit
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">

          {hasStats && (
            <div className="bg-white rounded-3xl border border-black/[0.06] shadow-sm p-6">
              <h2 className="text-[#1d1d1f] font-semibold text-sm mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-teal-500" />
                Audience Stats
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {profile.subscriber_count != null && (
                  <div>
                    <p className="text-[#1d1d1f] text-2xl font-bold tracking-tight">{fmtCompact(profile.subscriber_count)}</p>
                    <p className="text-[#6e6e73] text-xs font-medium mt-0.5">Subscribers</p>
                  </div>
                )}
                {profile.open_rate && (
                  <div>
                    <p className="text-teal-600 text-2xl font-bold tracking-tight">{profile.open_rate}</p>
                    <p className="text-[#6e6e73] text-xs font-medium mt-0.5">Open rate</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {profile.audience_summary && (
            <div className="bg-white rounded-3xl border border-black/[0.06] shadow-sm p-6">
              <h2 className="text-[#1d1d1f] font-semibold text-sm mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-500" />
                Audience
              </h2>
              <p className="text-[#6e6e73] text-sm leading-relaxed">{profile.audience_summary}</p>
            </div>
          )}

          {profile.ad_formats.length > 0 && (
            <div className="bg-white rounded-3xl border border-black/[0.06] shadow-sm p-6">
              <h2 className="text-[#1d1d1f] font-semibold text-sm mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Ad Formats
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.ad_formats.map(f => (
                  <span key={f} className="bg-[#f5f5f7] border border-black/[0.06] text-[#6e6e73] text-xs font-medium px-3 py-1.5 rounded-full">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.past_advertisers.length > 0 && (
            <div className="bg-white rounded-3xl border border-black/[0.06] shadow-sm p-6">
              <h2 className="text-[#1d1d1f] font-semibold text-sm mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                Past Advertisers
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.past_advertisers.map(a => (
                  <span key={a} className="bg-green-50 border border-green-100 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {listings.length > 0 && (
          <div>
            <h2 className="text-[#1d1d1f] font-semibold text-base mb-3">Available Ad Slots</h2>
            <div className="space-y-3">
              {listings.map(listing => {
                const deadline = new Date(listing.deadline_at).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric',
                });
                return (
                  <button
                    key={listing.id}
                    onClick={() => onViewListing(listing)}
                    className="w-full bg-white rounded-2xl border border-black/[0.06] shadow-sm hover:shadow-md hover:border-black/[0.10] transition-all p-4 flex items-center gap-4 text-left group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1d1d1f] font-semibold text-sm truncate">{listing.slot_type || listing.property_name}</p>
                      <p className="text-[#6e6e73] text-xs mt-0.5">Book by {deadline}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[#1d1d1f] font-bold text-base">
                        £{listing.discounted_price.toLocaleString()}
                      </p>
                      {listing.slots_remaining <= 3 && (
                        <p className="text-orange-500 text-xs font-medium">{listing.slots_remaining} slot{listing.slots_remaining !== 1 ? 's' : ''} left</p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#aeaeb2] flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
