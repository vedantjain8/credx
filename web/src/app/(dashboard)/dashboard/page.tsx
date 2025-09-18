// app/dashboard/page.tsx
"use client";

import { useAuth } from "@/app/context/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        <p>Please log in to view the dashboard.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full bg-black p-8 text-white">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400">
          Welcome back, <span className="font-medium text-white">{user.email}</span>!
        </p>
        <p className="text-gray-400">
          From here you can manage your websites, promotions, and wallet.
        </p>

        {/* Action buttons are now in a flex container for alignment */}
        <div className="flex items-center gap-4 pt-4">
          <Button asChild size="lg">
            <Link href="/dashboard/websites">
              Manage My Websites
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard/promotions">
              Manage Promotions
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard/wallet">
              View Wallet
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

