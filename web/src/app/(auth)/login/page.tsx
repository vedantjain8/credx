"use client";

import { useAuth } from "@/app/context/auth";
import { useState } from "react";
import { ValidateEmail, ValidatePassword } from "@/lib/validation/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { signIn, signUp, user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // TODO: show user onloading page to select some user prefered topics to start with

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black">
      {/* Loading Spinner Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <span className="text-white text-lg">Loading...</span>
          </div>
        </div>
      )}
      {/* Main Content (blurred when loading) */}
      <form
        className={`bg-gray-900 p-8 rounded-lg shadow-lg min-w-[320px] w-full max-w-md ${
          loading ? "blur-sm pointer-events-none" : ""
        }`}
      >
        <label htmlFor="email" className="block text-white mb-2">
          Email:
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full mb-3 px-3 py-2 rounded border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label htmlFor="password" className="block text-white mb-2">
          Password:
        </label>
        {/* TODO: add button to show/hide password */}
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full mb-3 px-3 py-2 rounded border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <div className="text-red-500 mb-3 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full py-2 rounded bg-blue-600 text-white font-semibold mb-2 hover:bg-blue-700 transition-colors"
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
              setError(error instanceof Error ? error.message : String(error));
            }
          }}
        >
          Log in
        </button>
        <button
          type="submit"
          className="w-full py-2 rounded bg-gray-800 text-white font-semibold border border-gray-700 hover:bg-gray-700 transition-colors"
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
