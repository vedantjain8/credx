import { NextResponse } from "next/server";
import { createPromotion } from "@/controller/CreatePromotion";
import AuthenticateUser from "@/controller/AuthenticateUser";

export async function POST(request: Request) {
  try {
    const user = await AuthenticateUser();
    // Parse the incoming request body
    const { content_id, budget, status } = await request.json();
    if (!content_id || typeof budget !== "number" || budget <= 0) {
      return NextResponse.json(
        { error: "Missing or invalid content_id or budget" },
        { status: 400 },
      );
    }
    // database logic
    const newPromotion = await createPromotion({
      content_id,
      budget,
      status,
      owner_id: user.id,
    });

    return NextResponse.json(newPromotion, { status: 201 });
  } catch (error) {
    console.error("Failed to create promotion:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    const statusCode = errorMessage.includes("Forbidden") ? 403 : 500;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
