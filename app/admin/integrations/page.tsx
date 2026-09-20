"use client";

import React, { useState } from "react";
import {
  Puzzle,
  CreditCard,
  Truck,
  MessageSquare,
  Video,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Power,
  RefreshCw,
  Sparkles,
  Lock
} from "lucide-react";

interface IntegrationItem {
  id: string;
  name: string;
  category: "Payments" | "Logistics" | "Loom & Video" | "Messaging";
  description: string;
  icon: any;
  status: "Connected" | "Configured" | "Available";
  badgeColor: string;
  apiKeySet: boolean;
}

const INTEGRATIONS: IntegrationItem[] = [
  {
    id: "razorpay",
    name: "Razorpay Payments & UPI",
    category: "Payments",
    description: "Accept cards, NetBanking, UPI, and EMI for bespoke luxury orders.",
    icon: CreditCard,
    status: "Connected",
    badgeColor: "#2E7D32",
    apiKeySet: true
  },
  {
    id: "dhl",
    name: "DHL Express & Shiprocket",
    category: "Logistics",
    description: "Automated air courier dispatch and real-time patron parcel tracking.",
    icon: Truck,
    status: "Connected",
    badgeColor: "#2E7D32",
    apiKeySet: true
  },
  {
    id: "loom_feed",
    name: "Jaipur Loom Live Feed",
    category: "Loom & Video",
    description: "Direct real-time RTSP/HLS stream from the master weaver Karigar workstations.",
    icon: Video,
    status: "Configured",
    badgeColor: "#C69244",
    apiKeySet: true
  },
  {
    id: "whatsapp",
    name: "WhatsApp VIP Concierge API",
    category: "Messaging",
    description: "Direct 1-on-1 stylist order confirmation and personalized fitting updates.",
    icon: MessageSquare,
    status: "Available",
    badgeColor: "#7D6E70",
    apiKeySet: false
  }
];

export default function AdminIntegrationsPage() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleStatus = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === "Connected" ? "Available" : "Connected";
          return { ...item, status: nextStatus, badgeColor: nextStatus === "Connected" ? "#2E7D32" : "#7D6E70" };
        }
        return item;
      })
    );
    setToastMessage("Integration status updated!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filtered = integrations.filter((item) => {
    if (activeFilter === "ALL") return true;
    return item.category === activeFilter;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1100, margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
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
              <Puzzle size={18} />
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
              Atelier Integrations & Connected Services
            </h1>
          </div>
          <p style={{ fontSize: "12.5px", color: "var(--admin-text-muted)", margin: "4px 0 0" }}>
            Manage payment gateways, logistics partners, live loom video feeds, and patron messaging channels.
          </p>
        </div>
      </div>

      {toastMessage && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            background: "#E8F5E9",
            color: "#1E6B24",
            fontSize: "12.5px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid #C8E6C9"
          }}
        >
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="admin-tabs-scroll-wrapper" style={{ marginBottom: 0 }}>
        {["ALL", "Payments", "Logistics", "Loom & Video", "Messaging"].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveFilter(cat)}
            style={{
              padding: "8px 16px",
              border: "none",
              borderBottom: activeFilter === cat ? "2.5px solid var(--admin-primary)" : "2.5px solid transparent",
              background: "transparent",
              color: activeFilter === cat ? "var(--admin-primary)" : "var(--admin-text-muted)",
              fontWeight: activeFilter === cat ? 700 : 500,
              fontSize: "13px",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 18
        }}
      >
        {filtered.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="admin-luxury-card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 16
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "var(--admin-primary-soft)",
                      color: "var(--admin-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Icon size={20} />
                  </div>

                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 999,
                      fontSize: "11px",
                      fontWeight: 700,
                      background: item.status === "Connected" ? "#E8F5E9" : item.status === "Configured" ? "#FFF8E7" : "var(--admin-surface-bg)",
                      color: item.status === "Connected" ? "#1E6B24" : item.status === "Configured" ? "#8A5620" : "var(--admin-text-muted)",
                      border: "1px solid var(--admin-border-subtle)"
                    }}
                  >
                    ● {item.status}
                  </span>
                </div>

                <h3
                  style={{
                    margin: "0 0 6px 0",
                    fontSize: "16px",
                    fontWeight: 600,
                    fontFamily: "var(--font-display)",
                    color: "var(--admin-text-main)"
                  }}
                >
                  {item.name}
                </h3>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--admin-text-muted)", lineHeight: 1.45 }}>
                  {item.description}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 14,
                  borderTop: "1px solid var(--admin-border-subtle)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11px", color: "var(--admin-text-muted)" }}>
                  <Lock size={12} />
                  <span>{item.apiKeySet ? "API Key Active" : "No Keys Set"}</span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleStatus(item.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    border: "1px solid var(--admin-border-subtle)",
                    background: item.status === "Connected" ? "var(--admin-primary-soft)" : "var(--admin-card-bg)",
                    color: "var(--admin-primary)",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  {item.status === "Connected" ? "Manage" : "Connect"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
