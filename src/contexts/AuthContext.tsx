import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface HostelUser {
  id: string;
  name: string;
  room_number: string;
  login_code: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  hostelUser: HostelUser | null;
  loading: boolean;
  signInWithCode: (loginCode: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hostelUser, setHostelUser] = useState<HostelUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchHostelUser(session.user.id);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchHostelUser(session.user.id);
        } else {
          setHostelUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchHostelUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching hostel user:', error);
        return;
      }

      setHostelUser(data);
    } catch (error) {
      console.error('Error fetching hostel user:', error);
    }
  };

  const signInWithCode = async (loginCode: string) => {
    try {
      // Find user by login code
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('login_code', loginCode)
        .single();

      if (userError || !userData) {
        return { error: 'Invalid login code' };
      }

      // Create a temporary email for this user
      const email = `${loginCode.toLowerCase()}@hostel.local`;
      const password = `hostel_${loginCode}_2025`;

      // Try to sign in first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // If sign in fails, try to sign up
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              hostel_user_id: userData.id,
            },
          },
        });

        if (signUpError) {
          return { error: 'Failed to create account' };
        }
      }

      // Update the users table with the auth user ID
      await supabase
        .from('users')
        .update({ id: (await supabase.auth.getUser()).data.user?.id })
        .eq('login_code', loginCode);

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'An error occurred during sign in' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    hostelUser,
    loading,
    signInWithCode,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}