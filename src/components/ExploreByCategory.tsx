import { Newspaper, Mic2, Users, Monitor, Handshake, Calendar, ArrowRight } from 'lucide-react';

interface ExploreByCategoryProps {
  onBrowse: () => void;
}

const CATEGORIES = [
  {
    icon: <Newspaper className="w-6 h-6" />,
    title: 'Newsletters',
    desc: 'Sponsored placements in niche email newsletters with loyal, engaged audiences.',
    cta: 'Explore Newsletters',
    color: 'from-blue-500 to-teal-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    iconColor: 'text-blue-600',
    badge: 'Live now',
    badgeColor: 'bg-blue-100 text-blue-700',
    available: true,
  },
  {
    icon: <Mic2 className="w-6 h-6" />,
    title: 'Podcasts',
    desc: 'Pre-roll, mid-roll, and host-read sponsorship slots in independent podcasts.',
    cta: 'Explore Podcasts',
    color: 'from-orange-500 to-rose-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    iconColor: 'text-orange-600',
    badge: 'Coming soon',
    badgeColor: 'bg-orange-100 text-orange-700',
    available: false,
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Influencers',
    desc: 'Time-sensitive creator collaboration opportunities across social platforms.',
    cta: 'Explore Influencers',
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    iconColor: 'text-rose-600',
    badge: 'Coming soon',
    badgeColor: 'bg-rose-100 text-rose-700',
    available: false,
  },
  {
    icon: <Monitor className="w-6 h-6" />,
    title: 'Website Ads',
    desc: 'Display placements, sponsored articles, and digital inventory from media owners.',
    cta: 'Explore Website Ads',
    color: 'from-sky-500 to-blue-500',
    bg: 'bg-sky-50',
    border: 'border-sky-100',
    iconColor: 'text-sky-600',
    badge: 'Coming soon',
    badgeColor: 'bg-sky-100 text-sky-700',
    available: false,
  },
  {
    icon: <Handshake className="w-6 h-6" />,
    title: 'Sponsorships',
    desc: 'Bigger brand partnership opportunities across creator and media properties.',
    cta: 'Explore Sponsorships',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    iconColor: 'text-emerald-600',
    badge: 'Coming soon',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    available: false,
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: 'Events',
    desc: 'Event, webinar, and live audience sponsorship opportunities.',
    cta: 'Explore Events',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    iconColor: 'text-amber-600',
    badge: 'Coming soon',
    badgeColor: 'bg-amber-100 text-amber-700',
    available: false,
  },
];

export default function ExploreByCategory({ onBrowse }: ExploreByCategoryProps) {
  return (
    <section className="py-20 bg-[#f5f5f7] border-t border-black/[0.06]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[#86868b] mb-3">Browse by format</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-[28px] sm:text-[34px] font-semibold text-[#1d1d1f] tracking-[-0.02em] leading-tight">
                Explore by category
              </h2>
              <p className="text-[#6e6e73] text-[16px] mt-2 font-light max-w-xl">
                From newsletters to podcasts, influencers to live events — find the right creator channel for your campaign.
              </p>
            </div>
            <button
              onClick={onBrowse}
              className="flex-shrink-0 flex items-center gap-2 text-[13px] font-semibold text-[#1d1d1f] hover:text-[#1F7A63] transition-colors"
            >
              View all opportunities <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.title}
              onClick={onBrowse}
              className={`group text-left bg-white border rounded-3xl p-6 transition-all duration-200 hover:shadow-lg hover:shadow-black/[0.06] hover:-translate-y-0.5 ${cat.available ? 'hover:border-black/[0.12]' : 'opacity-80 hover:opacity-100'} border-black/[0.06]`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${cat.bg} border ${cat.border} rounded-2xl flex items-center justify-center ${cat.iconColor} transition-transform duration-200 group-hover:scale-105`}>
                  {cat.icon}
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cat.badgeColor}`}>
                  {cat.badge}
                </span>
              </div>

              <h3 className="text-[#1d1d1f] font-semibold text-[17px] mb-2 tracking-[-0.01em]">{cat.title}</h3>
              <p className="text-[#6e6e73] text-[13px] leading-relaxed mb-5">{cat.desc}</p>

              <div className={`flex items-center gap-1.5 text-[13px] font-semibold transition-colors ${cat.available ? 'text-[#1F7A63] group-hover:text-[#186453]' : 'text-[#aeaeb2]'}`}>
                {cat.cta}
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
