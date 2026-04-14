import { Zap } from 'lucide-react';

interface FooterProps {
  onTerms?: () => void;
  onPrivacy?: () => void;
}

export default function Footer({ onTerms, onPrivacy }: FooterProps) {
  return (
    <footer className="border-t border-[#30363d] py-10 mt-12 bg-[#161b22]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#238636] rounded-md flex items-center justify-center">
              <Zap className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="text-[#e6edf3] font-semibold text-sm">
              EndingThisWeek<span className="text-[#3fb950]">.media</span>
            </span>
          </div>

          <p className="text-[#6e7681] text-sm text-center">
            Last-minute media slots. Priced to move.
          </p>

          <div className="flex items-center gap-5">
            <button
              onClick={onPrivacy}
              className="text-[#6e7681] hover:text-[#8b949e] text-sm transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={onTerms}
              className="text-[#6e7681] hover:text-[#8b949e] text-sm transition-colors"
            >
              Terms
            </button>
            <a href="mailto:legal@endingthisweek.media" className="text-[#6e7681] hover:text-[#8b949e] text-sm transition-colors">Contact</a>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-[#21262d] text-center">
          <p className="text-[#484f58] text-xs">
            &copy; 2026 EndingThisWeek.media. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
