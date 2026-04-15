import { Menu, X, User, ChevronDown } from 'lucide-react';
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/[0.06]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[52px]">
          <button onClick={onHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
            <div className="w-[22px] h-[22px] bg-[#1d1d1f] rounded-[5px] flex items-center justify-center flex-shrink-0">
              <svg width="13" height="13" viewBox="0 0 10 10" fill="none">
                <rect x="1" y="1" width="3.5" height="8" rx="1" fill="white" opacity="0.9"/>
                <rect x="5.5" y="1" width="3.5" height="5" rx="1" fill="#4ade80"/>
              </svg>
            </div>
            <span className="text-[#1d1d1f] font-bold text-[16px] tracking-[-0.03em] leading-none">
              EndingThisWeek
            </span>
            <span className="text-[16px] font-bold text-white bg-[#1d1d1f] px-1.5 py-0.5 rounded-[4px] tracking-[-0.03em] leading-none">
              .media
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-0">
            <button
              onClick={onHome}
              className="text-[#1d1d1f] hover:text-[#6e6e73] text-[13px] font-medium px-4 py-2 transition-colors"
            >
              Opportunities
            </button>
            <a
              href="#how-it-works"
              className="text-[#1d1d1f] hover:text-[#6e6e73] text-[13px] font-medium px-4 py-2 transition-colors"
            >
              How it works
            </a>
            <button
              onClick={onListSlot}
              className="text-[#1d1d1f] hover:text-[#6e6e73] text-[13px] font-medium px-4 py-2 transition-colors"
            >
              For sellers
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {onAdmin && (
              <button
                onClick={onAdmin}
                className="text-[#6e6e73] hover:text-[#1d1d1f] text-[12px] font-medium px-3 py-1.5 rounded-lg border border-[#d2d2d7] hover:border-[#86868b] transition-all"
              >
                Admin
              </button>
            )}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-[#f5f5f7] border border-[#d2d2d7] hover:border-[#86868b] text-[#1d1d1f] text-[13px] font-medium px-3 py-1.5 rounded-xl transition-all"
                >
                  <div className="w-5 h-5 bg-[#1d1d1f] rounded-full flex items-center justify-center">
                    <User className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="max-w-[120px] truncate">{profile?.display_name || user.email}</span>
                  <ChevronDown className={`w-3 h-3 text-[#6e6e73] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white/95 backdrop-blur-xl border border-black/[0.08] rounded-2xl shadow-xl shadow-black/10 z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-black/[0.06]">
                        <p className="text-[#1d1d1f] text-[12px] font-semibold truncate">{profile?.display_name || 'Account'}</p>
                        <p className="text-[#6e6e73] text-[11px] truncate mt-0.5">{user.email}</p>
                        {profile?.role && (
                          <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize
                            ${profile.role === 'seller'
                              ? 'bg-[#f5f5f7] text-[#1d1d1f]'
                              : 'bg-green-50 text-green-600'
                            }`}>
                            {profile.role}
                          </span>
                        )}
                      </div>
                      <div className="py-1.5">
                        <button
                          onClick={() => { setDropdownOpen(false); onDashboard(); }}
                          className="w-full text-left px-4 py-2 text-[13px] text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={() => { setDropdownOpen(false); signOut(); }}
                          className="w-full text-left px-4 py-2 text-[13px] text-[#ff3b30] hover:bg-[#f5f5f7] transition-colors"
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
                  className="text-[#1d1d1f] hover:text-[#6e6e73] text-[13px] font-medium px-4 py-1.5 rounded-xl border border-[#d2d2d7] hover:border-[#86868b] transition-all"
                >
                  Sign in
                </button>
                <button
                  onClick={onListSlot}
                  className="bg-green-500 hover:bg-green-400 active:bg-green-600 text-white text-[13px] font-semibold px-4 py-1.5 rounded-xl transition-all shadow-sm shadow-green-500/20"
                >
                  List a Slot
                </button>
              </>
            )}
          </div>

          <button
            className="md:hidden text-[#1d1d1f] p-1.5 rounded-lg hover:bg-[#f5f5f7] transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-black/[0.06] px-4 py-3 space-y-0.5">
          <button onClick={() => { onHome(); setMobileOpen(false); }} className="block w-full text-left text-[#1d1d1f] text-[14px] px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-all">Opportunities</button>
          <a href="#how-it-works" className="block text-[#1d1d1f] text-[14px] px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-all">How it works</a>
          <button onClick={() => { onListSlot(); setMobileOpen(false); }} className="block w-full text-left text-[#1d1d1f] text-[14px] px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-all">For sellers</button>
          <div className="flex gap-2 pt-3 border-t border-black/[0.06] mt-2">
            {user ? (
              <>
                <button onClick={() => { onDashboard(); setMobileOpen(false); }} className="flex-1 text-[#1d1d1f] text-[13px] font-medium px-4 py-2.5 rounded-xl border border-[#d2d2d7] hover:bg-[#f5f5f7] transition-all">Dashboard</button>
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="flex-1 text-[#ff3b30] text-[13px] font-medium px-4 py-2.5 rounded-xl border border-[#d2d2d7] hover:bg-[#f5f5f7] transition-all">Sign out</button>
              </>
            ) : (
              <>
                <button onClick={() => { onSignIn(); setMobileOpen(false); }} className="flex-1 text-[#1d1d1f] text-[13px] font-medium px-4 py-2.5 rounded-xl border border-[#d2d2d7] hover:bg-[#f5f5f7] transition-all">Sign in</button>
                <button onClick={() => { onListSlot(); setMobileOpen(false); }} className="flex-1 bg-green-500 hover:bg-green-400 text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-all">List a Slot</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
