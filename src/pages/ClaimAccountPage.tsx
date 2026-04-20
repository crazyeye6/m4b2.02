import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle, Lock, AlertCircle } from 'lucide-react';

interface Props {
  token: string;
  onClaimed: () => void;
}

type ClaimState = 'validating' | 'set_password' | 'claiming' | 'success' | 'invalid' | 'already_claimed';

export default function ClaimAccountPage({ token, onClaimed }: Props) {
  const [state, setState] = useState<ClaimState>('validating');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    setState('validating');
    const { data, error } = await supabase
      .from('account_claim_tokens')
      .select('email, expires_at, used_at')
      .eq('token', token)
      .maybeSingle();

    if (error || !data) {
      setState('invalid');
      return;
    }

    if (data.used_at) {
      setState('already_claimed');
      return;
    }

    if (new Date(data.expires_at) < new Date()) {
      setState('invalid');
      return;
    }

    const { data: seller } = await supabase
      .from('managed_sellers')
      .select('display_name, company')
      .eq('email', data.email)
      .maybeSingle();

    setEmail(data.email);
    setDisplayName(seller?.display_name ?? '');
    setCompany(seller?.company ?? '');
    setState('set_password');
  };

  const handleClaim = async () => {
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setState('claiming');

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError && !signUpError.message.includes('already registered')) {
      setError(signUpError.message);
      setState('set_password');
      return;
    }

    let userId = signUpData?.user?.id;

    if (!userId) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError || !signInData.user) {
        setError('Failed to set up your account. Please try again.');
        setState('set_password');
        return;
      }
      userId = signInData.user.id;
    }

    await supabase.from('user_profiles').upsert({
      id: userId,
      role: 'seller',
      display_name: displayName,
      company,
      updated_at: new Date().toISOString(),
    });

    await supabase
      .from('newsletters')
      .update({ seller_user_id: userId })
      .eq('seller_email', email)
      .is('seller_user_id', null);

    await supabase
      .from('listings')
      .update({ seller_user_id: userId })
      .eq('seller_email', email)
      .is('seller_user_id', null);

    await supabase
      .from('managed_sellers')
      .update({ account_claimed: true, claimed_at: new Date().toISOString() })
      .eq('email', email);

    await supabase
      .from('account_claim_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    if (!signUpData?.user?.id) {
      await supabase.auth.signInWithPassword({ email, password });
    }

    setState('success');
    setTimeout(onClaimed, 2000);
  };

  const inputCls = "w-full bg-[#f5f5f7] border border-black/[0.08] focus:border-black/[0.2] focus:bg-white rounded-2xl px-4 py-3 text-[#1d1d1f] text-sm placeholder-[#aeaeb2] outline-none transition-all";

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-[#1d1d1f] rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-black">E</span>
          </div>
          <span className="text-[#1d1d1f] font-bold text-base tracking-tight">
            EndingThisWeek<span className="text-green-600">.media</span>
          </span>
        </div>

        <div className="bg-white border border-black/[0.08] rounded-3xl p-8">
          {state === 'validating' && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-[#aeaeb2] animate-spin mx-auto mb-4" />
              <p className="text-[#6e6e73] text-sm">Validating your invite link…</p>
            </div>
          )}

          {state === 'invalid' && (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-[#1d1d1f] font-semibold text-lg mb-2">Link expired or invalid</h2>
              <p className="text-[#6e6e73] text-sm leading-relaxed">
                This claim link has expired or is no longer valid. Please contact us to receive a new invite.
              </p>
            </div>
          )}

          {state === 'already_claimed' && (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-[#1d1d1f] font-semibold text-lg mb-2">Account already claimed</h2>
              <p className="text-[#6e6e73] text-sm leading-relaxed">
                This account has already been set up. Sign in with your email and password to access your seller dashboard.
              </p>
            </div>
          )}

          {state === 'success' && (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-[#1d1d1f] font-semibold text-lg mb-2">Account claimed!</h2>
              <p className="text-[#6e6e73] text-sm leading-relaxed">
                You're in. Taking you to your seller dashboard…
              </p>
            </div>
          )}

          {(state === 'set_password' || state === 'claiming') && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#f5f5f7] border border-black/[0.08] rounded-2xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#6e6e73]" />
                </div>
                <div>
                  <h2 className="text-[#1d1d1f] font-semibold text-base">Claim your account</h2>
                  <p className="text-[#6e6e73] text-xs">Set a password to access your seller dashboard</p>
                </div>
              </div>

              <div className="bg-[#f5f5f7] border border-black/[0.06] rounded-2xl px-4 py-3 mb-5">
                <p className="text-[#aeaeb2] text-xs mb-0.5">Signing in as</p>
                <p className="text-[#1d1d1f] text-sm font-semibold">{email}</p>
                {displayName && <p className="text-[#6e6e73] text-xs mt-0.5">{displayName}{company ? ` · ${company}` : ''}</p>}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="At least 8 characters"
                    className={inputCls}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#86868b] font-semibold uppercase tracking-wider mb-1.5">Confirm password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                    placeholder="Repeat password"
                    className={inputCls}
                    onKeyDown={e => { if (e.key === 'Enter') handleClaim(); }}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleClaim}
                  disabled={state === 'claiming' || !password || !confirmPassword}
                  className="w-full flex items-center justify-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] disabled:opacity-40 text-white font-semibold py-3 rounded-2xl text-sm transition-all mt-2"
                >
                  {state === 'claiming' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {state === 'claiming' ? 'Setting up your account…' : 'Claim account'}
                </button>
              </div>

              <p className="text-[#aeaeb2] text-[11px] text-center mt-4 leading-relaxed">
                By claiming this account you agree to our terms of service. Your listings and newsletters are already set up and ready.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
