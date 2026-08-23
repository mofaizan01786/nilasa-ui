"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { BannersConfig } from "@/lib/types";
import { fetchBannersConfig, saveBannersConfig } from "@/lib/dotnet-backend";
import {
  Sparkles,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Tag,
  Megaphone,
  Layers,
  Image as ImageIcon,
  ArrowRight,
  Copy
} from "lucide-react";

export default function AdminBannersPage() {
  const [config, setConfig] = useState<BannersConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"announcement" | "hero" | "offer">("announcement");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await fetchBannersConfig();
      if (data) {
        setConfig(data);
      }
    } catch {
      setStatusMessage("Failed to load banners configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!config) return;
    setSaving(true);
    setSaveStatus("idle");
    setStatusMessage("");

    const res = await saveBannersConfig(config);
    setSaving(false);

    if (res.success) {
      setSaveStatus("success");
      setStatusMessage("Banners and promotional offers updated successfully! Storefront reflects changes.");
      setTimeout(() => setSaveStatus("idle"), 4000);
    } else {
      setSaveStatus("error");
      setStatusMessage(res.error || "Failed to save banners.");
    }
  };

  // Announcement message helpers
  const handleAddMessage = () => {
    if (!newMessage.trim() || !config) return;
    const messages = [...(config.announcementBar.messages || []), newMessage.trim()];
    setConfig({
      ...config,
      announcementBar: { ...config.announcementBar, messages }
    });
    setNewMessage("");
  };

  const handleDeleteMessage = (idx: number) => {
    if (!config) return;
    const messages = config.announcementBar.messages.filter((_, i) => i !== idx);
    setConfig({
      ...config,
      announcementBar: { ...config.announcementBar, messages }
    });
  };

  if (loading || !config) {
    return (
      <div style={{ padding: "32px", color: "var(--admin-slate-600)" }}>
        <p>Loading banners & promotional offers configuration...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={22} color="var(--admin-accent)" />
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--admin-ink)",
                margin: 0
              }}
            >
              Dynamic Banners & Promotional Offers
            </h1>
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "var(--admin-slate-600)",
              margin: "4px 0 0"
            }}
          >
            Manage the top announcement bar, homepage hero banner, and promotional coupon cards.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "9px 20px",
            borderRadius: "6px",
            border: "none",
            background: "var(--admin-accent)",
            color: "#FFFFFF",
            fontSize: "12px",
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
            boxShadow: "0 2px 8px rgba(59, 76, 122, 0.25)"
          }}
        >
          <Save size={14} />
          <span>{saving ? "Saving..." : "Save All Banners"}</span>
        </button>
      </div>

      {/* Notification Toast */}
      {saveStatus === "success" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
            color: "#065F46",
            padding: "10px 14px",
            borderRadius: "6px",
            fontSize: "12px",
            marginBottom: "20px"
          }}
        >
          <CheckCircle2 size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {saveStatus === "error" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#991B1B",
            padding: "10px 14px",
            borderRadius: "6px",
            fontSize: "12px",
            marginBottom: "20px"
          }}
        >
          <AlertCircle size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Navigation Tabs for Banners */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--admin-slate-200)",
          marginBottom: "24px"
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("announcement")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            border: "none",
            borderBottom: activeTab === "announcement" ? "2px solid var(--admin-accent)" : "2px solid transparent",
            background: "transparent",
            color: activeTab === "announcement" ? "var(--admin-accent)" : "var(--admin-slate-600)",
            fontWeight: activeTab === "announcement" ? 700 : 500,
            fontSize: "13px",
            cursor: "pointer"
          }}
        >
          <Megaphone size={15} />
          <span>1. Top Announcement Bar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            border: "none",
            borderBottom: activeTab === "hero" ? "2px solid var(--admin-accent)" : "2px solid transparent",
            background: "transparent",
            color: activeTab === "hero" ? "var(--admin-accent)" : "var(--admin-slate-600)",
            fontWeight: activeTab === "hero" ? 700 : 500,
            fontSize: "13px",
            cursor: "pointer"
          }}
        >
          <ImageIcon size={15} />
          <span>2. Hero Banner & Imagery</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("offer")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            border: "none",
            borderBottom: activeTab === "offer" ? "2px solid var(--admin-accent)" : "2px solid transparent",
            background: "transparent",
            color: activeTab === "offer" ? "var(--admin-accent)" : "var(--admin-slate-600)",
            fontWeight: activeTab === "offer" ? 700 : 500,
            fontSize: "13px",
            cursor: "pointer"
          }}
        >
          <Tag size={15} />
          <span>3. Mid-Page Promotional Offer</span>
        </button>
      </div>

      {/* TAB 1: Announcement Bar Settings */}
      {activeTab === "announcement" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px", alignItems: "flex-start" }}>
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--admin-slate-200)",
              borderRadius: "10px",
              padding: "24px"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                borderBottom: "1px solid var(--admin-slate-200)",
                paddingBottom: "12px"
              }}
            >
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--admin-ink)", margin: 0 }}>
                Top Announcement Bar Config
              </h3>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={config.announcementBar.isActive}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      announcementBar: { ...config.announcementBar, isActive: e.target.checked }
                    })
                  }
                />
                <span>Enable Bar</span>
              </label>
            </div>

            {/* Messages List */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "8px" }}>
                Announcement Messages
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "10px" }}>
                {config.announcementBar.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "#F8FAFC",
                      borderRadius: "6px",
                      border: "1px solid var(--admin-slate-200)",
                      fontSize: "12px"
                    }}
                  >
                    <span>{msg}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(idx)}
                      style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: "2px" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Message Form */}
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Add new announcement message (e.g. FREE SHIPPING OVER ₹2,999)"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--admin-slate-300)",
                    fontSize: "12px"
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddMessage}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "6px",
                    border: "1px solid var(--admin-slate-300)",
                    background: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Coupon Settings */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                  Promo Coupon Code
                </label>
                <input
                  type="text"
                  value={config.announcementBar.couponCode || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      announcementBar: { ...config.announcementBar, couponCode: e.target.value.toUpperCase() }
                    })
                  }
                  placeholder="e.g. NILASA10"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--admin-slate-300)",
                    fontSize: "12px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                  Discount Text
                </label>
                <input
                  type="text"
                  value={config.announcementBar.couponDiscount || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      announcementBar: { ...config.announcementBar, couponDiscount: e.target.value }
                    })
                  }
                  placeholder="e.g. 10% OFF"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--admin-slate-300)",
                    fontSize: "12px"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--admin-slate-200)",
              borderRadius: "10px",
              padding: "20px"
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-slate-600)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "12px" }}>
              Live Storefront Preview
            </span>
            <div
              style={{
                background: "#151D30",
                color: "#FAF7F2",
                padding: "8px 14px",
                borderRadius: "6px",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                textAlign: "center",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                border: "1px solid rgba(212, 178, 88, 0.3)"
              }}
            >
              {config.announcementBar.messages.join(" • ")}
              {config.announcementBar.couponCode && ` • USE CODE ${config.announcementBar.couponCode} FOR ${config.announcementBar.couponDiscount || ""}`}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Hero Banner Settings */}
      {activeTab === "hero" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px", alignItems: "flex-start" }}>
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--admin-slate-200)",
              borderRadius: "10px",
              padding: "24px"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                borderBottom: "1px solid var(--admin-slate-200)",
                paddingBottom: "12px"
              }}
            >
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--admin-ink)", margin: 0 }}>
                Hero Banner Settings
              </h3>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={config.heroBanner.isActive}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      heroBanner: { ...config.heroBanner, isActive: e.target.checked }
                    })
                  }
                />
                <span>Enable Hero Banner</span>
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                  Eyebrow Tag (e.g. FESTIVE EDIT 2026)
                </label>
                <input
                  type="text"
                  value={config.heroBanner.eyebrow}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      heroBanner: { ...config.heroBanner, eyebrow: e.target.value.toUpperCase() }
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--admin-slate-300)",
                    fontSize: "12px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                  Secondary Tag Pill
                </label>
                <input
                  type="text"
                  value={config.heroBanner.tagPill}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      heroBanner: { ...config.heroBanner, tagPill: e.target.value }
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--admin-slate-300)",
                    fontSize: "12px"
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                Main Headline
              </label>
              <input
                type="text"
                value={config.heroBanner.headline}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    heroBanner: { ...config.heroBanner, headline: e.target.value }
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--admin-slate-300)",
                  fontSize: "13px"
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                Hero Description
              </label>
              <textarea
                rows={3}
                value={config.heroBanner.description}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    heroBanner: { ...config.heroBanner, description: e.target.value }
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--admin-slate-300)",
                  fontSize: "12px"
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                  Primary CTA Label & Link
                </label>
                <div style={{ display: "flex", gap: "6px" }}>
                  <input
                    type="text"
                    value={config.heroBanner.primaryCta?.label || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        heroBanner: {
                          ...config.heroBanner,
                          primaryCta: { ...config.heroBanner.primaryCta, label: e.target.value }
                        }
                      })
                    }
                    style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid var(--admin-slate-300)", fontSize: "12px" }}
                  />
                  <input
                    type="text"
                    value={config.heroBanner.primaryCta?.href || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        heroBanner: {
                          ...config.heroBanner,
                          primaryCta: { ...config.heroBanner.primaryCta, href: e.target.value }
                        }
                      })
                    }
                    style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid var(--admin-slate-300)", fontSize: "12px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                  Secondary CTA Label & Link
                </label>
                <div style={{ display: "flex", gap: "6px" }}>
                  <input
                    type="text"
                    value={config.heroBanner.secondaryCta?.label || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        heroBanner: {
                          ...config.heroBanner,
                          secondaryCta: {
                            label: e.target.value,
                            href: config.heroBanner.secondaryCta?.href || "/category/suits"
                          }
                        }
                      })
                    }
                    style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid var(--admin-slate-300)", fontSize: "12px" }}
                  />
                  <input
                    type="text"
                    value={config.heroBanner.secondaryCta?.href || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        heroBanner: {
                          ...config.heroBanner,
                          secondaryCta: {
                            label: config.heroBanner.secondaryCta?.label || "View Suit Sets",
                            href: e.target.value
                          }
                        }
                      })
                    }
                    style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid var(--admin-slate-300)", fontSize: "12px" }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                Hero Image URL
              </label>
              <input
                type="text"
                value={config.heroBanner.imageUrl}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    heroBanner: { ...config.heroBanner, imageUrl: e.target.value }
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--admin-slate-300)",
                  fontSize: "12px"
                }}
              />
            </div>
          </div>

          {/* Hero Preview */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--admin-slate-200)",
              borderRadius: "10px",
              padding: "20px"
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-slate-600)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "12px" }}>
              Hero Image Preview
            </span>
            <div style={{ position: "relative", height: "240px", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--admin-slate-200)" }}>
              <Image
                src={config.heroBanner.imageUrl || "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=80"}
                alt="Hero Preview"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div style={{ marginTop: "14px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--nilasa-gold)" }}>{config.heroBanner.eyebrow}</span>
              <h4 style={{ fontSize: "16px", margin: "4px 0 6px", color: "var(--admin-ink)" }}>{config.heroBanner.headline}</h4>
              <p style={{ fontSize: "12px", color: "var(--admin-slate-600)", margin: 0 }}>{config.heroBanner.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Mid-Page Promotional Offer Banner Settings */}
      {activeTab === "offer" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px", alignItems: "flex-start" }}>
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--admin-slate-200)",
              borderRadius: "10px",
              padding: "24px"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                borderBottom: "1px solid var(--admin-slate-200)",
                paddingBottom: "12px"
              }}
            >
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--admin-ink)", margin: 0 }}>
                Mid-Page Promotional Offer Banner
              </h3>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={config.promotionalOfferBanner.isActive}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      promotionalOfferBanner: { ...config.promotionalOfferBanner, isActive: e.target.checked }
                    })
                  }
                />
                <span>Enable Offer Card</span>
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                  Badge Pill (e.g. LIMITED TIME OFFER)
                </label>
                <input
                  type="text"
                  value={config.promotionalOfferBanner.badge}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      promotionalOfferBanner: { ...config.promotionalOfferBanner, badge: e.target.value.toUpperCase() }
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--admin-slate-300)",
                    fontSize: "12px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                  Copyable Coupon Code
                </label>
                <input
                  type="text"
                  value={config.promotionalOfferBanner.code}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      promotionalOfferBanner: { ...config.promotionalOfferBanner, code: e.target.value.toUpperCase() }
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--admin-slate-300)",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--nilasa-gold)"
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                Offer Headline
              </label>
              <input
                type="text"
                value={config.promotionalOfferBanner.title}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    promotionalOfferBanner: { ...config.promotionalOfferBanner, title: e.target.value }
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--admin-slate-300)",
                  fontSize: "13px"
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                Offer Description
              </label>
              <textarea
                rows={3}
                value={config.promotionalOfferBanner.description}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    promotionalOfferBanner: { ...config.promotionalOfferBanner, description: e.target.value }
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--admin-slate-300)",
                  fontSize: "12px"
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={config.promotionalOfferBanner.ctaLabel}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      promotionalOfferBanner: { ...config.promotionalOfferBanner, ctaLabel: e.target.value }
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--admin-slate-300)",
                    fontSize: "12px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                  CTA Target Link
                </label>
                <input
                  type="text"
                  value={config.promotionalOfferBanner.ctaHref}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      promotionalOfferBanner: { ...config.promotionalOfferBanner, ctaHref: e.target.value }
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--admin-slate-300)",
                    fontSize: "12px"
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                Offer Image URL
              </label>
              <input
                type="text"
                value={config.promotionalOfferBanner.imageUrl}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    promotionalOfferBanner: { ...config.promotionalOfferBanner, imageUrl: e.target.value }
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--admin-slate-300)",
                  fontSize: "12px"
                }}
              />
            </div>
          </div>

          {/* Offer Preview Box */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--admin-slate-200)",
              borderRadius: "10px",
              padding: "20px"
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-slate-600)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "12px" }}>
              Offer Card Preview
            </span>
            <div
              style={{
                background: "#151D30",
                color: "#FAF7F2",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid rgba(212, 178, 88, 0.4)"
              }}
            >
              <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--nilasa-gold)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {config.promotionalOfferBanner.badge}
              </span>
              <h4 style={{ fontSize: "15px", margin: "6px 0 8px", color: "#FFFFFF" }}>{config.promotionalOfferBanner.title}</h4>
              <p style={{ fontSize: "12px", color: "rgba(250, 247, 242, 0.8)", margin: "0 0 14px", lineHeight: 1.4 }}>{config.promotionalOfferBanner.description}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ background: "#FAF7F2", color: "#151D30", padding: "4px 8px", borderRadius: "4px", fontWeight: 700, fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                  {config.promotionalOfferBanner.code}
                </span>
                <span style={{ fontSize: "11px", color: "var(--nilasa-gold-light)", fontWeight: 600 }}>
                  {config.promotionalOfferBanner.ctaLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
