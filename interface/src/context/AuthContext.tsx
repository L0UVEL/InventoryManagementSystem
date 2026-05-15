import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthResponse } from '../api/types';

interface AuthContextType {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);

  // On mount, rehydrate from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('jwt');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('jwt');
      }
    }
  }, []);

  const login = (authData: AuthResponse) => {
    localStorage.setItem('jwt', authData.token);
    localStorage.setItem('user', JSON.stringify(authData));
    setUser(authData);
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
