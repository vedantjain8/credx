import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { User } from "@supabase/supabase-js";

export default async function AuthenticateUser(): Promise<User> {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
