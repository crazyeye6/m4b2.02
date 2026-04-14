import { Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onListSlot: () => void;
  onHome: () => void;
  onAdmin?: () => void;
}

export default function Header({ onListSlot, onHome, onAdmin }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#161b22]/95 backdrop-blur-md border-b border-[#30363d]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <button onClick={onHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-[#238636] rounded-md flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-[#e6edf3] font-semibold text-sm tracking-tight">
              EndingThisWeek<span className="text-[#3fb950]">.media</span>
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={onHome}
              className="text-[#8b949e] hover:text-[#e6edf3] text-sm font-medium px-3 py-1.5 rounded-md hover:bg-[#21262d] transition-all"
            >
              Opportunities
            </button>
            <a
              href="#how-it-works"
              className="text-[#8b949e] hover:text-[#e6edf3] text-sm font-medium px-3 py-1.5 rounded-md hover:bg-[#21262d] transition-all"
            >
              How it works
            </a>
            <button
              onClick={onListSlot}
              className="text-[#8b949e] hover:text-[#e6edf3] text-sm font-medium px-3 py-1.5 rounded-md hover:bg-[#21262d] transition-all"
            >
              For sellers
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {onAdmin && (
              <button
                onClick={onAdmin}
                className="text-[#8b949e] hover:text-[#e6edf3] text-xs font-medium px-3 py-1.5 rounded-md border border-[#30363d] hover:border-[#484f58] hover:bg-[#21262d] transition-all"
              >
                Admin
              </button>
            )}
            <button
              onClick={onListSlot}
              className="bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium px-4 py-1.5 rounded-md border border-[#2ea043]/40 transition-all"
            >
              List a Slot
            </button>
          </div>

          <button
            className="md:hidden text-[#8b949e] hover:text-[#e6edf3] p-1.5 rounded-md hover:bg-[#21262d] transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#161b22] border-t border-[#30363d] px-4 py-3 space-y-1">
          <button onClick={() => { onHome(); setMobileOpen(false); }} className="block w-full text-left text-[#8b949e] hover:text-[#e6edf3] text-sm px-3 py-2 rounded-md hover:bg-[#21262d] transition-all">Opportunities</button>
          <a href="#how-it-works" className="block text-[#8b949e] hover:text-[#e6edf3] text-sm px-3 py-2 rounded-md hover:bg-[#21262d] transition-all">How it works</a>
          <button onClick={() => { onListSlot(); setMobileOpen(false); }} className="block w-full text-left text-[#8b949e] hover:text-[#e6edf3] text-sm px-3 py-2 rounded-md hover:bg-[#21262d] transition-all">For sellers</button>
          <div className="flex gap-2 pt-2 border-t border-[#30363d] mt-2">
            <button className="flex-1 text-[#e6edf3] text-sm font-medium px-4 py-2 rounded-md border border-[#30363d] hover:bg-[#21262d] transition-all">Sign in</button>
            <button onClick={() => { onListSlot(); setMobileOpen(false); }} className="flex-1 bg-[#238636] text-white text-sm font-medium px-4 py-2 rounded-md border border-[#2ea043]/40 transition-all">List a Slot</button>
          </div>
        </div>
      )}
    </header>
  );
}
