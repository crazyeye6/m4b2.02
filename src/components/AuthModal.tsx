import { useState } from 'react';
import { X, Mail, Lock, User, Building2, Loader2, Eye, EyeOff, Zap, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  onClose: () => void;
  defaultTab?: 'sign-in' | 'sign-up';
}

type ModalMode = 'auth' | 'reset' | 'reset-sent' | 'verify-sent';

export default function AuthModal({ onClose, defaultTab = 'sign-in' }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState<'sign-in' | 'sign-up'>(defaultTab);
  const [mode, setMode] = useState<ModalMode>('auth');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

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
      setError('Invalid email or password. Please try again.');
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
      setMode('verify-sent');
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}?reset=true`,
    });
    if (error) {
      setError(error.message || 'Could not send reset email. Please try again.');
    } else {
      setMode('reset-sent');
    }
    setLoading(false);
  };

  if (mode === 'reset-sent') {
    return (
      <ModalShell onClose={onClose}>
        <div className="p-8 text-center">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-[#e6edf3] font-bold text-lg mb-2">Check your inbox</h3>
          <p className="text-[#8b949e] text-sm mb-1">We sent a password reset link to:</p>
          <p className="text-[#e6edf3] font-semibold text-sm mb-6">{resetEmail}</p>
          <p className="text-[#6e7681] text-xs mb-6">Click the link in the email to reset your password. The link expires in 1 hour.</p>
          <button
            onClick={() => { setMode('auth'); setTab('sign-in'); }}
            className="w-full bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3] font-semibold py-2.5 rounded-lg text-sm transition-all"
          >
            Back to sign in
          </button>
        </div>
      </ModalShell>
    );
  }

  if (mode === 'verify-sent') {
    return (
      <ModalShell onClose={onClose}>
        <div className="p-8 text-center">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-[#e6edf3] font-bold text-lg mb-2">Account created</h3>
          <p className="text-[#8b949e] text-sm mb-1">We sent a verification email to:</p>
          <p className="text-[#e6edf3] font-semibold text-sm mb-4">{form.email}</p>
          <p className="text-[#6e7681] text-xs mb-6">Please check your inbox and click the link to verify your email address before signing in.</p>
          <button
            onClick={() => { setMode('auth'); setTab('sign-in'); }}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-all"
          >
            Go to sign in
          </button>
        </div>
      </ModalShell>
    );
  }

  if (mode === 'reset') {
    return (
      <ModalShell onClose={onClose}>
        <div className="p-6">
          <button
            onClick={() => { setMode('auth'); setError(''); }}
            className="flex items-center gap-1.5 text-[#8b949e] hover:text-[#e6edf3] text-xs mb-5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </button>
          <h3 className="text-[#e6edf3] font-bold text-base mb-1">Reset your password</h3>
          <p className="text-[#8b949e] text-xs mb-5">Enter your email and we'll send you a reset link.</p>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <Field
              label="Email address"
              icon={<Mail className="w-3.5 h-3.5" />}
              type="email"
              value={resetEmail}
              onChange={v => { setResetEmail(v); setError(''); }}
              placeholder="you@company.com"
              required
            />
            {error && <ErrorBox message={error} />}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/40 text-white font-semibold py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Send reset link
            </button>
          </form>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="flex border-b border-[#30363d]">
        {(['sign-in', 'sign-up'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(''); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === t
                ? 'text-[#e6edf3] border-b-2 border-emerald-500'
                : 'text-[#8b949e] hover:text-[#c9d1d9]'
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
                        : 'bg-[#21262d] border-[#30363d] text-[#8b949e] hover:border-[#484f58] hover:text-[#c9d1d9]'
                    }`}
                  >
                    {r === 'buyer' ? 'Buyer (Advertiser)' : 'Seller (Creator)'}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#8b949e] mt-1.5">
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs text-[#8b949e] font-medium">Password</label>
            {tab === 'sign-in' && (
              <button
                type="button"
                onClick={() => { setMode('reset'); setResetEmail(form.email); setError(''); }}
                className="text-[10px] text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => update('password', e.target.value)}
              placeholder={tab === 'sign-up' ? 'Min 8 characters' : '••••••••'}
              minLength={tab === 'sign-up' ? 8 : undefined}
              required
              className="w-full bg-[#0d1117] border border-[#30363d] focus:border-emerald-500/50 rounded-lg pl-9 pr-10 py-2.5 text-[#e6edf3] text-sm placeholder-[#6e7681] outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {error && <ErrorBox message={error} />}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/40 text-white font-semibold py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {tab === 'sign-in' ? 'Sign In' : 'Create Account'}
        </button>

        <p className="text-center text-[#8b949e] text-xs">
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
    </ModalShell>
  );
}

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
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
          <button onClick={onClose} className="text-[#8b949e] hover:text-[#e6edf3] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
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
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-[#0d1117] border border-[#30363d] focus:border-emerald-500/50 rounded-lg pl-9 pr-3 py-2.5 text-[#e6edf3] text-sm placeholder-[#6e7681] outline-none transition-colors"
        />
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
      <p className="text-red-400 text-xs">{message}</p>
    </div>
  );
}
