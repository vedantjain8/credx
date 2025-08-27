import { PrismaClient } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain_name, rss_feed_url, owner_id } = body;

    const response = await prisma.websites.create({
      data: {
        domain_name,
        rss_feed_url,
        owner_id,
        verification_token_expires_at: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ), // 1 year from now
      },
    }); // returns complete record in map

    return NextResponse.json(
      { verification_token: response.verification_token },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      // Prisma unique constraint failed
      return NextResponse.json(
        { message: "Website with this domain already exists." },
        { status: 409 }
      );
    }
    console.log("error while saving website to db: ", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
