// Sesión del usuario: guarda el token, sabe quién está conectado y ofrece login/registro/logout.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api';
import { setOnUnauthorized, tokenStore } from '../api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const toast = useToast();
  const [user, setUser] = useState(null);
  // Mientras se revisa si el token guardado sigue siendo válido
  const [checking, setChecking] = useState(() => Boolean(tokenStore.get()));

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  // Si el backend responde 401 con un token, la sesión expiró
  useEffect(() => {
    setOnUnauthorized(() => {
      logout();
      toast.error('Tu sesión expiró, inicia sesión de nuevo');
    });
  }, [logout, toast]);

  // Al abrir la app: si hay token guardado, pedimos los datos del usuario
  useEffect(() => {
    if (!tokenStore.get()) return;
    authApi
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setChecking(false));
  }, []);

  const saveSession = ({ token, user: u }) => {
    tokenStore.set(token);
    setUser(u);
    return u;
  };

  const login = useCallback((email, password) => authApi.login(email, password).then(saveSession), []);
  const register = useCallback(
    (nombre, email, password) => authApi.register(nombre, email, password).then(saveSession),
    []
  );

  const value = useMemo(() => ({ user, checking, login, register, logout }), [user, checking, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
