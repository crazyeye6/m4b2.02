import { Menu, X, User, ChevronDown, Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { SUPPORTED_LANGUAGES, SUPPORTED_CURRENCIES } from '../lib/localeConfig';
import { useTranslations } from '../hooks/useTranslations';

interface HeaderProps {
  onListSlot: () => void;
  onHome: () => void;
  onAdmin?: () => void;
  onDashboard: () => void;
  onSignIn: () => void;
  onOpportunities?: () => void;
  onPodcasts?: () => void;
  onHowItWorks?: () => void;
}

export default function Header({ onListSlot, onHome, onAdmin, onDashboard, onSignIn, onOpportunities, onPodcasts, onHowItWorks }: HeaderProps) {
  const handleOpportunities = () => {
    if (onOpportunities) {
      onOpportunities();
    } else {
      onHome();
    }
  };

  const handleHowItWorks = (e: React.MouseEvent) => {
    if (onHowItWorks) {
      e.preventDefault();
      onHowItWorks();
    }
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const userBtnRef = useRef<HTMLButtonElement>(null);
  const [localeOpen, setLocaleOpen] = useState(false);
  const localeRef = useRef<HTMLDivElement>(null);

  const { language, currency, setLanguage, setCurrency } = useLocale();
  const tx = useTranslations();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (localeRef.current && !localeRef.current.contains(e.target as Node)) {
        setLocaleOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/[0.06]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[52px]">
          <button onClick={onHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
            <div className="w-[31px] h-[31px] bg-[#1d1d1f] rounded-[5px] flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 12 12" fill="none">
                <path d="M7 1L3 7h3.5L4 11l6-6.5H6.5L7 1z" fill="#4ade80" stroke="#22c55e" strokeWidth="0.3" strokeLinejoin="round"/>
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
            {onPodcasts && (
              <button
                onClick={onPodcasts}
                className="flex items-center gap-1.5 text-[#1d1d1f] hover:text-[#6e6e73] text-[13px] font-medium px-4 py-2 transition-colors"
              >
                Podcasts
              </button>
            )}
            <button
              onClick={handleOpportunities}
              className="text-[#1d1d1f] hover:text-[#6e6e73] text-[13px] font-medium px-4 py-2 transition-colors"
            >
              Newsletters
            </button>
            <a
              href="#how-it-works"
              onClick={handleHowItWorks}
              className="text-[#1d1d1f] hover:text-[#6e6e73] text-[13px] font-medium px-4 py-2 transition-colors"
            >
              {tx.nav.howItWorks}
            </a>
            <button
              onClick={onListSlot}
              className="text-[#1d1d1f] hover:text-[#6e6e73] text-[13px] font-medium px-4 py-2 transition-colors"
            >
              {tx.nav.forSellers}
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {/* Locale selector */}
            <div className="relative" ref={localeRef}>
              <button
                onClick={() => setLocaleOpen(!localeOpen)}
                className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] text-[12px] font-medium px-3 py-1.5 rounded-lg border border-[#d2d2d7] hover:border-[#86868b] transition-all"
                title="Language & Currency"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language.flag}</span>
                <span className="text-[11px] font-semibold text-[#1d1d1f]">{currency.code}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${localeOpen ? 'rotate-180' : ''}`} />
              </button>

              {localeOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white/95 backdrop-blur-xl border border-black/[0.08] rounded-2xl shadow-xl shadow-black/10 z-30 overflow-hidden">
                  <div className="px-4 pt-3.5 pb-2 border-b border-black/[0.06]">
                    <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-widest">{tx.locale.language}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-2">
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code); }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all text-[12px]
                          ${language.code === lang.code
                            ? 'bg-[#1d1d1f] text-white font-semibold'
                            : 'text-[#3a3a3c] hover:bg-[#f5f5f7]'
                          }`}
                      >
                        <span className="text-[14px]">{lang.flag}</span>
                        <span className="truncate">{lang.nativeName}</span>
                      </button>
                    ))}
                  </div>

                  <div className="px-4 pt-2.5 pb-2 border-t border-black/[0.06]">
                    <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-widest">{tx.locale.currency}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-2 max-h-[220px] overflow-y-auto">
                    {SUPPORTED_CURRENCIES.map(cur => (
                      <button
                        key={cur.code}
                        onClick={() => { setCurrency(cur.code); }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all text-[12px]
                          ${currency.code === cur.code
                            ? 'bg-[#1d1d1f] text-white font-semibold'
                            : 'text-[#3a3a3c] hover:bg-[#f5f5f7]'
                          }`}
                      >
                        <span className="font-bold text-[13px] w-6 flex-shrink-0">{cur.symbol}</span>
                        <span className="truncate">{cur.code}</span>
                      </button>
                    ))}
                  </div>

                  <div className="px-4 py-2 border-t border-black/[0.06] bg-[#f5f5f7]">
                    <p className="text-[10px] text-[#aeaeb2]">{tx.locale.priceNote}</p>
                  </div>
                </div>
              )}
            </div>

            {onAdmin && (
              <button
                onClick={onAdmin}
                className="text-[#6e6e73] hover:text-[#1d1d1f] text-[12px] font-medium px-3 py-1.5 rounded-lg border border-[#d2d2d7] hover:border-[#86868b] transition-all"
              >
                {tx.nav.admin}
              </button>
            )}
            {user ? (
              <div className="relative">
                <button
                  ref={userBtnRef}
                  onClick={() => {
                    if (!dropdownOpen && userBtnRef.current) {
                      const rect = userBtnRef.current.getBoundingClientRect();
                      setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
                    }
                    setDropdownOpen(!dropdownOpen);
                  }}
                  className="flex items-center gap-2 bg-[#f5f5f7] border border-[#d2d2d7] hover:border-[#86868b] text-[#1d1d1f] text-[13px] font-medium px-3 py-1.5 rounded-xl transition-all"
                >
                  <div className="w-5 h-5 bg-[#1d1d1f] rounded-full flex items-center justify-center">
                    <User className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="max-w-[120px] truncate">{profile?.display_name || user.email}</span>
                  <ChevronDown className={`w-3 h-3 text-[#6e6e73] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && createPortal(
                  <>
                    <div className="fixed inset-0 z-[199]" onClick={() => setDropdownOpen(false)} />
                    <div
                      className="fixed w-52 bg-white/95 backdrop-blur-xl border border-black/[0.08] rounded-2xl shadow-xl shadow-black/10 z-[200] overflow-hidden"
                      style={dropdownPos}
                    >
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
                          {tx.nav.dashboard}
                        </button>
                        <button
                          onClick={() => { setDropdownOpen(false); signOut(); }}
                          className="w-full text-left px-4 py-2 text-[13px] text-[#ff3b30] hover:bg-[#f5f5f7] transition-colors"
                        >
                          {tx.nav.signOut}
                        </button>
                      </div>
                    </div>
                  </>,
                  document.body
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={onSignIn}
                  className="text-[#1d1d1f] hover:text-[#6e6e73] text-[13px] font-medium px-4 py-1.5 rounded-xl border border-[#d2d2d7] hover:border-[#86868b] transition-all"
                >
                  {tx.nav.signIn}
                </button>
                <button
                  onClick={onListSlot}
                  className="bg-green-500 hover:bg-green-400 active:bg-green-600 text-white text-[13px] font-semibold px-4 py-1.5 rounded-xl transition-all shadow-sm shadow-green-500/20"
                >
                  {tx.nav.listSlot}
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
          {onPodcasts && (
            <button onClick={() => { onPodcasts(); setMobileOpen(false); }} className="block w-full text-left text-[#1d1d1f] text-[14px] px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-all">
              Podcasts
            </button>
          )}
          <button onClick={() => { handleOpportunities(); setMobileOpen(false); }} className="block w-full text-left text-[#1d1d1f] text-[14px] px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-all">Newsletters</button>
          <a
            href="#how-it-works"
            onClick={(e) => {
              if (onHowItWorks) { e.preventDefault(); onHowItWorks(); }
              setMobileOpen(false);
            }}
            className="block text-[#1d1d1f] text-[14px] px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-all"
          >{tx.nav.howItWorks}</a>
          <button onClick={() => { onListSlot(); setMobileOpen(false); }} className="block w-full text-left text-[#1d1d1f] text-[14px] px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-all">{tx.nav.forSellers}</button>

          {/* Mobile locale selectors */}
          <div className="pt-2 border-t border-black/[0.06] mt-2">
            <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-widest px-3 mb-2">{tx.locale.language}</p>
            <div className="grid grid-cols-4 gap-1">
              {SUPPORTED_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl text-center transition-all
                    ${language.code === lang.code ? 'bg-[#1d1d1f] text-white' : 'text-[#3a3a3c] hover:bg-[#f5f5f7]'}`}
                >
                  <span className="text-[16px]">{lang.flag}</span>
                  <span className="text-[9px] font-medium">{lang.code.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-widest px-3 mb-2">{tx.locale.currency}</p>
            <div className="grid grid-cols-4 gap-1">
              {SUPPORTED_CURRENCIES.slice(0, 8).map(cur => (
                <button
                  key={cur.code}
                  onClick={() => setCurrency(cur.code)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl text-center transition-all
                    ${currency.code === cur.code ? 'bg-[#1d1d1f] text-white' : 'text-[#3a3a3c] hover:bg-[#f5f5f7]'}`}
                >
                  <span className="text-[13px] font-bold">{cur.symbol}</span>
                  <span className="text-[9px] font-medium">{cur.code}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-3 border-t border-black/[0.06] mt-2">
            {user ? (
              <>
                <button onClick={() => { onDashboard(); setMobileOpen(false); }} className="flex-1 text-[#1d1d1f] text-[13px] font-medium px-4 py-2.5 rounded-xl border border-[#d2d2d7] hover:bg-[#f5f5f7] transition-all">{tx.nav.dashboard}</button>
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="flex-1 text-[#ff3b30] text-[13px] font-medium px-4 py-2.5 rounded-xl border border-[#d2d2d7] hover:bg-[#f5f5f7] transition-all">{tx.nav.signOut}</button>
              </>
            ) : (
              <>
                <button onClick={() => { onSignIn(); setMobileOpen(false); }} className="flex-1 text-[#1d1d1f] text-[13px] font-medium px-4 py-2.5 rounded-xl border border-[#d2d2d7] hover:bg-[#f5f5f7] transition-all">{tx.nav.signIn}</button>
                <button onClick={() => { onListSlot(); setMobileOpen(false); }} className="flex-1 bg-green-500 hover:bg-green-400 text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-all">{tx.nav.listSlot}</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
