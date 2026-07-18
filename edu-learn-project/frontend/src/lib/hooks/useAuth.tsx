'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthToken, saveAuth, clearAuth, getSavedUser } from '@/lib/utils/auth';
import { getCookie } from '@/lib/utils/cookies';

interface AuthContextType {
  user: any | null;
  token: string | null;
  login: (token: string, userData: any, remember?: boolean) => void;
  logout: () => void;
  loading: boolean;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUser = getSavedUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, userData: any, remember: boolean = false) => {
    saveAuth(newToken, userData, remember);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    clearAuth();
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData: any) => {
    const rememberMe = getCookie('remember_me') === 'true';
    saveAuth(token || '', userData, rememberMe);
    setUser(userData);
  };


  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
