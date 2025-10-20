"use client";
import { ValidatePassword } from "@/lib/validation/auth";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        setError(null);
        setSuccess(null);
      }
    });
  }, [supabase]);

  const handlePasswordUpdate = async () => {
    setError(null);
    setSuccess(null);

    if (!newPassword) {
      setError("Password cannot be empty.");
      return;
    }
    try {
      ValidatePassword(newPassword);
    } catch (validationError) {
      if (validationError instanceof Error) {
        setError(validationError.message);
      } else {
        setError("An unknown validation error occurred.");
      }
      return;
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (data) {
      setSuccess("Password updated successfully!");
    }
    if (error) {
      setError("There was an error updating your password.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-background text-foreground">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-4 text-card-foreground">
          Update Your Password
        </h1>
        {error && <p className="text-destructive mb-3 text-sm">{error}</p>}
        {success && <p className="text-success mb-3 text-sm">{success}</p>}
        <Input
          type="password"
          placeholder="Enter your new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mb-4"
        />
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handlePasswordUpdate}
        >
          Update Password
        </Button>
      </div>
    </div>
  );
}
