import { createContext, useContext, useEffect, useState } from 'react';
import { api, isLoggedIn, setToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(isLoggedIn());
  const [settings, setSettings] = useState({ shop_name: 'Pooja Sweets', admin_phone: '' });
  const [loading, setLoading] = useState(authenticated);

  const loadSettings = async () => {
    try {
      const data = await api.getMe();
      setSettings(data);
    } catch {
      setAuthenticated(false);
      setToken(null);
    }
  };

  useEffect(() => {
    if (authenticated) {
      loadSettings().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    const onLogout = () => setAuthenticated(false);
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, [authenticated]);

  const login = async (pin) => {
    const data = await api.login(pin);
    setToken(data.token);
    setSettings({ shop_name: data.shop_name, admin_phone: '' });
    setAuthenticated(true);
    await loadSettings();
  };

  const logout = () => {
    setToken(null);
    setAuthenticated(false);
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  return (
    <AuthContext.Provider
      value={{ authenticated, loading, settings, login, logout, refreshSettings }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
