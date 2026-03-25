import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearToken as clearStoredToken, getToken, setToken as storeToken } from './token';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [token, setAuthToken] = useState(() => getToken());
  const [admin, setAdmin] = useState(null);

  const login = useCallback((nextToken, nextAdmin = null) => {
    if (!nextToken) {
      clearStoredToken();
      setAuthToken(null);
      setAdmin(null);
      return;
    }

    storeToken(nextToken);
    setAuthToken(nextToken);
    setAdmin(nextAdmin ?? null);
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setAuthToken(null);
    setAdmin(null);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    function handleAuthExpired() {
      logout();
    }

    window.addEventListener('admin-auth-expired', handleAuthExpired);

    return () => {
      window.removeEventListener('admin-auth-expired', handleAuthExpired);
    };
  }, [logout]);

  const value = useMemo(() => ({
    token,
    admin,
    login,
    logout,
  }), [admin, login, logout, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
