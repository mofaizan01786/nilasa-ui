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
    if (!sessionToken || sessionToken === "undefined" || sessionToken === "null" || sessionToken.trim() === "") {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role check from JWT payload
    try {
      const parts = sessionToken.split(".");
      if (parts.length >= 2) {
        const payloadJson = Buffer.from(parts[1], "base64").toString("utf8");
        const payload = JSON.parse(payloadJson);
        const role =
          payload.role ||
          payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
          payload["Role"];
        if (role && String(role).trim().toLowerCase() !== "admin") {
          const loginUrl = new URL("/admin/login", request.url);
          loginUrl.searchParams.set("error", "AccessDenied");
          const res = NextResponse.redirect(loginUrl);
          res.cookies.delete("nilasa_session");
          res.cookies.delete("nilasa_role");
          return res;
        }
      }
    } catch {
      // ignore
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
