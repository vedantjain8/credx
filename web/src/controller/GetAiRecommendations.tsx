type RecommendationParams = {
  userId: string;
};

type RecommendedArticle = {
  title: string;
  url: string;
  image: string; 
  description: string;
};


export async function getAiRecommendations({ userId}: RecommendationParams): Promise<RecommendedArticle> {
  console.log(`Fetching recommendations for user ${userId} `);

  // --- MOCK DATA ---
  // Replace with  actual AI recommendation logic.
  const mockArticle: RecommendedArticle = {
    title: "US parents and teachers: share your experiences of AI in schools",
    description: ">We would like to hear what people think about the use of artificial intelligence in schools in the US",
    url: "https://www.theguardian.com/technology/2025/aug/27/us-parents-and-teachers-share-your-experiences-of-ai-in-schools",
    
    image: "https://imgs.search.brave.com/s0ctBaElRT1W3tocaT2hjiMlNKBNOumHwMrHGQtzKoY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdDMu/ZGVwb3NpdHBob3Rv/cy5jb20vOTg4MDgw/MC8xNjM3MS9pLzQ1/MC9kZXBvc2l0cGhv/dG9zXzE2MzcxMjM4/Ni1zdG9jay1waG90/by1zY2hvb2xjaGls/ZHJlbi5qcGc",
  };

  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return mockArticle;
}
