'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, logout as authLogout, type AuthUser } from '@/lib/auth';

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signOut: () => void;
  refreshUser: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  useEffect(() => {
    refreshUser();
    setIsLoading(false);
  }, []);

  const signOut = () => {
    setUser(null);
    authLogout();
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), signOut, refreshUser }),
    [user],
  );

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
