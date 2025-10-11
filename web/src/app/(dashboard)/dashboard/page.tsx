// app/dashboard/page.tsx
"use client";

import { useAuth } from "@/app/context/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <p>Please log in to view the dashboard.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full bg-background p-8 text-foreground">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Welcome back,{" "}
          <span className="font-medium text-foreground">{user.email}</span>!
        </p>
        <p className="text-muted-foreground">
          From here you can manage your websites, promotions, and wallet.
        </p>

        <div className="flex items-center gap-4 pt-4">
          <Button asChild size="lg">
            <Link href="/dashboard/websites">Manage My Websites</Link>
          </Button>

          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard/promotions">Manage Promotions</Link>
          </Button>

          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard/wallet">View Wallet</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
