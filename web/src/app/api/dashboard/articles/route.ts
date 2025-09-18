// API route to fetch articles for a specific website, authorized for the current user.
import { NextResponse } from 'next/server';
import GetArticlesByWebsite from '@/controller/GetArticlesByWebsite'; // Import the controller
import AuthenticateUser from '@/controller/AuthenticateUser';

// This line tells Next.js to never cache the response of this route.
// It will always run on the server at request time, ensuring fresh data.
export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
  try {
   const user = AuthenticateUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');
    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
    }

    
    const articles = await GetArticlesByWebsite(websiteId, (await user).id);

 
    return NextResponse.json(articles, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    const statusCode = errorMessage.includes("Forbidden") ? 403 : 500;
    
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

