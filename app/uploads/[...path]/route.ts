import { NextRequest, NextResponse } from "next/server";
import https from "https";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const rawStorage = process.env.STORAGE_URL || process.env.NEXT_PUBLIC_STORAGE_URL;
const rawApiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";
const BACKEND_BASE = rawStorage ? rawStorage.replace(/\/+$/, "") : rawApiUrl.replace(/\/api\/v1\/?$/, "").replace(/\/api\/?$/, "").replace(/\/+$/, "");

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");
  const targetUrl = `${BACKEND_BASE}/uploads/${pathStr}`;

  try {
    if (process.env.NODE_ENV !== "production") {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const res = await fetch(targetUrl, {
      // @ts-expect-error Node https agent for self-signed certs
      agent: targetUrl.startsWith("https://") ? httpsAgent : undefined,
    });

    if (!res.ok) {
      return new NextResponse("Image Not Found", { status: 404 });
    }

    const contentType = res.headers.get("content-type") || "image/webp";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.warn("[Uploads Proxy] Error fetching", targetUrl, err);
    return new NextResponse("Error fetching image", { status: 502 });
  }
}
