import { PrismaClient } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  // Prefer explicit query parameter: /api/.../website?websiteid=xxx
  const url = new URL(request.url);
  let websiteid = url.searchParams.get("websiteid") ?? null;

  // Fallback: if dynamic route was used (/api/.../website/<id>), parse last path segment
  if (!websiteid) {
    const parts = url.pathname.split("/").filter(Boolean);
    websiteid = parts[parts.length - 1] ?? null;
  }

  if (!websiteid) {
    return NextResponse.json({ message: "Missing website id" }, { status: 400 });
  }

  //   get website's articles from supabase
  const articles = await prisma.promotions.findMany({
    take: 10,
    where: { website_id: websiteid },
  });

  return NextResponse.json({
    message: articles,
    status: 200,
  });
}
