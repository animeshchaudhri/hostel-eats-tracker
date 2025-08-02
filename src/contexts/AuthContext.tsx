import { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';

interface HostelUser {
  id: string;
  name: string;
  roomNumber: string;
  loginCode: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: HostelUser | null;
  hostelUser: HostelUser | null;
  loading: boolean;
  signInWithCode: (loginCode: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<HostelUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.verifyToken();
        if (response.user) {
          setUser({
            id: response.user.id,
            name: response.user.name,
            roomNumber: response.user.roomNumber,
            loginCode: response.user.loginCode,
            isAdmin: response.user.isAdmin
          });
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        // Token might be expired, try to refresh
        try {
          const refreshResponse = await apiClient.refreshToken();
          if (refreshResponse.user) {
            setUser({
              id: refreshResponse.user.id,
              name: refreshResponse.user.name,
              roomNumber: refreshResponse.user.roomNumber,
              loginCode: refreshResponse.user.loginCode,
              isAdmin: refreshResponse.user.isAdmin
            });
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Clear invalid token
          localStorage.removeItem('auth_token');
          apiClient.setToken(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signInWithCode = async (loginCode: string) => {
    try {
      const response = await apiClient.login(loginCode);
      
      if (response.user) {
        const userData = {
          id: response.user.id,
          name: response.user.name,
          roomNumber: response.user.roomNumber,
          loginCode: response.user.loginCode,
          isAdmin: response.user.isAdmin
        };
        setUser(userData);
        return { error: null };
      }

      return { error: 'Login failed' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { error: error.message || 'An error occurred during login' };
    }
  };

  const signOut = async () => {
    apiClient.logout();
    setUser(null);
  };

  const value = {
    user,
    hostelUser: user, // Keep for compatibility with existing components
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