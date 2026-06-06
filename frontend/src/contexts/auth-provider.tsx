"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import {
  clearAuth,
  getAccessToken,
  getStoredUser,
  saveAuth,
} from "@/lib/auth-storage";
import type { ApiUser, AuthTokens } from "@/types/api";

interface AuthContextValue {
  user: ApiUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<ApiUser>;
  register: (
    fullName: string,
    email: string,
    password: string,
    role?: string
  ) => Promise<ApiUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    const stored = getStoredUser();
    if (!token || !stored) {
      setLoading(false);
      return;
    }
    setUser(stored);
    api
      .me()
      .then((profile) => setUser(profile))
      .catch(() => {
        clearAuth();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const applyAuth = useCallback((data: { user: ApiUser } & AuthTokens) => {
    saveAuth(
      {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
      },
      data.user
    );
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await api.login(email, password);
      return applyAuth(data);
    },
    [applyAuth]
  );

  const register = useCallback(
    async (fullName: string, email: string, password: string, role?: string) => {
      const data = await api.register(fullName, email, password, role);
      return applyAuth(data);
    },
    [applyAuth]
  );

  const logout = useCallback(async () => {
    await api.logout();
    clearAuth();
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
