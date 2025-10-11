"use client";
import { ValidatePassword } from "@/lib/validation/auth";
import { createClient } from "@/utils/supabase/client";
import { useEffect } from "react";

export default function UpdatePasswordPage() {
  const supabase = createClient();
  useEffect(() => {
    try {
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event == "PASSWORD_RECOVERY") {
          const newPassword =
            prompt("What would you like your new password to be?") ?? null;
          if (!newPassword) {
            alert("Password cannot be empty");
            return;
          }
          if (!ValidatePassword(newPassword)) {
            alert("Password does not meet the requirements");
            return;
          }
          const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
          });
          if (data) alert("Password updated successfully!");
          if (error) alert("There was an error updating your password.");
        }
      });
    } catch (err) {
      console.log(err);
      return;
    }
  }, []);

  return <div>Update Password Page</div>;
}
