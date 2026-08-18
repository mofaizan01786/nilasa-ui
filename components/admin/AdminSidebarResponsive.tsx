"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminNavClient } from "./AdminNavClient";
import { AdminLogoutButton } from "./AdminLogoutButton";
import { ExternalLink, Menu, X, ShieldCheck } from "lucide-react";

export function AdminSidebarResponsive() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header Bar (<= 1024px) */}
      <header className="admin-mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Image
            src="/nilasa-black-logo.PNG"
            alt="Nilasa"
            width={90}
            height={28}
            style={{ height: "26px", width: "auto", objectFit: "contain" }}
          />
          <span className="admin-badge-control">CONTROL</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              className="status-badge status-badge--published"
              style={{ fontSize: "10px", padding: "2px 6px" }}
            >
              <span className="status-dot" />
              <span>Live</span>
            </span>

            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "var(--admin-accent)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: "10px"
              }}
              title="Staff Admin"
            >
              NA
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="admin-mobile-menu-toggle"
            aria-label="Open Navigation Menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="admin-mobile-backdrop"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <aside
        className={`admin-sidebar-nav ${mobileOpen ? "mobile-open" : ""}`}
      >
        <div className="admin-sidebar-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <Image
              src="/nilasa-black-logo.PNG"
              alt="Nilasa"
              width={120}
              height={38}
              style={{ height: "32px", width: "auto", objectFit: "contain" }}
            />
            <div>
              <span className="admin-sidebar-title" style={{ fontSize: "12px", letterSpacing: "0.05em" }}>CONTROL</span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="admin-mobile-close"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        <div onClick={() => setMobileOpen(false)} style={{ flex: 1, overflowY: "auto" }}>
          <AdminNavClient />
        </div>

        <div style={{ marginTop: "auto", padding: "14px 16px", borderTop: "1px solid var(--admin-slate-200)" }}>
          <Link
            href="/"
            target="_blank"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "var(--admin-slate-600)",
              fontSize: "12px",
              marginBottom: 10,
              textDecoration: "none"
            }}
          >
            <ExternalLink size={13} strokeWidth={1.75} />
            <span>Public Storefront</span>
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>
    </>
  );
}
