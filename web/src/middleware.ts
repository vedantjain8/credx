import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // For API routes, we need to add the CORS headers
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const response = NextResponse.next();

    // The '*' value allows any website to make requests to your API.
    // For production, you might want to restrict this to specific domains.
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    return response;
  }

  // For all other routes, do nothing.
  return NextResponse.next();
}

// This config ensures this middleware only runs on your API routes.
export const config = {
  matcher: "/api/:path*",
};
