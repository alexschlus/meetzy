
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
};

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get current session and profile
  useEffect(() => {
    // Subscribe to auth changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          setTimeout(() => loadProfile(session.user.id), 0);
        } else {
          setUser(null);
        }
      }
    );

    // Fetch existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      const userId = data.session?.user?.id;
      if (userId) loadProfile(userId);
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line
  }, []);

  const loadProfile = useCallback(async (id: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      setUser(null);
    } else if (data) {
      setUser(data);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  // Login
  const signIn = useCallback(async (email: string, password: string) => {
    // Clean up possible limbo state
    if (typeof window !== "undefined") {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("supabase.auth.") || key.includes("sb-")) localStorage.removeItem(key);
      });
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("supabase.auth.") || key.includes("sb-")) sessionStorage.removeItem(key);
      });
    }
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch {}
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
  }, []);

  // Signup
  const signUp = useCallback(async (name: string, email: string, password: string) => {
    // Redirect after email registration
    const redirectTo = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { name },
      }
    });
    return error;
  }, []);

  // Logout
  const signOut = useCallback(async () => {
    if (typeof window !== "undefined") {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("supabase.auth.") || key.includes("sb-")) localStorage.removeItem(key);
      });
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("supabase.auth.") || key.includes("sb-")) sessionStorage.removeItem(key);
      });
    }
    await supabase.auth.signOut({ scope: 'global' });
    setUser(null);
    setSession(null);
    window.location.href = "/auth";
  }, []);

  // Save profile
  const updateProfile = useCallback(
    async (updates: Pick<UserProfile, "name" | "email" | "avatar">) => {
      if (!user) return { error: "Not authenticated" };
      const { error, data } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .maybeSingle();
      if (!error && data) setUser(data);
      return { error };
    },
    [user]
  );

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
}
