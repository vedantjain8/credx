"use client";

import { useAuth } from "@/app/context/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LogoutPage() {
  const { signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      await signOut();
      router.push("/login");
    };
    logout();
  });
  return (
    <div>
      <h1>Hate to see you leaving...</h1>
    </div>
  );
}
