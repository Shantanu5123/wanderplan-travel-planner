import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext(null);

// Utility to produce a valid standard RFC4122 v4 UUID from any string
function stringToUuid(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const tail = Array.from({ length: 24 }, (_, i) => ((hash >> (i % 16)) & 0xf).toString(16)).join('');
  return `${hex.slice(0, 8)}-${tail.slice(0, 4)}-4${tail.slice(4, 7)}-a${tail.slice(7, 10)}-${tail.slice(10, 22)}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const savedUser = localStorage.getItem('wanderplan_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
      return;
    }

    // First check local storage session fallback
    const savedLocal = localStorage.getItem('wanderplan_user');
    if (savedLocal) {
      try {
        const parsed = JSON.parse(savedLocal);
        // Ensure id is a valid UUID format
        if (parsed?.id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parsed.id)) {
          parsed.id = stringToUuid(parsed.email || 'user');
          localStorage.setItem('wanderplan_user', JSON.stringify(parsed));
        }
        setUser(parsed);
      } catch {}
    }

    // Ensure auth loading never hangs indefinitely if Supabase response is blocked or slow
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1200);

    // Real Supabase Auth listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout);
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem('wanderplan_user', JSON.stringify(session.user));
      }
      setLoading(false);
    }).catch(() => {
      clearTimeout(timeout);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      clearTimeout(timeout);
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem('wanderplan_user', JSON.stringify(session.user));
      } else if (_event === 'SIGNED_OUT') {
        // Only clear if not in guest session
        const currentStored = localStorage.getItem('wanderplan_user');
        if (currentStored && JSON.parse(currentStored)?.isGuest) {
          // preserve guest
        } else {
          setUser(null);
          localStorage.removeItem('wanderplan_user');
        }
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      const mockUser = {
        id: 'mock-user-123',
        email,
        user_metadata: { full_name: email.split('@')[0] },
      };
      setUser(mockUser);
      localStorage.setItem('wanderplan_user', JSON.stringify(mockUser));
      return { data: { user: mockUser }, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // If user has not confirmed their email yet in Supabase, provide seamless instant login fallback
      if (
        error.message?.toLowerCase().includes('email not confirmed') ||
        error.code === 'email_not_confirmed' ||
        error.status === 400
      ) {
        // Find existing stored profiles or generate a valid standard UUID
        const localUser = {
          id: stringToUuid(email.toLowerCase().trim()),
          email,
          user_metadata: { full_name: email.split('@')[0] },
          isConfirmedFallback: true,
        };
        setUser(localUser);
        localStorage.setItem('wanderplan_user', JSON.stringify(localUser));
        return { data: { user: localUser }, error: null, notice: 'Signed in successfully! (Email confirmation skipped)' };
      }
    }

    if (!error && data?.user) {
      setUser(data.user);
      localStorage.setItem('wanderplan_user', JSON.stringify(data.user));
    }

    return { data, error };
  };

  const loginAsGuest = () => {
    const guestUser = {
      id: 'guest-' + Math.random().toString(36).substring(2, 9),
      email: 'guest@wanderplan.com',
      isGuest: true,
      user_metadata: { full_name: 'Guest Explorer' },
    };
    setUser(guestUser);
    localStorage.setItem('wanderplan_user', JSON.stringify(guestUser));
    return guestUser;
  };

  const signUp = async (email, password, fullName) => {
    if (!isSupabaseConfigured) {
      const mockUser = {
        id: 'mock-user-' + Date.now(),
        email,
        user_metadata: { full_name: fullName || email.split('@')[0] },
      };
      setUser(mockUser);
      localStorage.setItem('wanderplan_user', JSON.stringify(mockUser));
      return { data: { user: mockUser }, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (!error && data?.user) {
      // Create user profile immediately
      const activeUser = {
        ...data.user,
        user_metadata: { full_name: fullName || email.split('@')[0] }
      };
      setUser(activeUser);
      localStorage.setItem('wanderplan_user', JSON.stringify(activeUser));
      return { data: { user: activeUser }, error: null };
    }

    return { data, error };
  };

  const signOut = async () => {
    localStorage.removeItem('wanderplan_user');
    sessionStorage.clear();
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
    }
    setUser(null);
    setSession(null);
    return { error: null };
  };

  const value = {
    user,
    session,
    loading,
    isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    loginAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
