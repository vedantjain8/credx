"use client";

import { useAuth } from "@/app/context/auth";
import { useState } from "react";
import { ValidateEmail, ValidatePassword } from "@/lib/validation/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { signIn, signUp, user, loading } = useAuth();
  // TODO: use loading state to show a spinner while loading
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  return (
    <div
      style={{
        background: "#000",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form
        style={{
          background: "#111",
          padding: 32,
          borderRadius: 8,
          boxShadow: "0 2px 8px #222",
          minWidth: 320,
        }}
      >
        <label htmlFor="email" style={{ color: "#fff" }}>
          Email:
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          style={{
            width: "100%",
            marginBottom: 12,
            padding: 8,
            borderRadius: 4,
            border: "1px solid #333",
            background: "#222",
            color: "#fff",
          }}
        />
        <label htmlFor="password" style={{ color: "#fff" }}>
          Password:
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          style={{
            width: "100%",
            marginBottom: 12,
            padding: 8,
            borderRadius: 4,
            border: "1px solid #333",
            background: "#222",
            color: "#fff",
          }}
        />
        {error && (
          <div
            style={{
              color: "#ff4d4f",
              marginBottom: 12,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 4,
            background: "#0070f3",
            color: "#fff",
            border: "none",
            marginBottom: 8,
            cursor: "pointer",
          }}
          formAction={async (formData: FormData) => {
            try {
              const email = formData.get("email") as string;
              const password = formData.get("password") as string;
              ValidateEmail(email);
              ValidatePassword(password);
              await signIn(email, password);
              if (user) {
                router.push("/dashboard");
              }
              setError(null);
            } catch (error) {
              console.log(error);
              setError(error instanceof Error ? error.message : String(error));
            }
          }}
        >
          Log in
        </button>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 4,
            background: "#222",
            color: "#fff",
            border: "1px solid #333",
            cursor: "pointer",
          }}
          formAction={async (formData: FormData) => {
            try {
              const email = formData.get("email") as string;
              const password = formData.get("password") as string;
              ValidatePassword(password);
              await signUp(email, password);
              if (user) {
                router.push("/dashboard");
              }
              setError(null);
            } catch (error) {
              setError(error instanceof Error ? error.message : String(error));
            }
          }}
        >
          Sign up
        </button>
      </form>
    </div>
  );
}
