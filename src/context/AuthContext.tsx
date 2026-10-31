import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, getMe } from '../api/auth.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('agrilens_token');
    const savedUser = localStorage.getItem('agrilens_user');

    if (savedToken) {
      setTokenState(savedToken);
      if (savedUser) {
        try {
          setUserState(JSON.parse(savedUser));
        } catch {
          // ignore corrupted JSON
        }
      }
      // Re-validate against /auth/me
      getMe()
        .then((res) => {
          setUserState(res.user);
          localStorage.setItem('agrilens_user', JSON.stringify(res.user));
        })
        .catch(() => {
          // Token expired or invalid
          logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setTokenState(newToken);
    setUserState(newUser);
    localStorage.setItem('agrilens_token', newToken);
    localStorage.setItem('agrilens_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setTokenState(null);
    setUserState(null);
    localStorage.removeItem('agrilens_token');
    localStorage.removeItem('agrilens_user');
  };

  const setUser = (newUser: User) => {
    setUserState(newUser);
    localStorage.setItem('agrilens_user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
