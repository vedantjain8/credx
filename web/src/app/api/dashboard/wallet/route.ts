import { NextRequest, NextResponse } from "next/server";
import GetWalletData from "@/controller/ViewWallet";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const userSessionToken = request.headers
      .get("Authorization")
      ?.replace("Bearer ", "");

    if (!userSessionToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error,
    } = await (await supabase).auth.getUser(userSessionToken!);

    if (error || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const walletData = await GetWalletData(user.id);
    return NextResponse.json(walletData, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error in /api/dashboard/wallet:", error);
    const statusCode = errorMessage.includes("Wallet not found") ? 404 : 500;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
