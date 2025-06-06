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

// Mock user for development
const mockUser: UserProfile = {
  id: 'dev-user-123',
  full_name: 'Dev User',
  display_name: 'Dev',
  avatar_url: null,
  onboarding_completed: true,
  light_points: 150,
  light_level: 2,
  ascension_title: 'Lightbearer',
  chakra_highlight: 'Heart',
  subscription_tier: 'free'
};

const mockSession = {
  user: {
    id: 'dev-user-123',
    email: 'dev@example.com'
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // For development, start with mock user and no loading
  const [user, setUser] = useState<UserProfile | null>(mockUser);
  const [session, setSession] = useState<any>(mockSession);
  const [isLoading, setIsLoading] = useState(false); // No loading in dev mode
  const [authError, setAuthError] = useState<Error | null>(null);

  useEffect(() => {
    // In dev mode, just set the mock user immediately
    console.log('[Auth] DEV MODE: Using mock user');
    setUser(mockUser);
    setSession(mockSession);
    setIsLoading(false);
  }, []);

  const fetchUserProfile = async (userId: string) => {
    // In dev mode, just return the mock user
    console.log('[Auth] DEV MODE: fetchUserProfile called, returning mock user');
    return mockUser;
  };

  const signIn = async (email: string, password: string) => {
    // In dev mode, always succeed
    console.log('[Auth] DEV MODE: Mock sign-in');
    setUser(mockUser);
    setSession(mockSession);
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // In dev mode, always succeed
    console.log('[Auth] DEV MODE: Mock sign-up');
    setUser(mockUser);
    setSession(mockSession);
    return { error: null };
  };

  const signOut = async () => {
    // In dev mode, just clear the user but keep mock for easy re-login
    console.log('[Auth] DEV MODE: Mock sign-out');
    setUser(null);
    setSession(null);
    // Immediately set mock user back for dev convenience
    setTimeout(() => {
      setUser(mockUser);
      setSession(mockSession);
    }, 100);
  };

  const refreshProfile = async () => {
    // In dev mode, do nothing
    console.log('[Auth] DEV MODE: Mock refresh profile');
  };

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