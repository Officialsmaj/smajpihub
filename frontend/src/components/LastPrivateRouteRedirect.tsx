import { Navigate } from "react-router-dom";

const LAST_PRIVATE_ROUTE_KEY = "smaj_last_private_route";

const safePrivateRoute = () => {
  try {
    const stored = window.sessionStorage.getItem(LAST_PRIVATE_ROUTE_KEY) || window.localStorage.getItem(LAST_PRIVATE_ROUTE_KEY) || "";
    if (!stored.startsWith("/") || stored.startsWith("//")) return "/dashboard";
    if (stored === "/app") return "/dashboard";
    return stored;
  } catch {
    return "/dashboard";
  }
};

const LastPrivateRouteRedirect = () => <Navigate to={safePrivateRoute()} replace />;

export default LastPrivateRouteRedirect;
