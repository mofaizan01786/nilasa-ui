"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

function getClientToken(): string | null {
  if (typeof window === "undefined") return null;
  const local = window.localStorage.getItem("nilasa-auth-token");
  if (local && local !== "undefined" && local !== "null" && local.trim() !== "") {
    return local;
  }
  const match = document.cookie.match(/(?:^|;\s*)nilasa_session=([^;]*)/);
  if (match && match[1] && match[1] !== "undefined" && match[1] !== "null" && match[1].trim() !== "") {
    return decodeURIComponent(match[1]);
  }
  return null;
}

function parseClientRole(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const userStr = window.localStorage.getItem("nilasa-user");
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u && u.role) return u.role;
    }
  } catch {
    // fallback
  }

  const token = getClientToken();
  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length >= 2) {
        const payloadJson = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
        const payload = JSON.parse(payloadJson);
        return (
          payload.role ||
          payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
          payload["Role"] ||
          null
        );
      }
    } catch {
      // fallback
    }
  }
  return null;
}

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setIsAuthenticated(true);
      return;
    }

    const token = getClientToken();
    const role = parseClientRole();

    if (!token) {
      setIsAuthenticated(false);
      router.replace(`/admin/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    // STRICT CHECK: Reject non-Admin accounts (e.g. Customer role)
    if (role && role.trim().toLowerCase() !== "admin") {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("nilasa-auth-token");
        window.localStorage.removeItem("nilasa-user");
        document.cookie = "nilasa_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "nilasa_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      setIsAuthenticated(false);
      router.replace(`/admin/login?error=AccessDenied`);
      return;
    }

    setIsAuthenticated(true);
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isAuthenticated !== true) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--admin-surface, #F8FAFC)",
          color: "var(--admin-slate-600, #475569)",
          fontFamily: "var(--font-body, sans-serif)",
          fontSize: "14px",
          gap: "14px"
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "3px solid #E2E8F0",
            borderTopColor: "#B87078",
            animation: "adminAuthSpin 0.8s linear infinite"
          }}
        />
        <span style={{ fontWeight: 600, color: "#683840" }}>
          Verifying Administrator permissions...
        </span>
        <style>{`
          @keyframes adminAuthSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
