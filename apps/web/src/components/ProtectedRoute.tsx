import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../lib/auth";

interface Props {
  children: ReactNode;
  roles?: string[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return (
      <div className="py-12 text-center text-slate-500">
        You do not have permission to view this page.
      </div>
    );
  }
  return <>{children}</>;
}
