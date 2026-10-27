import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type User,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logoutUser, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import type { UserProfile } from '../types/index.ts';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          let userSnap;
          try {
            userSnap = await getDoc(userDocRef);
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
          }

          if (userSnap && userSnap.exists()) {
            setUserProfile(userSnap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              id: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Academic Researcher',
              photoURL: user.photoURL || null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            try {
              await setDoc(userDocRef, newProfile);
              setUserProfile(newProfile);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
            }
          }
        } catch (err: any) {
          console.error('Error syncing user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogleHandler = async () => {
    try {
      setAuthError(null);
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setAuthError(err?.message || 'Google sign-in was cancelled or failed.');
      throw err;
    }
  };

  const signOutHandler = async () => {
    try {
      setAuthError(null);
      await logoutUser();
      setUserProfile(null);
    } catch (err: any) {
      console.error('Sign-out error:', err);
      setAuthError(err?.message || 'Failed to sign out.');
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signInWithGoogle: signInWithGoogleHandler,
        signOut: signOutHandler,
        authError,
        clearAuthError,
      }}
    >
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
