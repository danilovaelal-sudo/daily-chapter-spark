import { useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface AccessInfo {
  hasAccess: boolean;
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
  if (!startDate) return { hasAccess: false, daysElapsed: 0, daysRemaining: 0, startDate: null, isAdmin: false };
  const start = new Date(startDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - start.getTime();
  const dayIndex = Math.floor(diffMs / 86400000); // 0 on day 1
  const daysElapsed = Math.max(1, dayIndex + 1);
  const daysRemaining = Math.max(0, 30 - daysElapsed + 1);
  const hasAccess = daysElapsed >= 1 && daysElapsed <= 30;
  return { hasAccess, daysElapsed, daysRemaining, startDate: start, isAdmin: false };
}
