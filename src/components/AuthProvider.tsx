"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/src/lib/api";
import { canWrite } from "@/src/lib/roles";

export type SessionAdmin = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: string;
  status: string;
  avatarUrl: string | null;
  notifyClient: boolean;
  notifyPayment: boolean;
  notifyService: boolean;
  notifyTeam: boolean;
  notifySystem: boolean;
};

type AuthContextValue = {
  admin: SessionAdmin | null;
  loading: boolean;
  canWrite: boolean;
  refresh: () => Promise<void>;
  setAdmin: (admin: SessionAdmin | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<SessionAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await apiFetch<{ admin: SessionAdmin }>("/api/auth/me");
    setAdmin(data.admin);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch {
        if (!cancelled) {
          setAdmin(null);
          router.replace("/login");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh, router]);

  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // still leave the session on the client
    }
    setAdmin(null);
    router.replace("/login");
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        canWrite: canWrite(admin?.role || ""),
        refresh,
        setAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
