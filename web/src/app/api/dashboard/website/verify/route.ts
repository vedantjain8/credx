import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { PrismaClient } from "@/generated/prisma";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const prisma = new PrismaClient();
    const supabase = createClient();
    const body = await request.json();
    const domain = body.domain;
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

    if (!domain) {
      return NextResponse.json(
        { message: "Missing domain or token" },
        { status: 400 }
      );
    }

    // fetch website record (use findFirst and handle not found)
    const tokenRecord = await prisma.websites.findFirst({
      where: { domain_name: domain, owner_id: user.id },
      select: { verification_token: true, website_id: true },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { message: "Website not found" },
        { status: 404 }
      );
    }

    // normalize domain for fetch (ensure protocol)
    const fetchUrl =
      typeof domain === "string" && /^(https?:)\/\//i.test(domain)
        ? domain
        : `https://${domain}`;

    const response = await fetch(fetchUrl, { method: "GET" });
    const $ = cheerio.load(await response.text());
    const webToken =
      $("meta[name='credx-verification']").attr("content") || null;

    if (!webToken || webToken !== tokenRecord.verification_token) {
      return NextResponse.json(
        { message: "Given verification token does not match" },
        { status: 400 }
      );
    }

    // update using the primary key to avoid any issues with unique constraints
    await prisma.websites.update({
      where: { website_id: tokenRecord.website_id },
      data: { status: "active", verified_at: new Date() },
    });

    return NextResponse.json({ message: "verified" }, { status: 200 });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      // Prisma record not found
      return NextResponse.json(
        { message: "Website not found" },
        { status: 404 }
      );
    }
    console.log("error in verifying website: ", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
