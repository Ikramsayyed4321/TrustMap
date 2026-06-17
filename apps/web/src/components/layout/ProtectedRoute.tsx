import { Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "../../store/app.store";

export function ProtectedRoute({ roles }: { roles?: string[] }) {
  const user = useAppStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
