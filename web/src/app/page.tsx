"use client";

import { useAuth } from "./context/auth";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      {user ? `welcome ${user.email ?? "NO EMAIL FOUND"} ` : "this is the home page"}
      This is the home page of the Next.js application.
    </div>
  );
}
