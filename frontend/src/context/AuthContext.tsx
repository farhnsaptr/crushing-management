import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api.client';
import { AuthService } from '../features/auth/services/auth.service';

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'operator';
  last_login_at?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (user: UserProfile) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const verifySession = async () => {
    // Clear any legacy user data stored in localStorage for maximum security
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    try {
      const response = await apiClient.get('/api/auth/me');
      if (response.data && response.data.data) {
        setUser(response.data.data);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    verifySession();
  }, []);

  const setSession = (newUser: UserProfile) => {
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (err) {
      console.warn('Logout API request error', err);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        setSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
