import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import PrivateSkeleton from "./PrivateSkeleton";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, requireAuth } = useAuthContext();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      requireAuth();
    }
  }, [isAuthenticated, isLoading, requireAuth]);

  if (isLoading) {
    return (
      <main className="private-page private-route-loading">
        <PrivateSkeleton />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
