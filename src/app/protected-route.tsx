import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store";
import { ROLE_HOME } from "@/config/nav";
import type { UserRole } from "@/types/enums";

interface ProtectedRouteProps {
  allow?: UserRole[];
}

/** Gate a route subtree behind authentication, and optionally a role allow-list. */
export function ProtectedRoute({ allow }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allow && !allow.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role]} replace />;
  }

  return <Outlet />;
}

/** Keeps already-authenticated users off the login/register screens. */
export function GuestRoute() {
  const user = useAuthStore((s) => s.user);
  if (user) return <Navigate to={ROLE_HOME[user.role]} replace />;
  return <Outlet />;
}
