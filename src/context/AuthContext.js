'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { api } from '@/utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch user data from backend
        try {
          const token = await firebaseUser.getIdToken();
          const response = await api.get('/api/user/profile');
          // Backend returns { success: true, user: {...} }
          const userData = response.user || response;
          setUserData(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // User might not exist in backend yet - that's okay, they'll be redirected to register
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
        // Clear any stored tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('firebase_token');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (userData) => {
    setUserData(userData);
    // Handle pending action if exists
    if (pendingAction) {
      router.push(pendingAction);
      setPendingAction(null);
    } else {
      router.push('/user/dashboard');
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setUserData(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const setAction = (path) => {
    setPendingAction(path);
  };

  const value = {
    user,
    userData,
    loading,
    login,
    logout,
    setAction,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
