import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { sendWelcomeEmail } from '../lib/email';

export interface UserProfile {
  id: string;
  role: 'buyer' | 'seller' | 'admin';
  display_name: string;
  company: string;
  phone: string;
  website: string;
  bio: string;
  seller_bio: string;
  seller_website_url: string;
  seller_company_url: string;
  seller_linkedin_url: string;
  seller_twitter_url: string;
  seller_instagram_url: string;
  seller_youtube_url: string;
  seller_tiktok_url: string;
  seller_podcast_url: string;
  digest_enabled: boolean;
  digest_frequency: 'daily' | 'weekly';
  digest_media_types: string[];
  digest_locations: string[];
  digest_tags: string[];
  digest_last_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DigestPreferences {
  digest_enabled: boolean;
  digest_frequency: 'daily' | 'weekly';
  digest_media_types: string[];
  digest_locations: string[];
  digest_tags: string[];
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, role: 'buyer' | 'seller', displayName: string, company: string) => Promise<{ error: Error | null }>;
  saveDigestPreferences: (userId: string, prefs: DigestPreferences) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data as UserProfile | null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        (async () => {
          await fetchProfile(session.user.id);
        })();
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    role: 'buyer' | 'seller',
    displayName: string,
    company: string
  ) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) return { error };

    const { error: profileError } = await supabase.from('user_profiles').insert({
      id: data.user.id,
      role,
      display_name: displayName,
      company,
    });

    sendWelcomeEmail(email, role, displayName, data.session?.access_token);

    return { error: profileError };
  };

  const saveDigestPreferences = async (userId: string, prefs: DigestPreferences) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ ...prefs, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (!error) await fetchProfile(userId);
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, saveDigestPreferences, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
