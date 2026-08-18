"use client";

import { usePathname } from "next/navigation";
import { AdminSidebarResponsive } from "./AdminSidebarResponsive";
import { AdminAuthGuard } from "./AdminAuthGuard";
import { ShieldCheck } from "lucide-react";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--admin-surface)",
          padding: "24px 16px"
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <AdminAuthGuard>
      <div className="admin-body">
        {/* Responsive Left Sidebar Navigation */}
        <AdminSidebarResponsive />

        {/* Main Admin Workspace Area with Top Bar */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <header
            className="admin-desktop-top-header"
            style={{
              height: 52,
              background: "#FFFFFF",
              borderBottom: "1px solid var(--admin-slate-200)",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                className="status-badge status-badge--published"
                style={{ fontSize: "11px" }}
              >
                <span className="status-dot" />
                <span>Production Live</span>
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--admin-accent)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: "11px",
                    letterSpacing: "0.04em"
                  }}
                >
                  NA
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)" }}>Staff Admin</span>
                    <ShieldCheck size={12} color="var(--status-published)" />
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--admin-slate-600)" }}>admin@nilasa.com</span>
                </div>
              </div>
            </div>
          </header>

          <main className="admin-content-area">{children}</main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
