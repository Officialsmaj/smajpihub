import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

interface AuthContextType {
  user: ReturnType<typeof useAuth>["user"];
  isAuthenticated: boolean;
  showSignIn: boolean;
  loginWithPi: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  closeSignIn: () => void;
  requireAuth: () => void;
  isLoading: boolean;
  authFeedback: ReturnType<typeof useAuth>["authFeedback"];
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={{
      user: auth.user,
      isAuthenticated: auth.isAuthenticated,
      showSignIn: auth.showSignIn,
      loginWithPi: auth.loginWithPi,
      signIn: auth.signIn,
      signOut: auth.signOut,
      closeSignIn: auth.closeSignIn,
      requireAuth: auth.requireAuth,
      isLoading: auth.isLoading,
      authFeedback: auth.authFeedback,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
