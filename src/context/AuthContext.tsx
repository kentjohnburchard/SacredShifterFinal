import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  session: any;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('[Auth] Starting initialization...');
        const { data } = await supabase.auth.getSession();
        console.log('getSession() returned:', data);
        
        const currentSession = data?.session;
        setSession(currentSession);

        if (currentSession?.user) {
          console.log('[Auth] Session found, fetching profile...');
          await fetchUserProfile(currentSession.user.id);
        } else {
          console.log('[Auth] No session found');
          setUser(null);
        }
        
        console.log('useEffect complete', currentSession);
      } catch (err) {
        console.error('[Auth] Init error:', err);
        setAuthError(err instanceof Error ? err : new Error(String(err)));
        setUser(null);
      } finally {
        console.log('[Auth] Setting isLoading to false');
        setIsLoading(false);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('[Auth] State changed:', event, 'Session:', !!newSession);
        
        setSession(newSession);
        
        // Only show loading for significant auth changes, not initial states
        if (event !== 'INITIAL_SESSION') {
          setIsLoading(true);
        }

        try {
          if (newSession?.user) {
            console.log('[Auth] New session, fetching profile...');
            await fetchUserProfile(newSession.user.id);
          } else {
            console.log('[Auth] No session, clearing user');
            setUser(null);
          }
        } catch (err) {
          console.error('[Auth] Auth state change error:', err);
          setAuthError(err instanceof Error ? err : new Error(String(err)));
          setUser(null);
        } finally {
          // Always ensure loading is turned off
          if (event !== 'INITIAL_SESSION') {
            console.log('[Auth] Auth state change complete, setting isLoading to false');
            setIsLoading(false);
          }
        }
      }
    );

    init();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    console.log('[Auth] Fetching profile for:', userId);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('fetchUserProfile() returned data:', data, 'error:', error);

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn('[Auth] Profile not found, creating new one...');
          const { data: authUserData } = await supabase.auth.getUser();
          const authUser = authUserData?.user;
          if (!authUser) throw new Error('No authenticated user');

          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: userId,
                email: authUser.email,
                full_name: authUser.user_metadata?.full_name ?? null,
                display_name: authUser.user_metadata?.display_name ?? null,
                light_points: 0,
                light_level: 0,
                ascension_title: 'Seeker',
                onboarding_completed: false,
              },
            ])
            .select()
            .single();

          if (insertError) throw insertError;
          console.log('[Auth] Created profile:', newProfile);
          setUser(newProfile);
        } else {
          console.error('[Auth] Profile fetch error:', error);
          throw error;
        }
      } else if (data && typeof data === 'object' && data.id) {
        console.log('[Auth] Profile loaded:', data);
        setUser(data);
      } else {
        console.warn('[Auth] Malformed profile data:', data);
        setUser(null);
      }
    } catch (error) {
      console.error('[Auth] fetchUserProfile error:', error);
      throw error; // Re-throw to be handled by caller
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('[Auth] Sign-in error:', error);
      } else {
        console.log('[Auth] Sign-in success:', data.user?.id);
      }
      return { error };
    } finally {
      // Don't set loading to false here - let the auth state listener handle it
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            display_name: fullName.split(' ')[0],
          },
        },
      });

      if (error) {
        console.error('[Auth] Sign-up error:', error);
      } else if (data?.user) {
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email,
              full_name: data.user.user_metadata?.full_name ?? fullName,
              display_name: data.user.user_metadata?.display_name ?? fullName.split(' ')[0],
              light_points: 0,
              light_level: 0,
              ascension_title: 'Seeker',
              onboarding_completed: false,
            },
          ])
          .select()
          .single();

        if (profileError) {
          console.error('[Auth] Profile creation error:', profileError);
        } else {
          setUser(newProfile);
        }
      }

      return { error };
    } finally {
      // Don't set loading to false here - let the auth state listener handle it
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (session?.user) {
      try {
        setIsLoading(true);
        await fetchUserProfile(session.user.id);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (authError) {
    console.error('[Auth] Global auth error:', authError);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
</parameter>