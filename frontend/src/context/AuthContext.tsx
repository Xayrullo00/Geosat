import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "../api";

type User = Record<string, unknown> | null;

type AuthCtx = {
  user: User;
  loading: boolean;
  setToken: (t: string | null) => void;
  refresh: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("agrosat_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      localStorage.removeItem("agrosat_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setToken = (t: string | null) => {
    if (t) localStorage.setItem("agrosat_token", t);
    else localStorage.removeItem("agrosat_token");
  };

  const logout = () => {
    localStorage.removeItem("agrosat_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setToken, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
