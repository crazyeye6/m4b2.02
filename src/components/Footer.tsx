import { Zap } from 'lucide-react';

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
            <div className="w-5 h-5 bg-[#1d1d1f] rounded-[5px] flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-white fill-white" />
            </div>
            <span className="text-[#1d1d1f] font-semibold text-[13px] tracking-[-0.01em]">
              EndingThisWeek<span className="text-[#6e6e73]">.media</span>
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
