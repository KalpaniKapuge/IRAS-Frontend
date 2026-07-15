import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store";
import { ROLE_HOME } from "@/config/nav";

export function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  return <Navigate to={user ? ROLE_HOME[user.role] : "/login"} replace />;
}
