import { PrismaClient } from "@/generated/prisma";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const prismaClient = new PrismaClient();
    const body = await request.json();
    const userPreferences: string[] = body.preferences || [];
    const userSessionToken = request.headers
      .get("Authorization")
      ?.replace("Bearer ", "");

    if (!userSessionToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await (await supabase).auth.getUser(userSessionToken!);

    if (error || !user) {
      console.log("error fetching user: ", error);
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await prismaClient.user_preferences.update({
      where: { user_id: user.id },
      data: { interests: userPreferences },
    });
    return NextResponse.json(
      { message: "updated user profile" },
      { status: 200 }
    );
  } catch (error) {}
  return NextResponse.json(
    { message: "updated user profile" },
    { status: 200 }
  );
}
