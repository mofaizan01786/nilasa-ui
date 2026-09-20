"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminNavClient } from "./AdminNavClient";
import { useAdminTheme } from "./AdminThemeProvider";
import { Menu, X, Sun, Moon, Palette, Sparkles, Check, Radio } from "lucide-react";

export function AdminSidebarResponsive() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, toggleMode, toggleCustomizer } = useAdminTheme();

  return (
    <>
      {/* Mobile Top Header Bar (<= 1024px) */}
      <header className="admin-mobile-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="admin-icon-btn"
            aria-label="Open Navigation Menu"
            style={{ width: 34, height: 34 }}
          >
            <Menu size={18} />
          </button>

          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: "var(--admin-primary)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "12px",
                fontFamily: "var(--font-display)"
              }}
            >
              N
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  fontFamily: "var(--font-display)",
                  color: "var(--admin-primary)",
                  lineHeight: 1
                }}
              >
                NILASA
              </span>
              <span style={{ fontSize: "8px", letterSpacing: "0.14em", color: "var(--admin-text-muted)", textTransform: "uppercase" }}>
                ATELIER
              </span>
            </div>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={toggleMode}
            className="admin-icon-btn"
            aria-label="Toggle Ambiance"
            style={{ width: 32, height: 32 }}
          >
            {mode === "day" ? <Moon size={15} /> : <Sun size={15} color="#E9C46A" />}
          </button>

          <button
            type="button"
            onClick={toggleCustomizer}
            className="admin-icon-btn"
            aria-label="Open Theme Customizer"
            style={{ width: 32, height: 32 }}
          >
            <Palette size={15} />
          </button>

          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--admin-primary-soft)",
              color: "var(--admin-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "10px",
              border: "1px solid var(--admin-border-strong)"
            }}
          >
            AR
          </div>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="admin-mobile-backdrop"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <aside className={`admin-sidebar-nav ${mobileOpen ? "mobile-open" : ""}`}>
        <div>
          {/* Brand Header */}
          <div className="admin-sidebar-header">
            <Link href="/admin" className="admin-sidebar-brand">
              <div className="admin-atelier-stamp">
                <span style={{ fontSize: "17px", fontWeight: 800, fontFamily: "var(--font-display)" }}>N</span>
              </div>
              <div className="admin-sidebar-title-block">
                <span className="admin-sidebar-title">NILASA</span>
                <span className="admin-sidebar-subtitle">ATELIER COMMERCE</span>
              </div>
            </Link>

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

          {/* Navigation Links */}
          <AdminNavClient onItemClick={() => setMobileOpen(false)} />
        </div>

        {/* Bottom Luxury Loom Card (Matching reference design) */}
        <div className="admin-sidebar-loom-card">
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#E9C46A",
                boxShadow: "0 0 8px #E9C46A"
              }}
            />
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.85)",
                textTransform: "uppercase"
              }}
            >
              FESTIVE EDITION 2026
            </span>
          </div>

          <h4
            style={{
              margin: "0 0 10px 0",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "var(--font-display)",
              color: "#FFFFFF",
              lineHeight: 1.2
            }}
          >
            Jaipur & Delhi Ateliers
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11px", color: "rgba(255,255,255,0.9)" }}>
              <span style={{ color: "#E9C46A", fontWeight: 800 }}>✓</span>
              <span>8 Karigars Active</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11px", color: "rgba(255,255,255,0.9)" }}>
              <span style={{ color: "#E9C46A", fontWeight: 800 }}>✓</span>
              <span>99.4% Zari Quality Pass</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11px", color: "rgba(255,255,255,0.9)" }}>
              <span style={{ color: "#E9C46A", fontWeight: 800 }}>✓</span>
              <span>Direct Loom Live Feed</span>
            </div>
          </div>

          <Link
            href="/admin/banners"
            onClick={() => setMobileOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              padding: "8px 14px",
              borderRadius: 999,
              background: "#FFFFFF",
              color: "var(--admin-primary)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.02em",
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              transition: "transform 0.15s ease"
            }}
          >
            View Loom Live
          </Link>
        </div>
      </aside>
    </>
  );
}
