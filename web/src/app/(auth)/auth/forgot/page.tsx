"use client";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ValidateEmail } from "@/lib/validation/auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="w-full max-w-lg">
        <div className="bg-card rounded-xl shadow-lg p-8 border border-border animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-semibold text-card-foreground mb-2">
            Reset your password
          </h1>
          <p className="text-muted-foreground mb-6">
            Enter the email associated with your account and we&apos;ll send a secure link to reset your password.
          </p>

          <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-2">
            Email address
          </label>
          <Input
            id="email"
            required
            type="email"
            value={email}
            placeholder="your@mail.com"
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMsg(null);
            }}
            aria-label="Email for password reset"
            className="mb-4 bg-input text-foreground"
          />

          {errorMsg && <p className="text-sm text-destructive mb-4">{errorMsg}</p>}
          {status === "success" && (
            <div className="mb-4 rounded-md bg-primary/10 border border-primary/20 p-3 text-sm primary-foreground">
              Password reset email sent. Check your inbox (and spam folder).
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <button
              onClick={async () => {
                try {
                  setErrorMsg(null);

                  if (!ValidateEmail(email)) {
                    setErrorMsg("Please enter a valid email address.");
                    return;
                  }

                  setStatus("loading");
                  const supabase = createClient();
                  const { data, error } = await (supabase).auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/update-password`,
                  });

                  if (error) {
                    setErrorMsg(error.message || "Failed to send reset email.");
                    setStatus("error");
                    return;
                  }

                  setStatus("success");
                } catch (err) {
                  setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
                  setStatus("error");
                }
              }}
              disabled={status === "loading" || status === "success"}
              className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                status === "loading"
                  ? "bg-primary/70 text-primary-foreground cursor-wait"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              } disabled:opacity-60`}
              aria-busy={status === "loading"}
            >
              {status === "loading" ? "Sending..." : status === "success" ? "Sent" : "Send Reset Link"}
            </button>

            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Back to login
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            If you don&apos;t receive an email, try again or contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
