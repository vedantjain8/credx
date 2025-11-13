import { PrismaClient } from "@/generated/prisma";

type RecommendationParams = {
  userId: string;
  verificationToken: string;
};

type ArticleModel = {
  id: number | string;
  title: string;
  url: string;
  image?: string | null;
  description?: string | null;
  tags?: string[];
  categories?: string | null;
};

type PromotionRow = {
  promotion_id: number | string;
  title: string;
  summary?: string | null;
  image_url?: string | null;
  article_url: string;
  tags?: string[];
  categories?: string | null;
};

const prisma = new PrismaClient();

/**
 * Recommendation rules implemented here:
 * - If userId === 'ROBINHOOD' return random active promotions (visitor flow)
 * - Otherwise load user's preferences and attempt a vector similarity search
 *   against the `promotions.embedding` column (pgvector using cosine ops).
 * - If embeddings are not available (no OPENAI_API_KEY or embedding fails)
 *   fall back to tag/category overlap + boost ordering.
 * - All query results are limited to 10 rows and use indexed/filtered SQL to
 *   keep the database work efficient.
 */
export async function getAiRecommendations({
  userId,
  verificationToken,
}: RecommendationParams): Promise<ArticleModel | null> {
  console.log(
    `Fetching recommendations for user/visitor ${userId} and verification token: ${verificationToken}`
  );

  // Safety: return a single best article
  const LIMIT = 1;

  // If anonymous visitor, return random active promotions (ROBINHOOD behaviour)
  if (userId === "ROBINHOOD") {
    // SQL (anonymous visitor):
    const row = await prisma.promotions.findFirst({
      where: { status: "active" },
      select: {
        promotion_id: true,
        title: true,
        summary: true,
        image_url: true,
        article_url: true,
        tags: true,
        categories: true,
      },
    });

    if (!row) return null;

    const data: ArticleModel = {
      id: row.promotion_id,
      title: row.title,
      url: row.article_url,
      image: row.image_url || null,
      description: row.summary || null,
      tags: row.tags || [],
      categories: row.categories || null,
    };

    return data;
  }

  // Load user preferences
  const prefs = await prisma.user_preferences.findUnique({
    where: { user_id: userId },
  });

  // If no preferences found, fall back to best promotions by boost
  if (!prefs || !prefs.interests || prefs.interests.length === 0) {
    // SQL (no preferences)
    const row = (await prisma.promotions.findFirst({
      where: { status: "active" },
      orderBy: { boost: "desc" },
      select: {
        promotion_id: true,
        title: true,
        summary: true,
        image_url: true,
        article_url: true,
        tags: true,
        categories: true,
      },
    })) as PromotionRow | null;

    if (!row) return null;

    return {
      id: row.promotion_id,
      title: row.title,
      url: row.article_url,
      image: row.image_url || null,
      description: row.summary || null,
      tags: row.tags || [],
      categories: row.categories || null,
    };
  }

  // Helper: escape single quotes for safe SQL construction of a text array
  const escapeSql = (s: string) => s.replace(/'/g, "''");
  const interestsEscaped = prefs.interests.map(escapeSql);
  const interestsArraySql =
    "ARRAY['" + interestsEscaped.join("','") + "']::text[]";

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_EMBED_ENDPOINT = process.env.GEMINI_EMBED_ENDPOINT; // e.g. a URL to POST embedding requests to
  const GEMINI_EMBED_MODEL =
    process.env.GEMINI_EMBED_MODEL || "text-embedding-004";

  if (GEMINI_KEY && GEMINI_EMBED_ENDPOINT) {
    try {
      const inputText = Array.isArray(prefs.interests)
        ? prefs.interests.join(" ")
        : String(prefs.interests);

      const resp = await fetch(GEMINI_EMBED_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GEMINI_KEY}`,
        },
        body: JSON.stringify({ model: GEMINI_EMBED_MODEL, input: inputText }),
      });

      if (!resp.ok) {
        throw new Error(
          `Gemini embedding request failed: ${await resp.text()}`
        );
      }

      const json = await resp.json();
      console.log("Gemini embedding response:", json);
      // Expecting a structure similar to: { data: [ { embedding: [...] } ] }
      const vector: number[] = json?.data?.[0]?.embedding;

      if (Array.isArray(vector) && vector.length > 0) {
        const vectorSql = "[" + vector.join(",") + "]";

        const q = `
          SELECT id, title, summary AS description, image_url AS image, article_url AS url, tags, categories, boost,
                 embedding <#> '${vectorSql}'::vector AS distance
          FROM promotions
          WHERE active = true
            AND (categories = ANY(${interestsArraySql}) OR tags && ${interestsArraySql})
          ORDER BY distance ASC, boost DESC
          LIMIT ${LIMIT}`;

        // SQL (vector similarity)
        const rows = (await prisma.$queryRawUnsafe(q)) as Array<
          Record<string, unknown>
        >;

        if (rows && rows.length > 0) {
          const r = rows[0] as Record<string, unknown>;
          return {
            id: (r.id ?? null) as number | string,
            title: (r.title ?? "") as string,
            url: (r.url ?? "") as string,
            image: (r.image ?? null) as string | null,
            description: (r.description ?? null) as string | null,
            tags: (Array.isArray(r.tags)
              ? (r.tags as string[])
              : []) as string[],
            categories: (r.categories ?? null) as string | null,
          };
        }
      }
    } catch (err) {
      console.warn(
        "Gemini embedding error, falling back to tag/category match:",
        err
      );
    }
  }

  // Fallback: tag/category matching with boost ordering. Uses GIN index on tags
  // and a simple equality check on categories so queries remain index-friendly.
  const fallbackQ = `
    SELECT id, title, summary AS description, image_url AS image, article_url AS url, tags, categories, boost,
           CASE WHEN categories = ANY(${interestsArraySql}) THEN 0 ELSE 1 END AS mismatch
    FROM promotions
    WHERE active = true
      AND (categories = ANY(${interestsArraySql}) OR tags && ${interestsArraySql})
    ORDER BY mismatch ASC, boost DESC
    LIMIT ${LIMIT}
  `;

  // SQL (tag/category fallback)
  const fallbackRows = (await prisma.$queryRawUnsafe(fallbackQ)) as Array<
    Record<string, unknown>
  >;

  if (!fallbackRows || fallbackRows.length === 0) return null;

  const fr = fallbackRows[0] as Record<string, unknown>;
  return {
    id: (fr.id ?? null) as number | string,
    title: (fr.title ?? "") as string,
    url: (fr.url ?? "") as string,
    image: (fr.image ?? null) as string | null,
    description: (fr.description ?? null) as string | null,
    tags: (Array.isArray(fr.tags) ? (fr.tags as string[]) : []) as string[],
    categories: (fr.categories ?? null) as string | null,
  };
}
