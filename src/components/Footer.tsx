
interface FooterProps {
  onTerms?: () => void;
  onPrivacy?: () => void;
}

export default function Footer({ onTerms, onPrivacy }: FooterProps) {
  return (
    <footer className="border-t border-black/[0.06] py-10 mt-0 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <div className="w-[20px] h-[20px] bg-[#1d1d1f] rounded-[4px] flex items-center justify-center flex-shrink-0">
              <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                <rect x="1" y="1" width="3.5" height="8" rx="1" fill="white" opacity="0.9"/>
                <rect x="5.5" y="1" width="3.5" height="5" rx="1" fill="#4ade80"/>
              </svg>
            </div>
            <span className="text-[#1d1d1f] font-bold text-[15px] tracking-[-0.03em] leading-none">
              EndingThisWeek
            </span>
            <span className="text-[15px] font-bold text-white bg-[#1d1d1f] px-1.5 py-0.5 rounded-[4px] tracking-[-0.03em] leading-none">
              .media
            </span>
          </div>

          <p className="text-[#6e6e73] text-[13px] text-center">
            Last-minute media slots. Priced to move.
          </p>

          <div className="flex items-center gap-6">
            <button
              onClick={onPrivacy}
              className="text-[#6e6e73] hover:text-[#1d1d1f] text-[13px] transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={onTerms}
              className="text-[#6e6e73] hover:text-[#1d1d1f] text-[13px] transition-colors"
            >
              Terms
            </button>
            <a href="mailto:legal@endingthisweek.media" className="text-[#6e6e73] hover:text-[#1d1d1f] text-[13px] transition-colors">Contact</a>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-black/[0.04] text-center">
          <p className="text-[#aeaeb2] text-[12px]">
            &copy; 2026 EndingThisWeek.media. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
