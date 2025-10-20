"use client";
import { useAuth } from "@/app/context/auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function UserProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <p>User not logged in.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-background text-foreground">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-4 text-card-foreground">
          User Profile
        </h1>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">ID:</p>
            <p className="text-lg font-medium text-foreground">{user.id}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email:</p>
            <p className="text-lg font-medium text-foreground">{user.email}</p>
          </div>
        </div>
        <Button
          className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => router.push("/auth/update-password")}
        >
          Change Password
        </Button>
        <Button
          className="w-full mt-4 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          onClick={signOut}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}