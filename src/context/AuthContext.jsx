import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

const USERS = {
  admin: { id: 1, username: 'admin', name: 'Admin User', role: 'admin', password: 'admin123' },
  user:  { id: 2, username: 'user', name: 'Regular User', role: 'user', password: 'user123' },
};

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
      const stored = localStorage.getItem('ganeshMandalAuthUser');
      if (stored) return JSON.parse(stored);
    } catch {}
    const defaultUser = { id: 1, username: 'admin', name: 'Admin User', role: 'admin' };
    localStorage.setItem('ganeshMandalAuthUser', JSON.stringify(defaultUser));
    return defaultUser;
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('ganeshMandalAuthUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('ganeshMandalAuthUser');
      }
    } catch {
      // localStorage unavailable
    }
  }, [user]);

  const login = useCallback(async (username, password) => {
    const matched = USERS[username];
    if (!matched || matched.password !== password) {
      throw new Error('Invalid username or password');
    }
    const { password: _, ...userData } = matched;
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
