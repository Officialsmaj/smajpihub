import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import PrivateSkeleton from "./PrivateSkeleton";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, requireAuth } = useAuthContext();
  const location = useLocation();
  const skeleton = (() => {
    if (location.pathname === "/dashboard") return { variant: "home" as const, count: 6 };
    if (location.pathname === "/profile" || location.pathname === "/settings" || location.pathname.startsWith("/settings/")) return { variant: "profile" as const, count: 6 };
    if (location.pathname === "/store" || location.pathname === "/saved") return { variant: "grid" as const, count: 6 };
    if (location.pathname === "/messages") return { variant: "messages" as const, count: 6 };
    if (location.pathname === "/notifications") return { variant: "notifications" as const, count: 5 };
    if (location.pathname === "/search") return { variant: "search" as const, count: 5 };
    if (location.pathname === "/orders") return { variant: "orders" as const, count: 4 };
    if (location.pathname === "/app/wallet") return { variant: "wallet" as const, count: 4 };
    if (location.pathname === "/seller") return { variant: "sellerDashboard" as const, count: 4 };
    if (location.pathname.startsWith("/product/")) return { variant: "product" as const, count: 1 };
    if (location.pathname.startsWith("/seller/")) return { variant: "seller" as const, count: 1 };
    return { variant: "page" as const, count: 4 };
  })();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      requireAuth();
    }
  }, [isAuthenticated, isLoading, requireAuth]);

  if (isLoading) {
    return (
      <main className="private-page private-route-loading">
        <PrivateSkeleton variant={skeleton.variant} count={skeleton.count} />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
