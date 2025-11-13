import { PrismaClient } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  // handle the click tracking here

  // get userid, useragent, ip address from request
  const { hostToken, promotion_id } = await request.json();
  let { userId } = await request.json();
  const ipAddress =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  // validation
  if (!hostToken)
    return NextResponse.json({ error: "Missing hostToken" }, { status: 400 });

  if (userId === "ROBINHOOD") userId = "a1b2c3d4-e5f6-5432-1098-76543210abcd";

  try {
    // update user wallet (fallback to admin wallet if user wallet not found)

    // update user wallet
    await prisma.wallets.updateMany({
      where: { user_id: userId },
      data: {
        balance: { increment: 0.03 },
      },
    });

    // update host wallet
    const website_owner_uuid = await prisma.websites.findUnique({
      where: { verification_token: hostToken },
      select: { owner_id: true },
    });
    if (website_owner_uuid) {
      await prisma.wallets.updateMany({
        where: { user_id: website_owner_uuid?.owner_id },
        data: {
          balance: { increment: 0.07 },
        },
      });
    }

    // update remaining impressions in promotions table
    await prisma.promotions.updateMany({
      where: { promotion_id: promotion_id },
      data: {
        remaining_impressions: { decrement: 1 },
      },
    });

    // update events table
    await prisma.events.create({
      data: {
        promoted_content_id: promotion_id,
        host_website_id: (
          await prisma.websites.findFirst({
            where: { verification_token: hostToken },
            select: { website_id: true },
          })
        )?.website_id,
        viewer_user_id: userId,
        event_type: "click",
        ip_address: ipAddress,
        user_agent: userAgent,
      },
    });

    // update transactions table
    await prisma.transactions.createMany({
      data: [
        {
          content_id: promotion_id,
          from_wallet_id: "a1b2c3d4-e5f6-5432-1098-76543210abcd",
          to_wallet_id:
            userId === "ROBINHOOD"
              ? "a1b2c3d4-e5f6-5432-1098-76543210abcd"
              : (
                  await prisma.wallets.findFirst({
                    where: { user_id: userId },
                    select: { wallet_id: true },
                  })
                )?.wallet_id,
          amount: 0.03,
          transaction_type: "viewer_bonus",
        },
        {
          content_id: promotion_id,
          from_wallet_id: "a1b2c3d4-e5f6-5432-1098-76543210abcd",
          to_wallet_id: (
            await prisma.wallets.findFirst({
              where: { user_id: website_owner_uuid?.owner_id },
              select: { wallet_id: true },
            })
          )?.wallet_id,
          amount: 0.07,
          transaction_type: "host_payment",
        },
      ],
    });

    // return a 200 response
    return NextResponse.json({ message: "SUCCESS" }, { status: 200 });
  } catch (error) {
    console.error("Error in click handler:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
