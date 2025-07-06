import { useEffect, useState, useMemo } from 'react';
import { type User } from 'firebase/auth';
import { authService, type AuthUser } from '../services/auth';
import type { AuthContextType, AuthProviderProps } from './types';
import { AuthContext } from './context';

export function AuthProvider({ children }: Readonly<AuthProviderProps>) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async () => {
    await authService.signInWithGoogle();
  };

  const signInWithEmail = async (email: string, password: string) => {
    await authService.signInWithEmail(email, password);
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    await authService.signUpWithEmail(email, password, displayName);
  };

  const signOut = async () => {
    await authService.signOut();
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user: User | null) => {
      if (user) {
        setCurrentUser(authService.getAuthUser(user));
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = useMemo(() => ({
    currentUser,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword
  }), [currentUser, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}