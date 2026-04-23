import { Sparkles, Bell, SlidersHorizontal, Mic2, ArrowRight, CheckCircle } from 'lucide-react';

interface SmartMatchCalloutProps {
  onSignIn: () => void;
  onDashboard: () => void;
  isLoggedIn: boolean;
}

export default function SmartMatchCallout({ onSignIn, onDashboard, isLoggedIn }: SmartMatchCalloutProps) {
  return (
    <section className="bg-white border-t border-slate-100">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          <div>
            <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-semibold px-3 py-1.5 rounded-full mb-5 tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Smart Match System
            </div>

            <h2 className="text-[28px] sm:text-[34px] font-bold text-slate-900 tracking-[-0.03em] leading-tight mb-4">
              Personalized recommendations <br className="hidden sm:block" />
              <span className="text-sky-600">delivered to your inbox.</span>
            </h2>

            <p className="text-[16px] text-slate-500 leading-relaxed mb-6">
              Create a free account to unlock a recommendation engine that matches live slots to your audience, niche, budget, and goals — then sends you a curated digest so you never miss the right deal.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                { icon: <SlidersHorizontal className="w-4 h-4 text-sky-600" />, text: 'Set your preferences once — niche, audience, location, budget' },
                { icon: <Sparkles className="w-4 h-4 text-sky-600" />, text: 'Every listing gets a personal match score based on your criteria' },
                { icon: <Bell className="w-4 h-4 text-sky-600" />, text: 'Configure daily or weekly alert emails with your top-matched slots' },
                { icon: <Mic2 className="w-4 h-4 text-sky-600" />, text: 'Digest emails link directly back to live podcast opportunities' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <span className="text-[14px] text-slate-600 leading-snug pt-1">{item.text}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3">
              {isLoggedIn ? (
                <button
                  onClick={onDashboard}
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-3 rounded-2xl text-sm transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  View My Recommendations
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={onSignIn}
                    className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-3 rounded-2xl text-sm transition-all"
                  >
                    Create a Free Account
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onSignIn}
                    className="inline-flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-5 py-3 rounded-2xl text-sm transition-all"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="bg-[#f5f5f7] border border-slate-200 rounded-3xl p-6 space-y-4">

              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Your Preferences</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['B2B / SaaS', 'US + UK', '$500–$2k budget', 'Mid-roll', 'Weekly shows'].map(tag => (
                    <span key={tag} className="bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'The SaaS Operator', host: 'James Wright', score: 94, downloads: '58k', price: '$1,050', discount: '22% off' },
                  { name: 'AI Frontier Pod', host: 'Maya Chen', score: 87, downloads: '104k', price: '$1,200', discount: '10% off' },
                  { name: 'Dev Unlocked', host: 'Tom Bradley', score: 78, downloads: '38k', price: '$590', discount: '30% off' },
                ].map((card) => (
                  <div key={card.name} className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-bold text-slate-900 truncate">{card.name}</span>
                        <span className="text-[10px] bg-sky-50 border border-sky-200 text-sky-700 font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0">{card.discount}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{card.host} · {card.downloads} downloads/ep</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[13px] font-bold text-slate-900">{card.price}</p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <div className="w-2 h-2 bg-sky-400 rounded-full" />
                        <span className="text-[10px] text-slate-400">{card.score}% match</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 bg-sky-100 border border-sky-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mic2 className="w-4 h-4 text-sky-600" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-sky-800">Weekly digest sent</p>
                  <p className="text-[11px] text-sky-600 mt-0.5">3 new matches this week · 1 slot ending in 6 hours</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <CheckCircle className="w-3 h-3 text-sky-500" />
                    <span className="text-[10px] text-sky-600 font-medium">Links directly to live listings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
