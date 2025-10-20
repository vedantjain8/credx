"use client";

import { useAuth } from "@/app/context/auth";
import { useEffect, useState } from "react";
import { ValidateEmail, ValidatePassword } from "@/lib/validation/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { signIn, signUp, user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  // TODO: show user onboarding page to select some user prefered topics to start with

  useEffect(() => {
    if (user) redirect("/dashboard");
  }, [user]);

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Loading Spinner Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
            <span className="text-foreground text-lg">Loading...</span>
          </div>
        </div>
      )}
      <form
        className={`bg-card p-8 rounded-lg shadow-lg min-w-[320px] w-full max-w-md ${
          loading ? "blur-sm pointer-events-none" : ""
        }`}
      >
        <label htmlFor="email" className="block text-card-foreground mb-2">
          Email:
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full mb-3 px-3 py-2 rounded border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <label htmlFor="password" className="block text-card-foreground mb-2">
          Password:
        </label>
        {/* TODO: add button to show/hide password */}
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full mb-3 px-3 py-2 rounded border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {error && <div className="text-destructive mb-3 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full py-2 rounded bg-primary text-primary-foreground font-semibold mb-2 hover:bg-primary/90 transition-colors"
          formAction={async (formData: FormData) => {
            try {
              const email = formData.get("email") as string;
              const password = formData.get("password") as string;
              ValidateEmail(email);
              ValidatePassword(password);
              try {
                await signIn(email, password);
                if (user) {
                  setError(null);
                  redirect("/dashboard");
                }
              } catch (error) {
                setError(
                  error instanceof Error ? error.message : String(error)
                );
              }
            } catch (error) {
              setError(error instanceof Error ? error.message : String(error));
            }
          }}
        >
          Log in
        </button>
        <button
          type="submit"
          className="w-full py-2 rounded bg-secondary text-secondary-foreground font-semibold border border-border hover:bg-secondary/80 transition-colors"
          formAction={async (formData: FormData) => {
            try {
              const email = formData.get("email") as string;
              const password = formData.get("password") as string;
              ValidatePassword(password);
              try {
                await signUp(email, password);
              } catch (error) {
                setError(
                  error instanceof Error ? error.message : String(error)
                );
                return;
              }
              if (user) {
                redirect("/dashboard");
              }
              setError(null);
            } catch (error) {
              setError(error instanceof Error ? error.message : String(error));
            }
          }}
        >
          Sign up
        </button>
        <Link
          href="/auth/forgot"
          className="text-sm text-primary hover:underline mt-4 block text-center"
        >
          Forgot Password?
        </Link>
      </form>
    </div>
  );
}
