"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AdminSidebarResponsive } from "./AdminSidebarResponsive";
import { AdminAuthGuard } from "./AdminAuthGuard";
import { AdminThemeProvider, useAdminTheme } from "./AdminThemeProvider";
import { AdminThemeCustomizerDrawer } from "./AdminThemeCustomizerDrawer";
import {
  Search,
  Bell,
  MessageSquare,
  Palette,
  Sun,
  Moon,
  ChevronDown,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Sliders,
  Settings,
  LogOut
} from "lucide-react";

function AdminTopHeader() {
  const pathname = usePathname();
  const { mode, toggleMode, toggleCustomizer, searchQuery, setSearchQuery } = useAdminTheme();
  const [profileOpen, setProfileOpen] = useState(false);

  // Derive human-friendly title based on route
  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
    if (pathname.startsWith("/admin/orders")) return "Orders & Shipments";
    if (pathname.startsWith("/admin/products")) return "Products & Collections";
    if (pathname.startsWith("/admin/categories")) return "Categories & Taxonomies";
    if (pathname.startsWith("/admin/navigation")) return "Navigation Hierarchy";
    if (pathname.startsWith("/admin/banners")) return "Promotions & Banners";
    if (pathname.startsWith("/admin/coupons")) return "Discounts & Offers";
    if (pathname.startsWith("/admin/users")) return "Patrons & VIPs";
    if (pathname.startsWith("/admin/settings")) return "Atelier Settings";
    return "Atelier Control";
  };

  return (
    <header className="admin-desktop-top-header">
      {/* Left: Page Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <h1
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: 600,
            fontFamily: "var(--font-display)",
            color: "var(--admin-text-main)",
            letterSpacing: "-0.01em"
          }}
        >
          {getPageTitle()}
        </h1>
      </div>

      {/* Middle: Luxury Pill Search */}
      <div className="admin-search-pill">
        <Search size={16} color="var(--admin-text-light)" style={{ flexShrink: 0 }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search stock, SKU, order, artisan..."
          aria-label="Search"
        />
      </div>

      {/* Right Actions: Notifications, Theme, Profile */}
      <div className="admin-header-actions">
        {/* Day / Night Ambiance Toggle */}
        <button
          type="button"
          onClick={toggleMode}
          className="admin-icon-btn"
          aria-label={mode === "day" ? "Switch to Luxury Noir Night" : "Switch to Atelier Day"}
          title={mode === "day" ? "Switch to Luxury Noir Night" : "Switch to Atelier Day"}
        >
          {mode === "day" ? <Moon size={17} /> : <Sun size={17} color="#E9C46A" />}
        </button>

        {/* Theme Palette Studio Button */}
        <button
          type="button"
          onClick={toggleCustomizer}
          className="admin-icon-btn"
          aria-label="Theme Customizer"
          title="Open Atelier Theme Studio"
        >
          <Palette size={17} />
        </button>

        {/* Notifications Icon Button */}
        <button
          type="button"
          className="admin-icon-btn"
          aria-label="Notifications"
          title="Atelier Notifications (2 New)"
        >
          <Bell size={17} />
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 9,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--admin-primary)",
              border: "1.5px solid var(--admin-card-bg)"
            }}
          />
        </button>

        {/* Message / Live Chat Icon Button */}
        <button
          type="button"
          className="admin-icon-btn"
          aria-label="Atelier Concierge Messages"
          title="Patron Concierge Inquiries"
        >
          <MessageSquare size={17} />
        </button>

        {/* User Profile Pill (Ananya Roy / Head of Atelier) */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => setProfileOpen(!profileOpen)}
            className="admin-user-profile-pill"
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--admin-primary-soft)",
                color: "var(--admin-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "12px",
                border: "1px solid var(--admin-border-strong)"
              }}
            >
              AR
            </div>
            <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--admin-text-main)", lineHeight: 1.2 }}>
                Ananya Roy
              </span>
              <span style={{ fontSize: "10px", color: "var(--admin-text-muted)", lineHeight: 1.1 }}>
                Head of Atelier
              </span>
            </div>
            <ChevronDown size={14} color="var(--admin-text-light)" style={{ marginLeft: 2 }} />
          </div>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: 200,
                background: "var(--admin-card-bg)",
                border: "1px solid var(--admin-border-subtle)",
                borderRadius: 14,
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                padding: 6,
                zIndex: 100,
                display: "flex",
                flexDirection: "column",
                gap: 2
              }}
            >
              <Link
                href="/admin/settings"
                onClick={() => setProfileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 8,
                  color: "var(--admin-text-main)",
                  fontSize: "12px",
                  textDecoration: "none",
                  fontWeight: 500
                }}
              >
                <Settings size={15} />
                <span>Atelier Settings</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  toggleCustomizer();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 8,
                  color: "var(--admin-text-main)",
                  fontSize: "12px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  fontWeight: 500
                }}
              >
                <Palette size={15} />
                <span>Theme Studio</span>
              </button>

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 8,
                  color: "var(--admin-text-main)",
                  fontSize: "12px",
                  textDecoration: "none",
                  fontWeight: 500
                }}
              >
                <ExternalLink size={15} />
                <span>View Live Storefront</span>
              </a>

              <div style={{ height: 1, background: "var(--admin-border-subtle)", margin: "4px 0" }} />

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("nilasa-auth-token");
                    localStorage.removeItem("nilasa-auth-user");
                    document.cookie = "nilasa_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    document.cookie = "nilasa_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    window.location.href = "/admin/login";
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 8,
                  color: "#C4392B",
                  fontSize: "12px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  fontWeight: 500
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
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
          background: "var(--admin-surface-bg)",
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
          <AdminTopHeader />
          <main className="admin-content-area">{children}</main>
        </div>

        {/* Interactive Theme Customizer Drawer */}
        <AdminThemeCustomizerDrawer />
      </div>
    </AdminAuthGuard>
  );
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminThemeProvider>
  );
}
