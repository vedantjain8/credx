import { NextResponse } from "next/server";
import { getAiRecommendations } from "@/controller/GetAiRecommendations";
// import { verifyWebsite } from "@/controller/VerifyWebsite";

export async function POST(request: Request) {
  try {
    const { hostToken, userId } = await request.json();

    // Basic validation

    if (!hostToken || !userId) {
      console.log(!userId ? "Missing userId" : "Missing hostToken");
      return NextResponse.json(
        { error: "Missing verificationToken or userId" },
        { status: 400 }
      );
    }
    
    console.log(`Widget request: user=${userId}`);

    // Verify the website exists in our database
    // The controller will throw an error if the token is invalid
    // const website = await verifyWebsite({ verificationToken: hostToken });
    // console.log(
    //   `Verified website: ${website.domain_name} (ID: ${website.website_id})`
    // );

    const recommendations = await getAiRecommendations({
      userId,
      verificationToken: hostToken,
    });

    return NextResponse.json(recommendations, { status: 200 });
  } catch (error) {
    console.error("Error in /api/recommendations:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown server error occurred";

    // If the error is due to an invalid token, return a 403 Forbidden status.
    const statusCode = errorMessage.includes("Invalid verification token")
      ? 403
      : 500;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
