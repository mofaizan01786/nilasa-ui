import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    // Proxy login to the real backend
    const backendUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";

    try {
      const res = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();

        // Backend returns { accessToken, refreshToken, expiresAt, userId, name, email, role }
        const token = data.accessToken || data.token;

        // Set httpOnly session cookie with the real JWT (secure: false allows http:// domain access)
        const cookieStore = await cookies();
        cookieStore.set("nilasa_session", token, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/"
        });

        return NextResponse.json({
          success: true,
          accessToken: token,
          refreshToken: data.refreshToken,
          user: { id: data.userId, name: data.name, email: data.email, role: data.role }
        });
      } else {
        const errData = await res.json().catch(() => ({}));
        return NextResponse.json(
          { message: errData.message || "Invalid credentials" },
          { status: res.status }
        );
      }
    } catch {
      // Backend offline — allow dev fallback
      if (process.env.NODE_ENV === "development") {
        const devToken = `nilasa_dev_${Date.now()}`;
        const cookieStore = await cookies();
        cookieStore.set("nilasa_session", devToken, {
          httpOnly: true, secure: false, sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, path: "/"
        });
        return NextResponse.json({
          success: true,
          accessToken: devToken,
          user: { id: 1, name: "Dev Admin", email, role: "Admin" }
        });
      }
      return NextResponse.json({ message: "Backend unreachable" }, { status: 503 });
    }
  } catch {
    return NextResponse.json({ message: "Internal Auth Error" }, { status: 500 });
  }
}
