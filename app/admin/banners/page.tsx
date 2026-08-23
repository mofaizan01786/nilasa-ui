"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { BannersConfig, HeroSlideItem } from "@/lib/types";
import { getBannersServerAction, saveBannersServerAction } from "@/lib/banners-actions";
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
  ChevronUp,
  ChevronDown,
  PlusCircle,
  Star,
  ShieldCheck,
  Truck
} from "lucide-react";

export default function AdminBannersPage() {
  const [config, setConfig] = useState<BannersConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"announcement" | "hero" | "offer">("announcement");
  const [newMessage, setNewMessage] = useState("");
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await getBannersServerAction();
      if (data) {
        // Ensure heroSlides is initialized
        if (!data.heroSlides || data.heroSlides.length === 0) {
          data.heroSlides = [
            {
              id: "slide-1",
              isActive: data.heroBanner?.isActive !== false,
              eyebrow: data.heroBanner?.eyebrow || "FESTIVE EDIT 2026",
              tagPill: data.heroBanner?.tagPill || "✨ Signature Indigo & Rose",
              offerBadge: data.heroBanner?.offerBadge || "Use Code NILASA10 for 10% Off",
              headline: data.heroBanner?.headline || "Grace In Every Thread",
              description: data.heroBanner?.description || "",
              primaryCta: data.heroBanner?.primaryCta || { label: "Explore Collection →", href: "/shop" },
              secondaryCta: data.heroBanner?.secondaryCta || { label: "View Suit Sets", href: "/category/suits" },
              imageUrl:
                data.heroBanner?.imageUrl ||
                "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=85",
              featuredPiece: data.heroBanner?.featuredPiece || {
                title: "SIGNATURE PIECE",
                subtitle: "Indigo Pleat Anarkali Suit • ₹6,490",
                href: "/product/indigo-pleat-anarkali-suit",
                tag: "BESTSELLER"
              }
            }
          ];
        }
        setConfig(data);
      }
    } catch {
      setStatusMessage("Failed to load banners configuration from data/banners.json");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!config) return;
    setSaving(true);
    setSaveStatus("idle");
    setStatusMessage("");

    // Sync first slide with heroBanner for backward compatibility
    const currentSlides = config.heroSlides && config.heroSlides.length > 0 ? config.heroSlides : [];
    const activeFirstSlide = currentSlides[0] || config.heroBanner;

    const payload: BannersConfig = {
      ...config,
      heroBanner: {
        ...config.heroBanner,
        eyebrow: activeFirstSlide.eyebrow || config.heroBanner.eyebrow,
        tagPill: activeFirstSlide.tagPill || config.heroBanner.tagPill,
        headline: activeFirstSlide.headline || config.heroBanner.headline,
        description: activeFirstSlide.description || config.heroBanner.description,
        offerBadge: activeFirstSlide.offerBadge || config.heroBanner.offerBadge,
        primaryCta: activeFirstSlide.primaryCta || config.heroBanner.primaryCta,
        secondaryCta: activeFirstSlide.secondaryCta || config.heroBanner.secondaryCta,
        imageUrl: activeFirstSlide.imageUrl || config.heroBanner.imageUrl,
        featuredPiece: activeFirstSlide.featuredPiece || config.heroBanner.featuredPiece
      },
      heroSlides: currentSlides,
      updatedAt: new Date().toISOString()
    };

    const res = await saveBannersServerAction(payload);
    setSaving(false);

    if (res.success && res.data) {
      setConfig(res.data);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("nilasa-banners-config", JSON.stringify(res.data));
        window.dispatchEvent(new CustomEvent("nilasa-banners-updated", { detail: res.data }));
      }
      setSaveStatus("success");
      setStatusMessage("Saved directly to data/banners.json! Storefront hero carousel updated instantly.");
      setTimeout(() => setSaveStatus("idle"), 4000);
    } else {
      setSaveStatus("error");
      setStatusMessage(res.error || "Failed to save banners.json.");
    }
  };

  // ─── Hero Multi-Slide Helpers ───
  const getSlides = (): HeroSlideItem[] => {
    if (!config) return [];
    if (config.heroSlides && config.heroSlides.length > 0) return config.heroSlides;
    return [
      {
        id: "slide-1",
        isActive: true,
        eyebrow: config.heroBanner.eyebrow || "FESTIVE EDIT 2026",
        tagPill: config.heroBanner.tagPill || "✨ Signature Indigo & Rose",
        offerBadge: config.heroBanner.offerBadge || "Use Code NILASA10 for 10% Off",
        headline: config.heroBanner.headline || "Grace In Every Thread",
        description: config.heroBanner.description || "",
        primaryCta: config.heroBanner.primaryCta || { label: "Explore Collection →", href: "/shop" },
        secondaryCta: config.heroBanner.secondaryCta || { label: "View Suit Sets", href: "/category/suits" },
        imageUrl: config.heroBanner.imageUrl || "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=85",
        featuredPiece: config.heroBanner.featuredPiece || {
          title: "SIGNATURE PIECE",
          subtitle: "Indigo Pleat Anarkali Suit • ₹6,490",
          href: "/product/indigo-pleat-anarkali-suit",
          tag: "BESTSELLER"
        }
      }
    ];
  };

  const handleAddSlide = () => {
    if (!config) return;
    const slides = getSlides();
    const newSlide: HeroSlideItem = {
      id: `slide-${Date.now()}`,
      isActive: true,
      eyebrow: "NEW FESTIVE DROP",
      tagPill: "✨ Artisan Handloom",
      offerBadge: "Complimentary Express Delivery",
      headline: "Royal Heritage Weaves",
      description: "Artisanal woven textures and zari motifs handcrafted for timeless celebrations.",
      primaryCta: { label: "Shop Collection →", href: "/shop" },
      secondaryCta: { label: "View Catalog", href: "/category/suits" },
      imageUrl: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85",
      featuredPiece: {
        title: "NEW ARRIVAL",
        subtitle: "Rose Tissue Silk Set • ₹7,990",
        href: "/shop",
        tag: "NEW"
      }
    };
    const updated = [...slides, newSlide];
    setConfig({
      ...config,
      heroSlides: updated
    });
    setSelectedSlideIndex(updated.length - 1);
  };

  const handleDeleteSlide = (idx: number) => {
    if (!config) return;
    const slides = getSlides();
    if (slides.length <= 1) {
      alert("At least one hero slide is required.");
      return;
    }
    const updated = slides.filter((_, i) => i !== idx);
    setConfig({
      ...config,
      heroSlides: updated
    });
    setSelectedSlideIndex((prev) => Math.min(prev, Math.max(0, updated.length - 1)));
  };

  const handleMoveSlideUp = (idx: number) => {
    if (!config || idx === 0) return;
    const slides = [...getSlides()];
    const temp = slides[idx];
    slides[idx] = slides[idx - 1];
    slides[idx - 1] = temp;
    setConfig({ ...config, heroSlides: slides });
    setSelectedSlideIndex(idx - 1);
  };

  const handleMoveSlideDown = (idx: number) => {
    const slides = getSlides();
    if (!config || idx >= slides.length - 1) return;
    const copy = [...slides];
    const temp = copy[idx];
    copy[idx] = copy[idx + 1];
    copy[idx + 1] = temp;
    setConfig({ ...config, heroSlides: copy });
    setSelectedSlideIndex(idx + 1);
  };

  const handleUpdateCurrentSlide = (fields: Partial<HeroSlideItem>) => {
    if (!config) return;
    const slides = [...getSlides()];
    const current = slides[selectedSlideIndex] || slides[0];
    slides[selectedSlideIndex] = {
      ...current,
      ...fields
    };
    setConfig({
      ...config,
      heroSlides: slides
    });
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

  const slides = getSlides();
  const currentSlide = slides[selectedSlideIndex] || slides[0];

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
              Dynamic Banners & Hero Carousel Manager
            </h1>
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "var(--admin-slate-600)",
              margin: "4px 0 0"
            }}
          >
            Manage multi-slide hero carousel banners, top announcement bar, and promotional offer cards with live instant sync.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 22px",
            borderRadius: "6px",
            border: "none",
            background: "#B87078",
            color: "#FFFFFF",
            fontSize: "13px",
            fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            boxShadow: "0 2px 8px rgba(184, 112, 120, 0.3)"
          }}
        >
          <Save size={15} />
          <span>{saving ? "Saving Changes..." : "Save All Changes"}</span>
        </button>
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            background: saveStatus === "success" ? "#ECFDF5" : "#FEF2F2",
            color: saveStatus === "success" ? "#065F46" : "#991B1B",
            border: saveStatus === "success" ? "1px solid #A7F3D0" : "1px solid #FECACA"
          }}
        >
          {saveStatus === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
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
            borderBottom: activeTab === "announcement" ? "2px solid #B87078" : "2px solid transparent",
            background: "transparent",
            color: activeTab === "announcement" ? "#B87078" : "var(--admin-slate-600)",
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
            borderBottom: activeTab === "hero" ? "2px solid #B87078" : "2px solid transparent",
            background: "transparent",
            color: activeTab === "hero" ? "#B87078" : "var(--admin-slate-600)",
            fontWeight: activeTab === "hero" ? 700 : 500,
            fontSize: "13px",
            cursor: "pointer"
          }}
        >
          <ImageIcon size={15} />
          <span>2. Hero Carousel Slides ({slides.length})</span>
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
            borderBottom: activeTab === "offer" ? "2px solid #B87078" : "2px solid transparent",
            background: "transparent",
            color: activeTab === "offer" ? "#B87078" : "var(--admin-slate-600)",
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
                background: "#B88088",
                color: "#F8F0E8",
                padding: "8px 14px",
                borderRadius: "6px",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                textAlign: "center",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}
            >
              {config.announcementBar.messages.join(" • ")}
              {config.announcementBar.couponCode && ` • USE CODE ${config.announcementBar.couponCode} FOR ${config.announcementBar.couponDiscount || ""}`}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Multi-Slide Luxury Hero Carousel Settings */}
      {activeTab === "hero" && (
        <div>
          {/* Top Multi-Slide Order & Selector Strip */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--admin-slate-200)",
              borderRadius: "10px",
              padding: "16px 20px",
              marginBottom: "24px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--admin-ink)" }}>
                  Carousel Slide Order (Top ➔ Bottom Sequence)
                </span>
                <p style={{ fontSize: "12px", color: "var(--admin-slate-600)", margin: "2px 0 0" }}>
                  Add multiple hero banners, reorder them up/down to set the exact storefront display sequence.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSlide}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  background: "#B87078",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                <Plus size={14} />
                <span>Add New Slide</span>
              </button>
            </div>

            {/* Slide Cards List */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(280px, 1fr))`, gap: "12px" }}>
              {slides.map((s, idx) => (
                <div
                  key={s.id || idx}
                  onClick={() => setSelectedSlideIndex(idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: selectedSlideIndex === idx ? "#F8E8E8" : "#F8FAFC",
                    border: selectedSlideIndex === idx ? "2px solid #B87078" : "1px solid var(--admin-slate-200)",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                    <span
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: selectedSlideIndex === idx ? "#B87078" : "#E2E8F0",
                        color: selectedSlideIndex === idx ? "#FFFFFF" : "var(--admin-slate-600)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--admin-ink)", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {s.headline || `Slide ${idx + 1}`}
                      </span>
                      <span style={{ fontSize: "10px", color: "var(--admin-slate-600)", display: "block" }}>
                        {s.eyebrow || "FESTIVE EDIT"}
                      </span>
                    </div>
                  </div>

                  {/* Reorder Buttons (Move Up / Move Down) */}
                  <div style={{ display: "flex", alignItems: "center", gap: "2px" }} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      title="Move Up (Towards Top)"
                      disabled={idx === 0}
                      onClick={() => handleMoveSlideUp(idx)}
                      style={{
                        padding: "4px",
                        background: "none",
                        border: "none",
                        color: idx === 0 ? "#CBD5E1" : "#64748B",
                        cursor: idx === 0 ? "not-allowed" : "pointer"
                      }}
                    >
                      <ChevronUp size={16} />
                    </button>

                    <button
                      type="button"
                      title="Move Down (Towards Bottom)"
                      disabled={idx === slides.length - 1}
                      onClick={() => handleMoveSlideDown(idx)}
                      style={{
                        padding: "4px",
                        background: "none",
                        border: "none",
                        color: idx === slides.length - 1 ? "#CBD5E1" : "#64748B",
                        cursor: idx === slides.length - 1 ? "not-allowed" : "pointer"
                      }}
                    >
                      <ChevronDown size={16} />
                    </button>

                    {slides.length > 1 && (
                      <button
                        type="button"
                        title="Delete Slide"
                        onClick={() => handleDeleteSlide(idx)}
                        style={{
                          padding: "4px",
                          background: "none",
                          border: "none",
                          color: "#EF4444",
                          cursor: "pointer",
                          marginLeft: "4px"
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form & Live Preview Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "24px", alignItems: "flex-start" }}>
            {/* Slide Edit Form */}
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
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--admin-ink)", margin: 0 }}>
                    Editing Slide #{selectedSlideIndex + 1}
                  </h3>
                  <span style={{ fontSize: "11px", color: "#B87078", fontWeight: 600 }}>
                    {currentSlide.headline}
                  </span>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={currentSlide.isActive !== false}
                    onChange={(e) => handleUpdateCurrentSlide({ isActive: e.target.checked })}
                  />
                  <span>Slide Active</span>
                </label>
              </div>

              {/* Badges & Tags */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                    Gold Tag (e.g. FESTIVE EDIT 2026)
                  </label>
                  <input
                    type="text"
                    value={currentSlide.eyebrow}
                    onChange={(e) => handleUpdateCurrentSlide({ eyebrow: e.target.value.toUpperCase() })}
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
                    Offer Badge Pill (e.g. USE CODE NILASA10)
                  </label>
                  <input
                    type="text"
                    value={currentSlide.offerBadge || ""}
                    onChange={(e) => handleUpdateCurrentSlide({ offerBadge: e.target.value })}
                    placeholder="e.g. Use Code NILASA10 for 10% Off"
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

              {/* Headline */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                  Main Headline
                </label>
                <input
                  type="text"
                  value={currentSlide.headline}
                  onChange={(e) => handleUpdateCurrentSlide({ headline: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--admin-slate-300)",
                    fontSize: "13px",
                    fontWeight: 600
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                  Hero Description
                </label>
                <textarea
                  rows={3}
                  value={currentSlide.description}
                  onChange={(e) => handleUpdateCurrentSlide({ description: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--admin-slate-300)",
                    fontSize: "12px"
                  }}
                />
              </div>

              {/* CTAs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                    Primary CTA (Button & Link)
                  </label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="text"
                      value={currentSlide.primaryCta?.label || ""}
                      placeholder="Label (e.g. Explore Collection →)"
                      onChange={(e) =>
                        handleUpdateCurrentSlide({
                          primaryCta: { ...currentSlide.primaryCta, label: e.target.value }
                        })
                      }
                      style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid var(--admin-slate-300)", fontSize: "12px" }}
                    />
                    <input
                      type="text"
                      value={currentSlide.primaryCta?.href || ""}
                      placeholder="Link (e.g. /shop)"
                      onChange={(e) =>
                        handleUpdateCurrentSlide({
                          primaryCta: { ...currentSlide.primaryCta, href: e.target.value }
                        })
                      }
                      style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid var(--admin-slate-300)", fontSize: "12px" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                    Secondary CTA (Button & Link)
                  </label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="text"
                      value={currentSlide.secondaryCta?.label || ""}
                      placeholder="Label (e.g. View Suit Sets)"
                      onChange={(e) =>
                        handleUpdateCurrentSlide({
                          secondaryCta: {
                            label: e.target.value,
                            href: currentSlide.secondaryCta?.href || "/category/suits"
                          }
                        })
                      }
                      style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid var(--admin-slate-300)", fontSize: "12px" }}
                    />
                    <input
                      type="text"
                      value={currentSlide.secondaryCta?.href || ""}
                      placeholder="Link (e.g. /category/suits)"
                      onChange={(e) =>
                        handleUpdateCurrentSlide({
                          secondaryCta: {
                            label: currentSlide.secondaryCta?.label || "View Suit Sets",
                            href: e.target.value
                          }
                        })
                      }
                      style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid var(--admin-slate-300)", fontSize: "12px" }}
                    />
                  </div>
                </div>
              </div>

              {/* Image URL */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                  Hero Showcase Image URL
                </label>
                <input
                  type="text"
                  value={currentSlide.imageUrl}
                  onChange={(e) => handleUpdateCurrentSlide({ imageUrl: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--admin-slate-300)",
                    fontSize: "12px"
                  }}
                />
              </div>

              {/* Featured Showcase Piece Card */}
              <div
                style={{
                  borderTop: "1px solid var(--admin-slate-200)",
                  paddingTop: "16px",
                  marginTop: "16px"
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--admin-ink)", display: "block", marginBottom: "12px" }}>
                  Floating Showcase Product Card
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--admin-slate-600)", marginBottom: "4px" }}>
                      Card Eyebrow
                    </label>
                    <input
                      type="text"
                      value={currentSlide.featuredPiece?.title || ""}
                      placeholder="e.g. SIGNATURE PIECE"
                      onChange={(e) =>
                        handleUpdateCurrentSlide({
                          featuredPiece: {
                            title: e.target.value,
                            subtitle: currentSlide.featuredPiece?.subtitle || "",
                            href: currentSlide.featuredPiece?.href || "/shop",
                            tag: currentSlide.featuredPiece?.tag || "BESTSELLER"
                          }
                        })
                      }
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "4px", border: "1px solid var(--admin-slate-300)", fontSize: "12px" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--admin-slate-600)", marginBottom: "4px" }}>
                      Top Trending Badge
                    </label>
                    <input
                      type="text"
                      value={currentSlide.featuredPiece?.tag || "BESTSELLER"}
                      placeholder="e.g. BESTSELLER / NEW ARRIVAL"
                      onChange={(e) =>
                        handleUpdateCurrentSlide({
                          featuredPiece: {
                            title: currentSlide.featuredPiece?.title || "SIGNATURE PIECE",
                            subtitle: currentSlide.featuredPiece?.subtitle || "",
                            href: currentSlide.featuredPiece?.href || "/shop",
                            tag: e.target.value.toUpperCase()
                          }
                        })
                      }
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "4px", border: "1px solid var(--admin-slate-300)", fontSize: "12px" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--admin-slate-600)", marginBottom: "4px" }}>
                      Product Title & Price
                    </label>
                    <input
                      type="text"
                      value={currentSlide.featuredPiece?.subtitle || ""}
                      placeholder="e.g. Indigo Pleat Anarkali Suit • ₹6,490"
                      onChange={(e) =>
                        handleUpdateCurrentSlide({
                          featuredPiece: {
                            title: currentSlide.featuredPiece?.title || "SIGNATURE PIECE",
                            subtitle: e.target.value,
                            href: currentSlide.featuredPiece?.href || "/shop",
                            tag: currentSlide.featuredPiece?.tag || "BESTSELLER"
                          }
                        })
                      }
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "4px", border: "1px solid var(--admin-slate-300)", fontSize: "12px" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--admin-slate-600)", marginBottom: "4px" }}>
                      Product Link
                    </label>
                    <input
                      type="text"
                      value={currentSlide.featuredPiece?.href || ""}
                      placeholder="e.g. /product/indigo-pleat-anarkali-suit"
                      onChange={(e) =>
                        handleUpdateCurrentSlide({
                          featuredPiece: {
                            title: currentSlide.featuredPiece?.title || "SIGNATURE PIECE",
                            subtitle: currentSlide.featuredPiece?.subtitle || "",
                            href: e.target.value,
                            tag: currentSlide.featuredPiece?.tag || "BESTSELLER"
                          }
                        })
                      }
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "4px", border: "1px solid var(--admin-slate-300)", fontSize: "12px" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Luxury Live Hero Preview Panel */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid var(--admin-slate-200)",
                borderRadius: "10px",
                padding: "20px",
                position: "sticky",
                top: "20px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-slate-600)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Live Preview: Slide #{selectedSlideIndex + 1} of {slides.length}
                </span>

                <div style={{ display: "flex", gap: "4px" }}>
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSlideIndex(idx)}
                      style={{
                        width: idx === selectedSlideIndex ? "20px" : "8px",
                        height: "8px",
                        borderRadius: "999px",
                        background: idx === selectedSlideIndex ? "#B87078" : "#E2E8F0",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Render Storefront Hero Scaled Preview */}
              <div
                style={{
                  background: "linear-gradient(135deg, #F8E8E8 0%, #F5DFE1 50%, #F8E8E8 100%)",
                  borderRadius: "12px",
                  padding: "20px",
                  border: "1px solid #E8D0D2",
                  boxShadow: "0 4px 16px rgba(104, 56, 64, 0.08)"
                }}
              >
                {/* Badges */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                  <span
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #B8894F",
                      color: "#B8894F",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase"
                    }}
                  >
                    ✨ {currentSlide.eyebrow}
                  </span>

                  {currentSlide.offerBadge && (
                    <span
                      style={{
                        background: "#B87078",
                        color: "#F8F0E8",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        fontSize: "9px",
                        fontWeight: 600
                      }}
                    >
                      🏷️ {currentSlide.offerBadge}
                    </span>
                  )}
                </div>

                {/* Headline */}
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "22px",
                    fontWeight: 600,
                    color: "#683840",
                    margin: "0 0 8px",
                    lineHeight: 1.15
                  }}
                >
                  {currentSlide.headline}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: "11px",
                    color: "#8A5A62",
                    margin: "0 0 14px",
                    lineHeight: 1.5
                  }}
                >
                  {currentSlide.description}
                </p>

                {/* CTA Buttons */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                  <span
                    style={{
                      background: "#B87078",
                      color: "#F8F0E8",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700
                    }}
                  >
                    {currentSlide.primaryCta?.label || "Explore Collection →"}
                  </span>
                  <span
                    style={{
                      background: "transparent",
                      color: "#B87078",
                      border: "1px solid #B87078",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 600
                    }}
                  >
                    {currentSlide.secondaryCta?.label || "View Suit Sets"}
                  </span>
                </div>

                {/* Trust Strip */}
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid #E8D0D2",
                    borderRadius: "999px",
                    padding: "5px 12px",
                    fontSize: "9px",
                    color: "#683840",
                    fontWeight: 600,
                    display: "inline-flex",
                    gap: "8px",
                    marginBottom: "16px"
                  }}
                >
                  <span>★ 4.9/5 Rating</span>
                  <span>•</span>
                  <span>100% Pure Silk</span>
                  <span>•</span>
                  <span>Free Express Delivery</span>
                </div>

                {/* Media Card Preview */}
                <div style={{ position: "relative", height: "200px", borderRadius: "14px", overflow: "hidden", border: "2px solid #FFFFFF", boxShadow: "0 8px 24px rgba(104, 56, 64, 0.12)" }}>
                  <Image
                    src={currentSlide.imageUrl || "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=80"}
                    alt="Hero Preview"
                    fill
                    style={{ objectFit: "cover" }}
                  />

                  {/* Top Badge */}
                  {currentSlide.featuredPiece?.tag && (
                    <span
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "#683840",
                        color: "#F8F0E8",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        fontSize: "8px",
                        fontWeight: 700,
                        letterSpacing: "0.08em"
                      }}
                    >
                      {currentSlide.featuredPiece.tag}
                    </span>
                  )}

                  {/* Floating Card */}
                  {currentSlide.featuredPiece && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "8px",
                        left: "8px",
                        right: "8px",
                        background: "rgba(255, 255, 255, 0.94)",
                        border: "1px solid rgba(184, 137, 79, 0.4)",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "7px", fontWeight: 700, color: "#B8894F", letterSpacing: "0.08em", display: "block" }}>
                          {currentSlide.featuredPiece.title}
                        </span>
                        <span style={{ fontSize: "9px", fontWeight: 600, color: "#683840", display: "block" }}>
                          {currentSlide.featuredPiece.subtitle}
                        </span>
                      </div>
                      <span style={{ background: "#B87078", color: "#F8F0E8", padding: "2px 6px", borderRadius: "4px", fontSize: "8px" }}>
                        →
                      </span>
                    </div>
                  )}
                </div>
              </div>
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
                <span>Enable Offer</span>
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                  Badge Tag
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
                  Coupon Code
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
                    fontSize: "12px"
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: "6px" }}>
                Offer Title
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
                  CTA Link
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
                Promo Image URL
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

          {/* Promo Preview */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--admin-slate-200)",
              borderRadius: "10px",
              padding: "20px"
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-slate-600)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "12px" }}>
              Offer Card Live Preview
            </span>
            <div
              style={{
                position: "relative",
                height: "240px",
                borderRadius: "10px",
                overflow: "hidden",
                border: "1px solid var(--admin-slate-200)",
                display: "flex",
                alignItems: "flex-end",
                padding: "20px"
              }}
            >
              <Image
                src={config.promotionalOfferBanner.imageUrl || "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80"}
                alt="Promo Preview"
                fill
                style={{ objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(21, 29, 48, 0.9) 0%, rgba(21, 29, 48, 0.4) 60%, transparent 100%)"
                }}
              />
              <div style={{ position: "relative", zIndex: 2, color: "#FFFFFF" }}>
                <span
                  style={{
                    background: "#B87078",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.08em"
                  }}
                >
                  {config.promotionalOfferBanner.badge}
                </span>
                <h4 style={{ fontSize: "16px", margin: "8px 0 4px", color: "#FFFFFF" }}>
                  {config.promotionalOfferBanner.title}
                </h4>
                <p style={{ fontSize: "11px", color: "#CBD5E1", margin: "0 0 10px" }}>
                  {config.promotionalOfferBanner.description}
                </p>
                <div style={{ display: "inline-block", background: "var(--nilasa-gold)", color: "var(--nilasa-indigo)", padding: "6px 14px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>
                  {config.promotionalOfferBanner.ctaLabel} (Code: {config.promotionalOfferBanner.code})
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
