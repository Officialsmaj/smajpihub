import { AxiosError, isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { axiosClient, getBaseURL } from "../lib/axiosClient";
import type { AuthResult, PaymentDTO, User } from "../types/pi";

type AuthFeedback = { type: "success" | "error"; message: string };
type BackendErrorBody = { error?: string; message?: string };
type SignInResponse = { user?: Partial<User> | null };
type ProfileUpdate = {
  displayName: string;
  country: string;
  role: "buyer" | "seller" | "admin";
  contactPhone: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  language?: string;
  sellerActive?: boolean;
};

const PI_AUTH_TIMEOUT_MS = 30000;
const PI_USER_STORAGE_KEY = "smaj_pi_user";
const PI_AUTH_SCOPES = ["username", "payments"];

const onIncompletePaymentFound = (payment: PaymentDTO) => {
  if (getBaseURL()) void axiosClient.post("/payments/incomplete", { payment });
};

const authenticateWithTimeout = (scopes: string[]) =>
  Promise.race<AuthResult>([
    window.Pi!.authenticate(scopes, onIncompletePaymentFound),
    new Promise<AuthResult>((_, reject) => setTimeout(() => reject(new Error("PI_AUTH_TIMEOUT")), PI_AUTH_TIMEOUT_MS)),
  ]);

const toUser = (candidate: Partial<User> | null | undefined, fallback: User): User => ({
  uid: candidate?.uid || fallback.uid,
  username: candidate?.username || fallback.username,
  wallet_address: candidate?.wallet_address || fallback.wallet_address,
  roles: Array.isArray(candidate?.roles) ? candidate.roles : Array.isArray(fallback.roles) ? fallback.roles : [],
  piUsername: candidate?.piUsername || fallback.piUsername || candidate?.username || fallback.username,
  displayName: candidate?.displayName || fallback.displayName || candidate?.username || fallback.username,
  country: candidate?.country ?? fallback.country ?? "",
  contactPhone: candidate?.contactPhone ?? fallback.contactPhone ?? "",
  avatar: candidate?.avatar ?? fallback.avatar ?? "",
  coverImage: candidate?.coverImage ?? fallback.coverImage ?? "",
  bio: candidate?.bio ?? fallback.bio ?? "",
  language: candidate?.language ?? fallback.language ?? candidate?.settings?.language ?? fallback.settings?.language ?? "English",
  sellerActive: candidate?.sellerActive ?? fallback.sellerActive ?? candidate?.role === "seller",
  role: candidate?.role || fallback.role || "buyer",
  blocked: candidate?.blocked ?? fallback.blocked ?? false,
  settings: candidate?.settings || fallback.settings || { theme: "light", language: "English", notifications: true },
  createdAt: candidate?.createdAt || fallback.createdAt || new Date().toISOString(),
  verificationLevel: candidate?.verificationLevel === "trusted_seller" || fallback.verificationLevel === "trusted_seller" ? "trusted_seller" : candidate?.verificationLevel || fallback.verificationLevel || "verified",
  verificationRequested: candidate?.verificationRequested ?? fallback.verificationRequested ?? false,
  accessToken: fallback.accessToken,
});

const getStoredPiUser = () => {
  try {
    const stored = window.localStorage.getItem(PI_USER_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
};

const storeUser = (user: User) => {
  window.localStorage.setItem(PI_USER_STORAGE_KEY, JSON.stringify(user));
  return user;
};

const authResultUser = (authResult: AuthResult): User => ({
  uid: authResult.user.uid,
  username: authResult.user.username,
  wallet_address: authResult.user.wallet_address,
  roles: authResult.user.roles ?? [],
  piUsername: authResult.user.username,
  displayName: authResult.user.username,
  country: "",
  role: "buyer",
  contactPhone: "",
  avatar: "",
  coverImage: "",
  bio: "",
  language: "English",
  sellerActive: false,
  blocked: false,
  verificationLevel: "verified",
  verificationRequested: false,
  settings: { theme: "light", language: "English", notifications: true },
  createdAt: new Date().toISOString(),
  accessToken: authResult.accessToken,
});

const getDashboardUrl = () => {
  const baseUrl = import.meta.env.BASE_URL || "/";
  return `${baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`}dashboard`;
};

const toErrorMessage = (err: unknown) => {
  const axiosErr = err as AxiosError<BackendErrorBody>;
  if (!axiosErr.response) return "Cannot reach backend. Check BACKEND_URL, HTTPS, and CORS settings.";
  if (axiosErr.response.status === 401) return "Pi token verification failed. Check the Pi Sandbox and API configuration.";
  return axiosErr.response.data?.message ? `Login failed: ${axiosErr.response.data.message}` : `Login failed with status ${axiosErr.response.status}.`;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authFeedback, setAuthFeedback] = useState<AuthFeedback | null>(null);

  useEffect(() => {
    if (!authFeedback) return;
    const timer = window.setTimeout(() => setAuthFeedback(null), 3000);
    return () => window.clearTimeout(timer);
  }, [authFeedback]);

  useEffect(() => {
    let mounted = true;
    const checkSession = async () => {
      const stored = getStoredPiUser();
      if (stored && mounted) setUser(stored);
      if (!getBaseURL()) { if (mounted) setIsLoading(false); return; }
      try {
        const response = await axiosClient.get<{ user?: Partial<User> | null }>("/user");
        if (response.data.user?.uid && response.data.user.username && mounted) {
          setUser(storeUser(toUser(response.data.user, stored || response.data.user as User)));
        } else if (mounted) {
          window.localStorage.removeItem(PI_USER_STORAGE_KEY);
          setUser(null);
        }
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 401) {
          window.localStorage.removeItem(PI_USER_STORAGE_KEY);
          if (mounted) setUser(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void checkSession();
    return () => { mounted = false; };
  }, []);

  const signInUser = useCallback(async (authResult: AuthResult) => {
    const fallback = authResultUser(authResult);
    let signedInUser = fallback;
    if (getBaseURL()) {
      const response = await axiosClient.post<SignInResponse>("/signin", { authResult });
      signedInUser = toUser(response.data.user, fallback);
    }
    setUser(storeUser(signedInUser));
    setShowSignIn(false);
    setAuthFeedback({ type: "success", message: `Signed in as ${signedInUser.username || "Pi user"}.` });
  }, []);

  const loginWithPi = useCallback(async () => {
    setAuthFeedback(null);
    if (!window.Pi) {
      if (import.meta.env.DEV && getBaseURL()) {
        setIsLoading(true);
        try {
          const response = await axiosClient.post<SignInResponse>("/user/dev-signin");
          const devFallback: User = {
            uid: response.data.user?.uid || "local-dev-user",
            username: response.data.user?.username || "localdev",
            roles: response.data.user?.roles || ["seller"],
            piUsername: response.data.user?.piUsername || "localdev",
            displayName: response.data.user?.displayName || "Local Dev Seller",
            country: response.data.user?.country || "Local",
            role: (response.data.user?.role as User["role"]) || "seller",
            contactPhone: response.data.user?.contactPhone || "@localdev",
            avatar: response.data.user?.avatar || "",
            coverImage: response.data.user?.coverImage || "",
            bio: response.data.user?.bio || "",
            language: response.data.user?.language || "English",
            sellerActive: true,
            blocked: false,
            verificationLevel: response.data.user?.verificationLevel || "trusted_seller",
            verificationRequested: false,
            settings: response.data.user?.settings || { theme: "light", language: "English", notifications: true },
            accessToken: "dev-token",
          };
          setUser(storeUser(toUser(response.data.user, devFallback)));
          setShowSignIn(false);
          setAuthFeedback({ type: "success", message: "Signed in with local development account." });
          window.location.replace(getDashboardUrl());
          return true;
        } catch (err) {
          console.error("Development login failed:", err);
          setAuthFeedback({ type: "error", message: "Local development login failed. Check backend DEV_AUTH and VITE_BACKEND_URL." });
          return false;
        } finally {
          setIsLoading(false);
        }
      }
      const message = "Login with Pi works inside Pi Browser. Please open SMAJ PI HUB in Pi Browser and try again.";
      setAuthFeedback({ type: "error", message });
      return false;
    }
    setIsLoading(true);
    try {
      const authResult = await authenticateWithTimeout(PI_AUTH_SCOPES);
      await signInUser(authResult);
      window.location.replace(getDashboardUrl());
      return true;
    } catch (err) {
      console.error("Pi login failed:", err);
      const message = isAxiosError<BackendErrorBody>(err)
        ? toErrorMessage(err)
        : (err as Error)?.message === "PI_AUTH_TIMEOUT"
          ? "Pi login timed out. Please close Pi Browser, reopen it, and try again."
          : "Pi login failed. In Pi Sandbox mobile preview, make sure you are signed in to a sandbox Pi account and the app is running with sandbox SDK enabled.";
      setAuthFeedback({ type: "error", message });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [signInUser]);

  const updateProfile = useCallback(async (profile: ProfileUpdate) => {
    if (!user) return null;

    const applyLocalProfileUpdate = () => {
      const sellerActive = profile.sellerActive ?? profile.role === "seller";
      const role = user.role === "admin" ? "admin" : sellerActive ? "seller" : "buyer";
      const verificationLevel = user.verificationLevel === "trusted_seller"
        ? "trusted_seller"
        : "verified";
      const updatedUser = storeUser(toUser({
        ...profile,
        role,
        roles: [role],
        sellerActive,
        verificationLevel,
        settings: { ...(user.settings || { theme: "light", language: "English", notifications: true }), language: profile.language || user.settings?.language || "English" },
      }, user));
      setUser(updatedUser);
      return updatedUser;
    };

    try {
      const response = await axiosClient.put<SignInResponse>("/user/profile", profile);
      if (response.data.user) {
        const updatedUser = storeUser(toUser(response.data.user, user));
        setUser(updatedUser);
        return updatedUser;
      }
    } catch (err) {
      if (isAxiosError(err) && (!err.response || [404, 405, 413, 502, 503, 504].includes(err.response.status))) {
        return applyLocalProfileUpdate();
      }
      throw err;
    }

    return applyLocalProfileUpdate();
  }, [user]);

  const updateSettings = useCallback(async (settings: { theme: "dark" | "light"; language: string; notifications: boolean }) => {
    const response = await axiosClient.put<SignInResponse>("/user/settings", settings);
    if (response.data.user && user) setUser(storeUser(toUser(response.data.user, user)));
  }, [user]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      if (getBaseURL()) await axiosClient.post("/user/signout");
      window.localStorage.removeItem(PI_USER_STORAGE_KEY);
      setUser(null);
      setAuthFeedback({ type: "success", message: "Signed out successfully." });
    } catch (err) {
      console.error("Sign-out failed:", err);
      window.localStorage.removeItem(PI_USER_STORAGE_KEY);
      setUser(null);
      setAuthFeedback({ type: "error", message: "Failed to sign out." });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    showSignIn,
    loginWithPi,
    signIn: loginWithPi,
    signOut,
    updateProfile,
    updateSettings,
    closeSignIn: () => setShowSignIn(false),
    requireAuth: () => setShowSignIn(true),
    isLoading,
    authFeedback,
  };
};
