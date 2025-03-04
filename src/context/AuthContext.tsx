import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../middleware/types';
import { UserApi } from '../middleware/api/UserApi';
import { useNavigate } from 'react-router-dom';
import supabase from '../middleware/database/SupabaseService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isVerified: boolean;
  isAuthorized: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const { user } = await UserApi.getCurrentUser();
      setUser(user);
      
      if (user) {
        setIsVerified(user.user_metadata.email_verified === true);
      }
      
      setLoading(false);
    };

    checkUser();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const supabaseUser = session.user as unknown as User;
          setUser(supabaseUser);
          setIsVerified(session.user.user_metadata.email_verified === true);
        } else {
          setUser(null);
          setIsVerified(false);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { user, error, isAuthorized } = await UserApi.login({ email, password });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    if (!isAuthorized) {
      return { success: false, error: "Your account is not authorized. Please contact an administrator." };
    }
    
    if (user) {
      setUser(user);
      setIsVerified(user.user_metadata.email_verified === true);
      setIsAuthorized(isAuthorized);
    }
    
    return { success: true };
  };

  const logout = async () => {
    await UserApi.logout();
    setUser(null);
    setIsVerified(false);
    navigate('/');
  };

  const register = async (email: string, password: string, fullName: string) => {
    const { user, error } = await UserApi.register({ email, password, fullName });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    if (user) {
      setUser(user);
      setIsVerified(user.user_metadata.email_verified === true);
    }
    
    return { success: true };
  };

  const resendVerificationEmail = async () => {
    if (!user) {
      return { success: false, error: "No user is logged in" };
    }
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email || '',
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      const err = error as Error;
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isVerified,
      isAuthorized,
      login, 
      logout, 
      register,
      resendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};