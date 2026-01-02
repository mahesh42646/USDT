'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AdminAuthContext = createContext(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500';

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check for existing admin token on mount and verify it's valid
  useEffect(() => {
    const checkAdminAuth = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('adminToken');
        const adminData = localStorage.getItem('adminData');
        
        if (token && adminData) {
          try {
            // Verify token is still valid by making a test API call
            const response = await fetch(`${API_URL}/api/admin/profile`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data?.admin) {
                const parsedAdmin = data.data.admin;
                setAdmin(parsedAdmin);
                // Update stored admin data
                localStorage.setItem('adminData', JSON.stringify(parsedAdmin));
              } else {
                // Token invalid, clear storage
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminData');
                setAdmin(null);
              }
            } else if (response.status === 401 || response.status === 403) {
              // Token invalid or expired, clear storage
              localStorage.removeItem('adminToken');
              localStorage.removeItem('adminData');
              setAdmin(null);
            } else {
              // Other errors (network, server error, etc.) - keep token but don't set admin
              // This prevents clearing valid tokens on network issues
              const parsedAdmin = JSON.parse(adminData);
              setAdmin(parsedAdmin);
            }
          } catch (error) {
            console.error('Error verifying admin token:', error);
            // On network errors, try to use stored data if available
            // Only clear if it's a parsing error
            if (adminData) {
              try {
                const parsedAdmin = JSON.parse(adminData);
                setAdmin(parsedAdmin);
              } catch (parseError) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminData');
                setAdmin(null);
              }
            }
          }
        }
      }
      setLoading(false);
    };

    checkAdminAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and admin data
      const { token, admin: adminData } = data.data;
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminData', JSON.stringify(adminData));
      
      setAdmin(adminData);
      return { success: true, admin: adminData };
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setAdmin(null);
    router.push('/admin/login');
  };

  const getAdminToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  };

  const value = {
    admin,
    loading,
    login,
    logout,
    getAdminToken,
    isAuthenticated: !!admin,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
