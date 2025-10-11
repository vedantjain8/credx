// GetUserWebsites: Our custom controller function that handles the database logic to fetch websites.
//RETURNS : It returns the list of websites as a JSON response.
import { NextResponse } from 'next/server';
import GetUserWebsites from '@/controller/GetUserWebsite'; 
import AuthenticateUser from '@/controller/AuthenticateUser';
export async function GET(request: Request) {
  try {
    const user = AuthenticateUser();
    const websites = await GetUserWebsites((await user).id);

    return NextResponse.json(websites, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}