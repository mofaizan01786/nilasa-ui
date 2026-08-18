import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply to all /admin routes
  if (pathname.startsWith("/admin")) {
    // Allow /admin/login freely
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const sessionToken = request.cookies.get("nilasa_session")?.value;

    // If visiting protected admin route without session cookie, redirect to /admin/login
    if (!sessionToken) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
