
interface FooterProps {
  onTerms?: () => void;
  onPrivacy?: () => void;
}

export default function Footer({ onTerms, onPrivacy }: FooterProps) {
  return (
    <footer className="bg-[#1d1d1f] mt-0">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <div className="w-[31px] h-[31px] bg-white/10 rounded-[5px] flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 12 12" fill="none">
                <path d="M7 1L3 7h3.5L4 11l6-6.5H6.5L7 1z" fill="#4ade80" stroke="#22c55e" strokeWidth="0.3" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white font-bold text-[16px] tracking-[-0.03em] leading-none">
              EndingThisWeek
            </span>
            <span className="text-[16px] font-bold text-[#1d1d1f] bg-white px-1.5 py-0.5 rounded-[4px] tracking-[-0.03em] leading-none">
              .media
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={onPrivacy}
              className="text-white/50 hover:text-white text-[13px] transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={onTerms}
              className="text-white/50 hover:text-white text-[13px] transition-colors"
            >
              Terms
            </button>
            <a href="mailto:legal@endingthisweek.media" className="text-white/50 hover:text-white text-[13px] transition-colors">Contact</a>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-white font-bold text-[13px]">
            Last-minute media slots. Priced to move.
          </p>
          <p className="text-white/30 text-[12px] mt-2">
            &copy; 2026 EndingThisWeek.media. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
