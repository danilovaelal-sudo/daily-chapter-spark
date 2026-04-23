import { useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface AccessInfo {
  hasAccess: boolean;
  hasStarted: boolean;
  daysElapsed: number; // 1-based
  daysRemaining: number;
  startDate: Date | null;
  isAdmin: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string | null; start_date: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadProfile = useCallback(async (uid: string) => {
    const [{ data: prof }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("full_name, start_date").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile(prof ?? null);
    setIsAdmin(!!roles?.some((r) => r.role === "admin"));
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => loadProfile(session.user.id), 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, profile, isAdmin, loading, signOut, reloadProfile: loadProfile };
}

export function getAccessInfo(startDate: string | null | undefined): AccessInfo {
  if (!startDate) {
    return { hasAccess: false, hasStarted: false, daysElapsed: 0, daysRemaining: 30, startDate: null, isAdmin: false };
  }

  const start = new Date(`${startDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - start.getTime();
  const dayIndex = Math.floor(diffMs / 86400000); // 0 on day 1
  const hasStarted = dayIndex >= 0;
  const daysElapsed = hasStarted ? dayIndex + 1 : 0;
  const daysRemaining = hasStarted ? Math.max(0, 30 - daysElapsed + 1) : 30;
  const hasAccess = hasStarted && daysElapsed <= 30;

  return { hasAccess, hasStarted, daysElapsed, daysRemaining, startDate: start, isAdmin: false };
}
