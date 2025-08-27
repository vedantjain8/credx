import { NextRequest, NextResponse } from "next/server";
import SyncUserProfileOnFirstLogin from "@/controller/syncUserProfileOnFirstLogin";

export async function POST(req: NextRequest) {
  try {
    const { id: user_id } = await req.json();
    if (!user_id) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    await SyncUserProfileOnFirstLogin(user_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in /api/sync-user:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
