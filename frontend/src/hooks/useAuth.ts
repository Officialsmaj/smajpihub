import { AxiosError, isAxiosError } from "axios";
import { useCallback, useState, useEffect } from "react";
import { axiosClient, getBaseURL } from "../lib/axiosClient";
import type { AuthResult, PaymentDTO, User } from "../types/pi";

type AuthFeedback = {
  type: "success" | "error";
  message: string;
};

type BackendErrorBody = {
  error?: string;
  message?: string;
};

const PI_AUTH_TIMEOUT_MS = 30000;
const PI_USER_STORAGE_KEY = "smaj_pi_user";

export function onIncompletePaymentFound(payment: PaymentDTO) {
  console.log("Incomplete Pi payment found:", payment);
}

const authenticateWithTimeout = (scopes: string[]) =>
  Promise.race<AuthResult>([
    window.Pi!.authenticate(scopes, onIncompletePaymentFound),
    new Promise<AuthResult>((_, reject) => {
      setTimeout(() => reject(new Error("PI_AUTH_TIMEOUT")), PI_AUTH_TIMEOUT_MS);
    }),
  ]);

const getStoredPiUser = () => {
  try {
    const storedUser = window.localStorage.getItem(PI_USER_STORAGE_KEY);
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  } catch (err) {
    console.warn("Unable to read stored Pi user:", err);
    return null;
  }
};

const savePiUser = (authResult: AuthResult) => {
  const piUser: User = {
    uid: authResult.user?.uid,
    username: authResult.user?.username,
    wallet_address: authResult.user?.wallet_address,
    roles: authResult.user?.roles ?? [],
    accessToken: authResult.accessToken,
  };

  window.localStorage.setItem(PI_USER_STORAGE_KEY, JSON.stringify(piUser));
  return piUser;
};

const getDashboardUrl = () => {
  const baseUrl = import.meta.env.BASE_URL || "/";
  return `${baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`}dashboard`;
};

const toErrorMessage = (err: unknown) => {
  const axiosErr = err as AxiosError<BackendErrorBody>;

  if (!axiosErr.response) {
    return "Cannot reach backend. Check BACKEND_URL, HTTPS, and CORS settings.";
  }

  const status = axiosErr.response.status;
  const backendMessage = axiosErr.response.data?.message;

  if (status === 401) {
    return "Pi token verification failed (401). If you are in Sandbox, set backend PLATFORM_API_URL to sandbox and verify PI_API_KEY.";
  }

  if (backendMessage) {
    return `Login failed: ${backendMessage}`;
  }

  return `Login failed with status ${status}.`;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Initialize as true for initial session check
  const [authFeedback, setAuthFeedback] = useState<AuthFeedback | null>(null);

  useEffect(() => {
    if (authFeedback) {
      const timer = setTimeout(() => setAuthFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [authFeedback]);

  // Effect for initial session check
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const storedPiUser = getStoredPiUser();
      if (storedPiUser && isMounted) {
        setUser(storedPiUser);
        setIsLoading(false);
      }

      if (!getBaseURL()) {
        setIsLoading(false);
        return;
      }

      try {
        // Assuming /user endpoint returns current user if logged in
        const response = await axiosClient.get("/user");
        if (response.data?.user && isMounted) {
          setUser(response.data.user);
        }
      } catch (err) {
        // No active session found or backend unreachable, user remains null
        console.log("No active session found or error checking session:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    checkSession();

    return () => {
      isMounted = false;
    };
  }, []); // Run once on mount

  const signInUser = useCallback(async (authResult: AuthResult) => {
    const piUser = savePiUser(authResult);

    if (getBaseURL()) {
      try {
        await axiosClient.post("/signin", { authResult });
      } catch (err) {
        console.warn("Backend sign-in failed after Pi authentication:", err);
      }
    }

    setUser(piUser);
    setShowSignIn(false);
    setAuthFeedback({ type: "success", message: `Signed in as ${piUser.username ?? "Pi user"}.` });
  }, []);

  const loginWithPi = useCallback(async function loginWithPi() {
    setIsLoading(true);
    setAuthFeedback(null);

    if (!window.Pi) {
      const message = "Please open SMAJ PI HUB inside Pi Browser to login.";
      setAuthFeedback({ type: "error", message });
      alert(message);
      setIsLoading(false);
      return;
    }

    try {
      const scopes = ["username", "payments", "wallet_address"];
      const authResult = await authenticateWithTimeout(scopes);
      await signInUser(authResult);
      window.location.href = getDashboardUrl();
    } catch (err) {
      console.error("Pi login failed:", err);
      // Only show generic Pi Browser error if it's not a backend Axios error
      if (isAxiosError<BackendErrorBody>(err)) {
        setAuthFeedback({ type: "error", message: toErrorMessage(err) });
      } else if ((err as Error)?.message === "PI_AUTH_TIMEOUT") {
        setAuthFeedback({
          type: "error",
          message: "Pi login timed out. Please close Pi Browser, reopen it, and try Login with Pi again.",
        });
      } else {
        setAuthFeedback({ type: "error", message: "Pi login failed. Please try again inside Pi Browser." });
      }
      alert("Pi login failed. Please try again inside Pi Browser.");
    } finally {
      setIsLoading(false);
    }
  }, [signInUser]);

  const signIn = loginWithPi;

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      if (getBaseURL()) {
        await axiosClient.get("/user/signout");
      }
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

  const closeSignIn = useCallback(() => {
    setShowSignIn(false);
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    showSignIn,
    loginWithPi,
    signIn,
    signOut,
    closeSignIn,
    requireAuth: () => setShowSignIn(true),
    isLoading,
    authFeedback,
  };
};
