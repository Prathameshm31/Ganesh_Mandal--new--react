import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import apiClient, { extractErrorMessage } from '../api/apiClient';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ganeshMandalUser');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      const data = response.data;
      setUser(data);
      localStorage.setItem('ganeshMandalUser', JSON.stringify(data));
      localStorage.setItem('ganeshMandalUserToken', data.token);
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {}
    setUser(null);
    localStorage.removeItem('ganeshMandalUser');
    localStorage.removeItem('ganeshMandalUserToken');
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    if (user) {
      const updated = { ...user, firstLogin: false };
      setUser(updated);
      localStorage.setItem('ganeshMandalUser', JSON.stringify(updated));
    }
    return response.data;
  }, [user]);

  const hasPermission = useCallback((permissionCode) => {
    if (!user?.permissions) return false;
    return user.permissions.includes(permissionCode);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
      changePassword,
      loading,
      hasPermission,
    }),
    [user, login, logout, changePassword, loading, hasPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
