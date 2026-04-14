import { Zap, Menu, X, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onListSlot: () => void;
  onHome: () => void;
  onAdmin?: () => void;
  onDashboard: () => void;
  onSignIn: () => void;
}

export default function Header({ onListSlot, onHome, onAdmin, onDashboard, onSignIn }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#161b22]/95 backdrop-blur-md border-b border-[#30363d]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <button onClick={onHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-emerald-600 rounded-md flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-[#e6edf3] font-semibold text-sm tracking-tight">
              EndingThisWeek<span className="text-emerald-400">.media</span>
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
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-[#21262d] border border-[#30363d] hover:border-[#484f58] text-[#e6edf3] text-sm font-medium px-3 py-1.5 rounded-md transition-all"
                >
                  <div className="w-5 h-5 bg-emerald-600/30 border border-emerald-500/30 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="max-w-[120px] truncate">{profile?.display_name || user.email}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#6e7681] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#161b22] border border-[#30363d] rounded-xl shadow-xl z-20 overflow-hidden">
                      <div className="px-3 py-2.5 border-b border-[#30363d]">
                        <p className="text-[#e6edf3] text-xs font-semibold truncate">{profile?.display_name || 'Account'}</p>
                        <p className="text-[#484f58] text-[10px] truncate">{user.email}</p>
                        {profile?.role && (
                          <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded capitalize border ${
                            profile.role === 'seller'
                              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          }`}>
                            {profile.role}
                          </span>
                        )}
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => { setDropdownOpen(false); onDashboard(); }}
                          className="w-full text-left px-3 py-2 text-sm text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] transition-colors"
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={() => { setDropdownOpen(false); signOut(); }}
                          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-[#21262d] transition-colors"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={onSignIn}
                  className="text-[#8b949e] hover:text-[#e6edf3] text-sm font-medium px-3 py-1.5 rounded-md border border-[#30363d] hover:border-[#484f58] hover:bg-[#21262d] transition-all"
                >
                  Sign in
                </button>
                <button
                  onClick={onListSlot}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-1.5 rounded-md border border-emerald-500/30 transition-all"
                >
                  List a Slot
                </button>
              </>
            )}
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
            {user ? (
              <>
                <button onClick={() => { onDashboard(); setMobileOpen(false); }} className="flex-1 text-[#e6edf3] text-sm font-medium px-4 py-2 rounded-md border border-[#30363d] hover:bg-[#21262d] transition-all">Dashboard</button>
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="flex-1 text-red-400 text-sm font-medium px-4 py-2 rounded-md border border-[#30363d] hover:bg-[#21262d] transition-all">Sign out</button>
              </>
            ) : (
              <>
                <button onClick={() => { onSignIn(); setMobileOpen(false); }} className="flex-1 text-[#e6edf3] text-sm font-medium px-4 py-2 rounded-md border border-[#30363d] hover:bg-[#21262d] transition-all">Sign in</button>
                <button onClick={() => { onListSlot(); setMobileOpen(false); }} className="flex-1 bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-md border border-emerald-500/30 transition-all">List a Slot</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
