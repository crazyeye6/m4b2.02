import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

const STORAGE_KEY = 'etw_preview_auth';
const PASSWORD = import.meta.env.VITE_PREVIEW_PASSWORD as string | undefined;

interface PreviewGateProps {
  children: React.ReactNode;
}

export default function PreviewGate({ children }: PreviewGateProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!PASSWORD) {
      setUnlocked(true);
      return;
    }
    if (sessionStorage.getItem(STORAGE_KEY) === PASSWORD) {
      setUnlocked(true);
    }
  }, []);

  if (!PASSWORD || unlocked) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, PASSWORD);
      setUnlocked(true);
    } else {
      setError(true);
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center px-4">
      <div className={`w-full max-w-sm ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        <div className="bg-white border border-black/[0.08] rounded-3xl shadow-xl shadow-black/[0.06] p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-[#1d1d1f] rounded-2xl flex items-center justify-center mb-4">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-[#1d1d1f] font-semibold text-xl tracking-[-0.02em]">Private preview</h1>
            <p className="text-[#6e6e73] text-sm mt-1.5 text-center leading-relaxed">
              This site is password protected while under development.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                type="password"
                value={input}
                onChange={e => { setInput(e.target.value); setError(false); }}
                placeholder="Enter password"
                autoFocus
                className={`w-full px-4 py-3 rounded-2xl border text-[#1d1d1f] text-sm outline-none transition-all placeholder:text-[#aeaeb2] ${
                  error
                    ? 'border-red-300 bg-red-50 focus:border-red-400'
                    : 'border-black/[0.10] bg-[#fafafa] focus:border-black/[0.30] focus:bg-white'
                }`}
              />
              {error && (
                <p className="text-red-500 text-xs mt-1.5 ml-1">Incorrect password. Please try again.</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold py-3 rounded-2xl text-sm transition-all"
            >
              Continue
            </button>
          </form>
        </div>

        <p className="text-center text-[#aeaeb2] text-xs mt-6">
          Ending This Week &mdash; Coming soon
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(6px); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
          75% { transform: translateX(-2px); }
          90% { transform: translateX(2px); }
        }
      `}</style>
    </div>
  );
}
