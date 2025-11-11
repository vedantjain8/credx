"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createClient } from "@/utils/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { ValidateEmail, ValidatePassword } from "@/lib/validation/auth";
import Cookies from "js-cookie";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(); // ✅ no await here

  function setAuthCookie(userId: string) {
    // Check if running on localhost
    const isLocalhost = window.location.hostname === "localhost";

    Cookies.set("create_user_id", userId, {
      path: "/",
      sameSite: "None",
      secure: !isLocalhost,
    });
  }

  function removeAuthCookie() {
    Cookies.remove("create_user_id", { path: "/" });
  }

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        localStorage.setItem("credx_user_id", data.session.user.id);
        setAuthCookie(data.session.user.id);
      } else {
        localStorage.removeItem("credx_user_id");
        removeAuthCookie();
      }
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          localStorage.setItem("credx_user_id", session.user.id);
          setAuthCookie(session.user.id);
        } else {
          localStorage.removeItem("credx_user_id");
          removeAuthCookie();
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      const validEmail = ValidateEmail(email);
      if (!validEmail) {
        setLoading(false);
        return;
      }
      const validPassword = ValidatePassword(password);
      if (!validPassword) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setSession(data.session);
      setUser(data.session?.user ?? null);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);

      const validEmail = ValidateEmail(email);
      if (!validEmail) {
        setLoading(false);
        return;
      }
      const validPassword = ValidatePassword(password);
      if (!validPassword) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm/otp`,
        },
      });
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);

      if (error) throw error;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    if (user) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
