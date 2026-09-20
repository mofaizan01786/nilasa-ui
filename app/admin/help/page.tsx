"use client";

import React from "react";
import {
  HelpCircle,
  BookOpen,
  MessageSquare,
  Sparkles,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

export default function AdminHelpPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "var(--admin-primary)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <HelpCircle size={18} />
          </div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 600,
              fontFamily: "var(--font-display)",
              color: "var(--admin-text-main)",
              margin: 0
            }}
          >
            Atelier Concierge & Help Center
          </h1>
        </div>
        <p style={{ fontSize: "12.5px", color: "var(--admin-text-muted)", margin: "4px 0 0" }}>
          Documentation, operational guidelines, and master artisan support for Nilasa Atelier Commerce.
        </p>
      </div>

      {/* Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
        <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--admin-primary-soft)", color: "var(--admin-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookOpen size={18} />
          </div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--admin-text-main)" }}>
            Atelier User Manual
          </h3>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--admin-text-muted)", lineHeight: 1.45 }}>
            Learn how to manage multi-slide hero banners, order statuses, coupon codes, and live loom inventory.
          </p>
        </div>

        <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--admin-primary-soft)", color: "var(--admin-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MessageSquare size={18} />
          </div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--admin-text-main)" }}>
            Patron Concierge Inquiries
          </h3>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--admin-text-muted)", lineHeight: 1.45 }}>
            Direct support line for custom bespoke fitting, saree fall bidding, and urgent international DHL deliveries.
          </p>
        </div>

        <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--admin-primary-soft)", color: "var(--admin-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={18} />
          </div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--admin-text-main)" }}>
            Zari Quality Assurance
          </h3>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--admin-text-muted)", lineHeight: 1.45 }}>
            Handbook on certified pure silk testing, natural dyes verification, and ethical karigar craftsmanship.
          </p>
        </div>
      </div>
    </div>
  );
}
