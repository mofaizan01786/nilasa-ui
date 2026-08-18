import { NextRequest, NextResponse } from "next/server";
import https from "https";

// Create an HTTPS agent that accepts local development self-signed certs (e.g., IIS Express localhost:44324)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// Backend API Base URL from environment
const BACKEND_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";

async function proxyRequest(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND_BASE}/${pathStr}${search}`;

  try {
    const headers = new Headers(req.headers);
    // Remove host/connection to avoid mismatched Host headers
    headers.delete("host");
    headers.delete("connection");

    const method = req.method;
    let body: BodyInit | undefined = undefined;

    if (method !== "GET" && method !== "HEAD") {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        body = await req.text();
      } else {
        // For multipart/form-data or binary uploads, forward raw ArrayBuffer
        // This ensures the original multipart boundary header matches the payload stream 100%
        body = await req.arrayBuffer();
      }
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      body,
      // @ts-expect-error Node.js https agent for self-signed development certs
      agent: targetUrl.startsWith("https://") ? httpsAgent : undefined,
    };

    // Node 18+ global fetch with dispatcher / agent
    if (process.env.NODE_ENV !== "production") {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const backendRes = await fetch(targetUrl, fetchOptions);

    const resHeaders = new Headers();
    backendRes.headers.forEach((val, key) => {
      if (!["transfer-encoding", "content-encoding"].includes(key.toLowerCase())) {
        resHeaders.set(key, val);
      }
    });

    // HTTP 204 (No Content), 205 (Reset Content), and 304 (Not Modified) MUST NOT have a response body
    if ([204, 205, 304].includes(backendRes.status)) {
      return new NextResponse(null, {
        status: backendRes.status,
        statusText: backendRes.statusText,
        headers: resHeaders,
      });
    }

    const responseBody = await backendRes.arrayBuffer();

    return new NextResponse(responseBody, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: resHeaders,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[API Proxy Error] Failed to proxy ${req.method} ${targetUrl}:`, errorMsg);
    return NextResponse.json(
      {
        error: "Backend API Proxy Failure",
        targetUrl,
        message: errorMsg,
      },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const HEAD = proxyRequest;
