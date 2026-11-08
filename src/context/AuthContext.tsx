import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleAuthProvider, testFirestoreConnection } from '../firebase/firebase';

interface AuthContextType {
  user: User | null;
  isLoadingAuth: boolean;
  isSigningIn: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<boolean>;
  signOutUser: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Validate connection to Firestore on initial boot
    testFirestoreConnection().catch((err) => {
      console.warn('Initial Firestore ping note:', err);
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<boolean> => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleAuthProvider);
      setIsSigningIn(false);
      return true;
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      let errorMsg = 'Failed to sign in with Google. Please try again.';
      if (err?.code === 'auth/popup-blocked') {
        errorMsg = 'Sign-in popup was blocked by your browser. Please allow popups for this site and retry.';
      } else if (err?.code === 'auth/popup-closed-by-user') {
        errorMsg = 'The Google sign-in window was closed before completion.';
      } else if (err?.code === 'auth/cancelled-popup-request') {
        errorMsg = 'Sign-in request was cancelled.';
      } else if (err?.code === 'auth/network-request-failed') {
        errorMsg = 'Network error during sign in. Please verify your connection.';
      } else if (err?.message) {
        errorMsg = err.message;
      }
      setAuthError(errorMsg);
      setIsSigningIn(false);
      return false;
    }
  };

  const signOutUser = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoadingAuth,
        isSigningIn,
        authError,
        signInWithGoogle,
        signOutUser,
        clearAuthError,
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
