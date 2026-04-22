import { useState } from 'react';
import { X, Mail, Lock, User, Building2, Loader2, Eye, EyeOff, Zap, ArrowLeft, CheckCircle } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import BuyerPreferencesStep from './BuyerPreferencesStep';
import type { DigestPreferences } from '../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
  defaultTab?: 'sign-in' | 'sign-up';
}

type ModalMode = 'auth' | 'reset' | 'reset-sent' | 'buyer-preferences';

export default function AuthModal({ onClose, defaultTab = 'sign-in' }: AuthModalProps) {
  const { signIn, signUp, saveDigestPreferences, user } = useAuth();
  const [tab, setTab] = useState<'sign-in' | 'sign-up'>(defaultTab);
  const [mode, setMode] = useState<ModalMode>('auth');
  const [loading, setLoading] = useState(false);
  const [prefSaving, setPrefSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newUserId, setNewUserId] = useState<string | null>(null);

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
      setError(error.message || 'Invalid email or password. Please try again.');
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
      setLoading(false);
      return;
    }

    if (form.role === 'buyer') {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) setNewUserId(userData.user.id);
      setMode('buyer-preferences');
    } else {
      onClose();
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

  const handleSavePreferences = async (prefs: DigestPreferences) => {
    setPrefSaving(true);
    const uid = newUserId || user?.id;
    if (uid) {
      await saveDigestPreferences(uid, prefs);
    }
    setPrefSaving(false);
    onClose();
  };

  const handleSkipPreferences = () => {
    onClose();
  };

  if (mode === 'buyer-preferences') {
    return (
      <ModalShell onClose={onClose}>
        <BuyerPreferencesStep
          onSave={handleSavePreferences}
          onSkip={handleSkipPreferences}
          saving={prefSaving}
        />
      </ModalShell>
    );
  }

  if (mode === 'reset-sent') {
    return (
      <ModalShell onClose={onClose}>
        <div className="p-8 text-center">
          <div className="w-14 h-14 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="text-[#1d1d1f] font-semibold text-[17px] mb-2">Check your inbox</h3>
          <p className="text-[#6e6e73] text-[13px] mb-1">We sent a password reset link to:</p>
          <p className="text-[#1d1d1f] font-semibold text-[14px] mb-5">{resetEmail}</p>
          <p className="text-[#aeaeb2] text-[12px] mb-6">Click the link in the email to reset your password. The link expires in 1 hour.</p>
          <button
            onClick={() => { setMode('auth'); setTab('sign-in'); }}
            className="w-full bg-[#f5f5f7] hover:bg-[#e5e5ea] border border-black/[0.08] text-[#1d1d1f] font-semibold py-3 rounded-2xl text-[14px] transition-all"
          >
            Back to sign in
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
            className="flex items-center gap-1.5 text-[#6e6e73] hover:text-[#1d1d1f] text-[12px] mb-5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </button>
          <h3 className="text-[#1d1d1f] font-semibold text-[17px] mb-1">Reset your password</h3>
          <p className="text-[#6e6e73] text-[13px] mb-5">Enter your email and we'll send you a reset link.</p>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <AuthField
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
              className="w-full bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 text-white font-semibold py-3 rounded-2xl text-[14px] transition-all flex items-center justify-center gap-2"
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
      <div className="flex border-b border-black/[0.06]">
        {(['sign-in', 'sign-up'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(''); }}
            className={`flex-1 py-3.5 text-[13px] font-semibold transition-colors relative ${
              tab === t
                ? 'text-[#1d1d1f]'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            {t === 'sign-in' ? 'Sign In' : 'Create Account'}
            {tab === t && (
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#1d1d1f] rounded-full" />
            )}
          </button>
        ))}
      </div>

      <form onSubmit={tab === 'sign-in' ? handleSignIn : handleSignUp} className="p-6 space-y-4">
        {tab === 'sign-up' && (
          <>
            <div>
              <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {(['buyer', 'seller'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => update('role', r)}
                    className={`py-2.5 rounded-2xl text-[13px] font-semibold border transition-all capitalize ${
                      form.role === r
                        ? r === 'buyer'
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-[#f5f5f7] border-black/[0.06] text-[#6e6e73] hover:border-black/[0.12] hover:text-[#1d1d1f]'
                    }`}
                  >
                    {r === 'buyer' ? 'Buyer (Advertiser)' : 'Seller (Creator)'}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#aeaeb2] mt-2">
                {form.role === 'buyer'
                  ? 'Browse and secure media slots for your campaigns.'
                  : 'List your newsletter ad slots and reach buyers actively looking.'}
              </p>
            </div>

            <AuthField label="Full name" icon={<User className="w-3.5 h-3.5" />} type="text" value={form.displayName} onChange={v => update('displayName', v)} placeholder="Jane Smith" required />
            <AuthField label="Company" icon={<Building2 className="w-3.5 h-3.5" />} type="text" value={form.company} onChange={v => update('company', v)} placeholder="Acme Corp" required />
          </>
        )}

        <AuthField label="Email address" icon={<Mail className="w-3.5 h-3.5" />} type="email" value={form.email} onChange={v => update('email', v)} placeholder="you@company.com" required />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider">Password</label>
            {tab === 'sign-in' && (
              <button
                type="button"
                onClick={() => { setMode('reset'); setResetEmail(form.email); setError(''); }}
                className="text-[11px] text-blue-600 hover:text-blue-700 transition-colors font-medium"
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aeaeb2]">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => update('password', e.target.value)}
              placeholder={tab === 'sign-up' ? 'Min 8 characters' : '••••••••'}
              minLength={tab === 'sign-up' ? 8 : undefined}
              required
              className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl pl-9 pr-10 py-3 text-[#1d1d1f] text-[14px] placeholder-[#aeaeb2] outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aeaeb2] hover:text-[#6e6e73] transition-colors"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {error && <ErrorBox message={error} />}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 text-white font-semibold py-3 rounded-2xl text-[14px] transition-all flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {tab === 'sign-in' ? 'Sign In' : 'Create Account'}
        </button>

        {tab === 'sign-up' && form.role === 'buyer' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-3 py-2.5 flex items-start gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-green-700 leading-relaxed">
              After creating your account, you'll set up your opportunity alert preferences so we can match you with relevant slots.
            </p>
          </div>
        )}

        <p className="text-center text-[#6e6e73] text-[12px]">
          {tab === 'sign-in' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => { setTab(tab === 'sign-in' ? 'sign-up' : 'sign-in'); setError(''); }}
            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
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
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-black/[0.08] rounded-3xl w-full max-w-md shadow-2xl shadow-black/[0.12] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#1d1d1f] rounded-xl flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-[#1d1d1f] font-semibold text-[14px] tracking-[-0.01em]">EndingThisWeek<span className="text-[#6e6e73]">.media</span></span>
          </div>
          <button onClick={onClose} className="text-[#aeaeb2] hover:text-[#1d1d1f] transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7]">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AuthField({
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
      <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aeaeb2]">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl pl-9 pr-3 py-3 text-[#1d1d1f] text-[14px] placeholder-[#aeaeb2] outline-none transition-all"
        />
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
      <p className="text-red-600 text-[12px] font-medium">{message}</p>
    </div>
  );
}
