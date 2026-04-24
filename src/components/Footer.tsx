import { Mic2 } from 'lucide-react';
import { useTranslations } from '../hooks/useTranslations';

interface FooterProps {
  onTerms?: () => void;
  onPrivacy?: () => void;
  onContact?: () => void;
}

export default function Footer({ onTerms, onPrivacy, onContact }: FooterProps) {
  const tx = useTranslations();
  return (
    <footer className="bg-[#1d1d1f]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">

        {/* Top row: brand + columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-white/[0.08]">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-[31px] h-[31px] bg-white/10 rounded-[5px] flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 12 12" fill="none">
                  <path d="M7 1L3 7h3.5L4 11l6-6.5H6.5L7 1z" fill="#4ade80" stroke="#22c55e" strokeWidth="0.3" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-white font-bold text-[15px] tracking-[-0.03em]">EndingThisWeek</span>
              <span className="text-[15px] font-bold text-[#1d1d1f] bg-white px-1.5 py-0.5 rounded-[4px] tracking-[-0.03em]">.media</span>
            </div>
            <p className="text-white/40 text-[13px] leading-relaxed max-w-[220px]">
              A live feed of open podcast ad slots. Secure before they default to programmatic.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse flex-shrink-0" />
              <span className="text-sky-400 text-[12px] font-semibold">Slots ending this week</span>
            </div>
          </div>

          {/* For Buyers */}
          <div>
            <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-4">For Buyers</p>
            <ul className="space-y-2.5">
              {[
                'Browse open slots',
                'Host-read placements',
                'Pre-roll & mid-roll inventory',
                'Slots closing this week',
                'Niche audience targeting',
              ].map(item => (
                <li key={item} className="text-white/50 text-[13px] hover:text-white/80 transition-colors cursor-default">{item}</li>
              ))}
            </ul>
          </div>

          {/* For Podcast Hosts */}
          <div>
            <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-4">For Podcast Hosts</p>
            <ul className="space-y-2.5">
              {[
                'Submit open slots via email',
                'Fill inventory before it defaults',
                'Reach active buyers this week',
                'No commission on the deal',
                'Keep 95% direct from brands',
              ].map(item => (
                <li key={item} className="text-white/50 text-[13px] hover:text-white/80 transition-colors cursor-default">{item}</li>
              ))}
            </ul>
          </div>

          {/* Ad Formats */}
          <div>
            <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-4">Ad Formats</p>
            <ul className="space-y-2.5">
              {[
                { label: 'Pre-roll', desc: '15–30s before episode' },
                { label: 'Mid-roll', desc: '30–60s mid-episode' },
                { label: 'Post-roll', desc: '15–30s at end' },
                { label: 'Host-read', desc: 'Personalised endorsement' },
                { label: 'Show notes', desc: 'Link + description' },
              ].map(f => (
                <li key={f.label} className="flex items-start gap-2">
                  <Mic2 className="w-3 h-3 text-sky-500 mt-0.5 flex-shrink-0" />
                  <span className="text-white/50 text-[13px]">
                    <span className="text-white/70 font-medium">{f.label}</span>
                    <span className="text-white/30"> — {f.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-[12px]">
            &copy; 2026 EndingThisWeek.media. All rights reserved.
          </p>
          <p className="text-white/40 text-[13px] font-medium order-first sm:order-none">
            {tx.footer.tagline}
          </p>
          <div className="flex items-center gap-5">
            <button onClick={onPrivacy} className="text-white/35 hover:text-white/70 text-[12px] transition-colors">{tx.footer.privacy}</button>
            <button onClick={onTerms} className="text-white/35 hover:text-white/70 text-[12px] transition-colors">{tx.footer.terms}</button>
            <button onClick={onContact} className="text-white/35 hover:text-white/70 text-[12px] transition-colors">{tx.footer.contact}</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
