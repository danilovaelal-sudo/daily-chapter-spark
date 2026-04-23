import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth, getAccessInfo } from "@/hooks/useAuth";
import AppLayout from "./AppLayout";

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { user, profile, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="font-display text-2xl animate-pulse">Открываем мастерскую…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Check 30-day access (admins always have access)
  if (!isAdmin && profile) {
    const access = getAccessInfo(profile.start_date);
    if (access.hasStarted && !access.hasAccess) {
      return <Navigate to="/access-ended" replace />;
    }
  }

  return <AppLayout>{children}</AppLayout>;
}
