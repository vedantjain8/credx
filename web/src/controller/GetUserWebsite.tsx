import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export default async function GetUserWebsites(
  user_id: string | null
): Promise<any[]> {
  if (!user_id) {
    throw new Error("User not logged in");
  }

  const userWebsites = await prisma.websites.findMany({
    where: { owner_id: user_id },
    select: {
      domain_name: true,
      status: true,
      website_id: true,
    },
  });

  if (!userWebsites) {
    return [];
  }

  return userWebsites;
}
