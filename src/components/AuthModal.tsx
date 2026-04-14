import { useState } from 'react';
import { X, Mail, Lock, User, Building2, Loader2, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
  defaultTab?: 'sign-in' | 'sign-up';
}

export default function AuthModal({ onClose, defaultTab = 'sign-in' }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState<'sign-in' | 'sign-up'>(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    displayName: '',
    company: '',
    role: 'buyer' as 'buyer' | 'seller',
  });

  const update = (k: keyof typeof form, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setError('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await signIn(form.email, form.password);
    if (error) {
      setError('Invalid email or password.');
    } else {
      onClose();
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.displayName.trim()) { setError('Please enter your name.'); return; }
    if (!form.company.trim()) { setError('Please enter your company name.'); return; }
    setLoading(true);
    setError('');
    const { error } = await signUp(form.email, form.password, form.role, form.displayName, form.company);
    if (error) {
      setError(error.message || 'Could not create account. Please try again.');
    } else {
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between px-6 py-5 border-b border-[#30363d]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-600 rounded-md flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-[#e6edf3] font-bold text-sm">EndingThisWeek.media</span>
          </div>
          <button onClick={onClose} className="text-[#6e7681] hover:text-[#e6edf3] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-[#30363d]">
          {(['sign-in', 'sign-up'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                tab === t
                  ? 'text-[#e6edf3] border-b-2 border-emerald-500'
                  : 'text-[#6e7681] hover:text-[#8b949e]'
              }`}
            >
              {t === 'sign-in' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={tab === 'sign-in' ? handleSignIn : handleSignUp} className="p-6 space-y-4">
          {tab === 'sign-up' && (
            <>
              <div>
                <label className="block text-xs text-[#8b949e] font-medium mb-1.5">I am a</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['buyer', 'seller'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => update('role', r)}
                      className={`py-2.5 rounded-lg text-sm font-semibold border transition-all capitalize ${
                        form.role === r
                          ? r === 'buyer'
                            ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
                            : 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                          : 'bg-[#21262d] border-[#30363d] text-[#6e7681] hover:border-[#484f58] hover:text-[#8b949e]'
                      }`}
                    >
                      {r === 'buyer' ? 'Buyer (Advertiser)' : 'Seller (Creator)'}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#6e7681] mt-1.5">
                  {form.role === 'buyer'
                    ? 'Browse and secure media slots for your campaigns.'
                    : 'List your newsletter, podcast, or influencer slots.'}
                </p>
              </div>

              <Field
                label="Full name"
                icon={<User className="w-3.5 h-3.5" />}
                type="text"
                value={form.displayName}
                onChange={v => update('displayName', v)}
                placeholder="Jane Smith"
                required
              />

              <Field
                label="Company"
                icon={<Building2 className="w-3.5 h-3.5" />}
                type="text"
                value={form.company}
                onChange={v => update('company', v)}
                placeholder="Acme Corp"
                required
              />
            </>
          )}

          <Field
            label="Email address"
            icon={<Mail className="w-3.5 h-3.5" />}
            type="email"
            value={form.email}
            onChange={v => update('email', v)}
            placeholder="you@company.com"
            required
          />

          <div>
            <label className="block text-xs text-[#8b949e] font-medium mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7681]">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => update('password', e.target.value)}
                placeholder={tab === 'sign-up' ? 'Min 8 characters' : '••••••••'}
                minLength={tab === 'sign-up' ? 8 : undefined}
                required
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-emerald-500/50 rounded-lg pl-9 pr-10 py-2.5 text-[#e6edf3] text-sm placeholder-[#484f58] outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6e7681] hover:text-[#8b949e]"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/40 text-white font-semibold py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {tab === 'sign-in' ? 'Sign In' : 'Create Account'}
          </button>

          <p className="text-center text-[#6e7681] text-xs">
            {tab === 'sign-in' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setTab(tab === 'sign-in' ? 'sign-up' : 'sign-in'); setError(''); }}
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              {tab === 'sign-in' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  label, icon, type, value, onChange, placeholder, required,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-[#8b949e] font-medium mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7681]">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-[#0d1117] border border-[#30363d] focus:border-emerald-500/50 rounded-lg pl-9 pr-3 py-2.5 text-[#e6edf3] text-sm placeholder-[#484f58] outline-none transition-colors"
        />
      </div>
    </div>
  );
}
