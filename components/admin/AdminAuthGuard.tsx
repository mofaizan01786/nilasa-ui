"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // On login page, render directly
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Once mounted, render children (middleware.ts already validates the session cookie on the server)
  if (!isMounted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--admin-surface)",
          color: "var(--admin-slate-600)",
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          gap: "8px"
        }}
      >
        <span className="status-dot" style={{ background: "var(--admin-accent)" }} />
        <span>Loading Nilasa Portal...</span>
      </div>
    );
  }

  return <>{children}</>;
}
