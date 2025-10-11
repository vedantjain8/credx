import prisma from "@/lib/prisma";


export default async function GetArticlesByWebsite(websiteId: string, owner_id: string) {
  
  const websiteOwner = await prisma.websites.findFirst({
    where: {
      website_id: websiteId,
      owner_id: owner_id,
    },
    select: {
      website_id: true, 
    },
  });

  
  if (!websiteOwner) {
    throw new Error("Forbidden: You do not own this website.");
  }


  const articlesFromDb = await prisma.content_items.findMany({
    where: {
      website_id: websiteId,
    },
    select: {
      content_id: true,
      title: true,
      promotions: {
        select: {
          status: true,
          budget: true,
          credits_spent: true,
        },
      },
    },
  });

  
  const articles = articlesFromDb.map(article => ({
    id: article.content_id,
    title: article.title,
    promotions: article.promotions,
  }));

  return articles;
}
