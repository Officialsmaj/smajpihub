import type { PiAuthResult, SmajUser } from "@smaj/shared-types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";

type AuthContextValue = {
  user: SmajUser | null;
  loading: boolean;
  signInWithPiAuthResult: (result: PiAuthResult) => Promise<void>;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SmajUser | null>(null);
  const [loading, setLoading] = useState(true);

  const restore = useCallback(async () => {
    try {
      const token = await authStorage.getAccessToken();
      if (!token) return;
      const response = await api.currentUser();
      setUser(response.user);
    } catch {
      await authStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void restore(); }, [restore]);

  const signInWithPiAuthResult = useCallback(async (result: PiAuthResult) => {
    const response = await api.signInWithPi(result);
    await authStorage.setAccessToken(result.accessToken);
    setUser(response.user);
  }, []);

  const signOut = useCallback(async () => {
    await authStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, signInWithPiAuthResult, signOut }), [loading, signInWithPiAuthResult, signOut, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
};