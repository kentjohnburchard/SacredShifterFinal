import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        setSession(currentSession);
        setIsLoading(true);
        
        try {
          if (currentSession?.user) {
            await fetchUserProfile(currentSession.user.id);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error during auth state change:', error);
          setAuthError(error instanceof Error ? error : new Error(String(error)));
          setUser(null);
        } finally {
          // Always set loading to false when auth state change handling is complete
          setIsLoading(false);
        }
      }
    );

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Initial session:', initialSession?.user?.id);
        setSession(initialSession);
        
        if (initialSession?.user) {
          await fetchUserProfile(initialSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthError(error instanceof Error ? error : new Error(String(error)));
        setUser(null);
      } finally {
        // Ensure loading state is updated even if there's an error
        setIsLoading(false);
      }
    };

    initializeAuth().catch(err => {
      console.error("Failed to initialize auth:", err);
      setIsLoading(false);
    });

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for ID:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        
        // Profile doesn't exist yet, create one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile');
          const { data: authUserData } = await supabase.auth.getUser();
          const authUser = authUserData?.user;
          
          if (!authUser) throw new Error('Auth user not found');
          
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: userId,
                email: authUser.email,
                light_points: 0,
                light_level: 0,
                ascension_title: 'Seeker',
                onboarding_completed: false
              }
            ])
            .select()
            .single();
            
          if (profileError) throw profileError;
          console.log('Created new profile:', newProfile);
          setUser(newProfile as UserProfile);
          return;
        } else {
          throw error;
        }
      }
      
      console.log('Profile found:', data);
      setUser(data as UserProfile);
    } catch (error) {
      console.error('Error handling user profile:', error);
      setAuthError(error instanceof Error ? error : new Error(String(error)));
      setUser(null);
      throw error; // Rethrow so the calling code can handle it
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
      } else {
        console.log('Sign in successful:', data.user?.id);
      }
      
      return { error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Signing up with:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
      } else {
        console.log('Sign up successful:', data.user?.id);
        
        // Create profile immediately after signup
        if (data.user) {
          console.log('Creating profile after signup');
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: data.user.id,
                email: email,
                full_name: fullName,
                display_name: fullName.split(' ')[0],
                light_points: 0,
                light_level: 0,
                ascension_title: 'Seeker',
                onboarding_completed: false
              }
            ])
            .select()
            .single();
            
          if (profileError) {
            console.error('Error creating profile during signup:', profileError);
          } else {
            console.log('Created profile during signup:', newProfile);
            setUser(newProfile as UserProfile);
          }
        }
      }
      
      return { error };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out');
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshProfile = async () => {
    if (session?.user) {
      console.log('Refreshing profile for:', session.user.id);
      await fetchUserProfile(session.user.id);
    }
  };

  if (authError) {
    console.error('Auth error:', authError);
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

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};