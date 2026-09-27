"use client";

import React, { useState, useEffect } from "react";
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
  const [activeTab, setActiveTab] = useState<"announcement" | "hero" | "offer">("hero");
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
      <div style={{ padding: "32px", color: "var(--admin-text-muted)" }}>
        <p>Loading banners & promotional offers configuration...</p>
      </div>
    );
  }

  const slides = getSlides();
  const currentSlide = slides[selectedSlideIndex] || slides[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1280, margin: "0 auto", width: "100%" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
              <Sparkles size={18} />
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
              Banners & Hero Carousel Manager
            </h1>
          </div>
          <p
            style={{
              fontSize: "12.5px",
              color: "var(--admin-text-muted)",
              margin: "4px 0 0"
            }}
          >
            Manage multi-slide hero carousel banners, top announcement bar, and promotional offers with live instant sync.
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
            padding: "9px 22px",
            borderRadius: 999,
            border: "none",
            background: "var(--admin-primary)",
            color: "#FFFFFF",
            fontSize: "13px",
            fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            boxShadow: "0 2px 8px var(--admin-primary-glow)",
            transition: "all 0.15s ease"
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
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            background: saveStatus === "success" ? "#E8F5E9" : "#FDE8E8",
            color: saveStatus === "success" ? "#1E6B24" : "#9B2C2C",
            border: saveStatus === "success" ? "1px solid #C8E6C9" : "1px solid #FED7D7"
          }}
        >
          {saveStatus === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Responsive Tabs Strip */}
      <div className="admin-tabs-scroll-wrapper">
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            border: "none",
            borderBottom: activeTab === "hero" ? "2.5px solid var(--admin-primary)" : "2.5px solid transparent",
            background: "transparent",
            color: activeTab === "hero" ? "var(--admin-primary)" : "var(--admin-text-muted)",
            fontWeight: activeTab === "hero" ? 700 : 500,
            fontSize: "13px",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          <ImageIcon size={15} />
          <span>1. Hero Carousel Slides ({slides.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("announcement")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            border: "none",
            borderBottom: activeTab === "announcement" ? "2.5px solid var(--admin-primary)" : "2.5px solid transparent",
            background: "transparent",
            color: activeTab === "announcement" ? "var(--admin-primary)" : "var(--admin-text-muted)",
            fontWeight: activeTab === "announcement" ? 700 : 500,
            fontSize: "13px",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          <Megaphone size={15} />
          <span>2. Top Announcement Bar</span>
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
            borderBottom: activeTab === "offer" ? "2.5px solid var(--admin-primary)" : "2.5px solid transparent",
            background: "transparent",
            color: activeTab === "offer" ? "var(--admin-primary)" : "var(--admin-text-muted)",
            fontWeight: activeTab === "offer" ? 700 : 500,
            fontSize: "13px",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          <Tag size={15} />
          <span>3. Mid-Page Promotional Offer</span>
        </button>
      </div>

      {/* TAB 1: Multi-Slide Luxury Hero Carousel Settings */}
      {activeTab === "hero" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Top Multi-Slide Order & Selector Strip */}
          <div className="admin-luxury-card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--admin-text-main)" }}>
                  Carousel Slide Order (Top ➔ Bottom Sequence)
                </span>
                <p style={{ fontSize: "11.5px", color: "var(--admin-text-muted)", margin: "2px 0 0" }}>
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
                  padding: "7px 14px",
                  borderRadius: 999,
                  background: "var(--admin-primary)",
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

            {/* Slide Cards List (Responsive Grid) */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(240px, 1fr))`, gap: "10px" }}>
              {slides.map((s, idx) => (
                <div
                  key={s.id || idx}
                  onClick={() => setSelectedSlideIndex(idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 12px",
                    borderRadius: "12px",
                    background: selectedSlideIndex === idx ? "var(--admin-primary-soft)" : "var(--admin-surface-bg)",
                    border: selectedSlideIndex === idx ? "1.5px solid var(--admin-primary)" : "1px solid var(--admin-border-subtle)",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                    <span
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: selectedSlideIndex === idx ? "var(--admin-primary)" : "var(--admin-border-subtle)",
                        color: selectedSlideIndex === idx ? "#FFFFFF" : "var(--admin-text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10.5px",
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--admin-text-main)", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {s.headline || `Slide ${idx + 1}`}
                      </span>
                      <span style={{ fontSize: "10px", color: "var(--admin-text-muted)", display: "block" }}>
                        {s.eyebrow || "FESTIVE EDIT"}
                      </span>
                    </div>
                  </div>

                  {/* Reorder Buttons */}
                  <div style={{ display: "flex", alignItems: "center", gap: "2px" }} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      title="Move Up"
                      disabled={idx === 0}
                      onClick={() => handleMoveSlideUp(idx)}
                      style={{
                        padding: "3px",
                        background: "none",
                        border: "none",
                        color: idx === 0 ? "var(--admin-border-subtle)" : "var(--admin-text-muted)",
                        cursor: idx === 0 ? "not-allowed" : "pointer"
                      }}
                    >
                      <ChevronUp size={15} />
                    </button>

                    <button
                      type="button"
                      title="Move Down"
                      disabled={idx === slides.length - 1}
                      onClick={() => handleMoveSlideDown(idx)}
                      style={{
                        padding: "3px",
                        background: "none",
                        border: "none",
                        color: idx === slides.length - 1 ? "var(--admin-border-subtle)" : "var(--admin-text-muted)",
                        cursor: idx === slides.length - 1 ? "not-allowed" : "pointer"
                      }}
                    >
                      <ChevronDown size={15} />
                    </button>

                    {slides.length > 1 && (
                      <button
                        type="button"
                        title="Delete Slide"
                        onClick={() => handleDeleteSlide(idx)}
                        style={{
                          padding: "3px",
                          background: "none",
                          border: "none",
                          color: "#E05353",
                          cursor: "pointer",
                          marginLeft: "2px"
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form & Live Preview 2-Column Split (Responsive via CSS) */}
          <div className="admin-form-preview-grid">
            {/* Slide Edit Form */}
            <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid var(--admin-border-subtle)",
                  paddingBottom: "12px"
                }}
              >
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--admin-text-main)", margin: 0 }}>
                    Editing Slide #{selectedSlideIndex + 1}
                  </h3>
                  <span style={{ fontSize: "11px", color: "var(--admin-primary)", fontWeight: 600 }}>
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

              {/* Badges & Tags Grid */}
              <div className="admin-form-grid-2">
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                    Gold Tag (e.g. FESTIVE EDIT 2026)
                  </label>
                  <input
                    type="text"
                    value={currentSlide.eyebrow}
                    onChange={(e) => handleUpdateCurrentSlide({ eyebrow: e.target.value.toUpperCase() })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--admin-border-subtle)",
                      background: "var(--admin-surface-bg)",
                      color: "var(--admin-text-main)",
                      fontSize: "12px",
                      outline: "none"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "6px" }}>
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
                      borderRadius: "8px",
                      border: "1px solid var(--admin-border-subtle)",
                      background: "var(--admin-surface-bg)",
                      color: "var(--admin-text-main)",
                      fontSize: "12px",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              {/* Headline */}
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                  Main Headline
                </label>
                <input
                  type="text"
                  value={currentSlide.headline}
                  onChange={(e) => handleUpdateCurrentSlide({ headline: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--admin-border-subtle)",
                    background: "var(--admin-surface-bg)",
                    color: "var(--admin-text-main)",
                    fontSize: "13px",
                    fontWeight: 600,
                    outline: "none"
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                  Hero Description
                </label>
                <textarea
                  rows={3}
                  value={currentSlide.description}
                  onChange={(e) => handleUpdateCurrentSlide({ description: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--admin-border-subtle)",
                    background: "var(--admin-surface-bg)",
                    color: "var(--admin-text-main)",
                    fontSize: "12px",
                    outline: "none"
                  }}
                />
              </div>

              {/* CTAs */}
              <div className="admin-form-grid-2">
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                    Primary CTA (Label & Link)
                  </label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="text"
                      value={currentSlide.primaryCta?.label || ""}
                      placeholder="Label"
                      onChange={(e) =>
                        handleUpdateCurrentSlide({
                          primaryCta: { ...currentSlide.primaryCta, label: e.target.value }
                        })
                      }
                      style={{ flex: 1, padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--admin-border-subtle)", background: "var(--admin-surface-bg)", color: "var(--admin-text-main)", fontSize: "12px" }}
                    />
                    <input
                      type="text"
                      value={currentSlide.primaryCta?.href || ""}
                      placeholder="/shop"
                      onChange={(e) =>
                        handleUpdateCurrentSlide({
                          primaryCta: { ...currentSlide.primaryCta, href: e.target.value }
                        })
                      }
                      style={{ flex: 1, padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--admin-border-subtle)", background: "var(--admin-surface-bg)", color: "var(--admin-text-main)", fontSize: "12px" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                    Secondary CTA (Label & Link)
                  </label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="text"
                      value={currentSlide.secondaryCta?.label || ""}
                      placeholder="Label"
                      onChange={(e) =>
                        handleUpdateCurrentSlide({
                          secondaryCta: {
                            label: e.target.value,
                            href: currentSlide.secondaryCta?.href || "/category/suits"
                          }
                        })
                      }
                      style={{ flex: 1, padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--admin-border-subtle)", background: "var(--admin-surface-bg)", color: "var(--admin-text-main)", fontSize: "12px" }}
                    />
                    <input
                      type="text"
                      value={currentSlide.secondaryCta?.href || ""}
                      placeholder="/category/suits"
                      onChange={(e) =>
                        handleUpdateCurrentSlide({
                          secondaryCta: {
                            label: currentSlide.secondaryCta?.label || "View Suit Sets",
                            href: e.target.value
                          }
                        })
                      }
                      style={{ flex: 1, padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--admin-border-subtle)", background: "var(--admin-surface-bg)", color: "var(--admin-text-main)", fontSize: "12px" }}
                    />
                  </div>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "6px" }}>
                  Hero Showcase Image URL
                </label>
                <input
                  type="text"
                  value={currentSlide.imageUrl}
                  onChange={(e) => handleUpdateCurrentSlide({ imageUrl: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--admin-border-subtle)",
                    background: "var(--admin-surface-bg)",
                    color: "var(--admin-text-main)",
                    fontSize: "12px"
                  }}
                />
              </div>

              {/* Featured Showcase Piece Card */}
              <div
                style={{
                  borderTop: "1px solid var(--admin-border-subtle)",
                  paddingTop: "14px",
                  marginTop: "6px"
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--admin-text-main)", display: "block", marginBottom: "10px" }}>
                  Floating Showcase Product Card
                </span>
                <div className="admin-form-grid-2" style={{ marginBottom: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "4px" }}>
                      Card Eyebrow
                    </label>
                    <input
                      type="text"
                      value={currentSlide.featuredPiece?.title || ""}
                      placeholder="SIGNATURE PIECE"
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
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--admin-border-subtle)", background: "var(--admin-surface-bg)", color: "var(--admin-text-main)", fontSize: "12px" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "4px" }}>
                      Top Trending Badge
                    </label>
                    <input
                      type="text"
                      value={currentSlide.featuredPiece?.tag || "BESTSELLER"}
                      placeholder="BESTSELLER"
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
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--admin-border-subtle)", background: "var(--admin-surface-bg)", color: "var(--admin-text-main)", fontSize: "12px" }}
                    />
                  </div>
                </div>

                <div className="admin-form-grid-2">
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "4px" }}>
                      Product Title & Price
                    </label>
                    <input
                      type="text"
                      value={currentSlide.featuredPiece?.subtitle || ""}
                      placeholder="Indigo Pleat Anarkali Suit • ₹6,490"
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
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--admin-border-subtle)", background: "var(--admin-surface-bg)", color: "var(--admin-text-main)", fontSize: "12px" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "4px" }}>
                      Product Link
                    </label>
                    <input
                      type="text"
                      value={currentSlide.featuredPiece?.href || ""}
                      placeholder="/product/indigo-pleat-anarkali-suit"
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
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--admin-border-subtle)", background: "var(--admin-surface-bg)", color: "var(--admin-text-main)", fontSize: "12px" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Luxury Live Hero Preview Panel */}
            <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: "84px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Live Storefront Preview
                </span>

                <div style={{ display: "flex", gap: "4px" }}>
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSlideIndex(idx)}
                      style={{
                        width: idx === selectedSlideIndex ? "18px" : "7px",
                        height: "7px",
                        borderRadius: "999px",
                        background: idx === selectedSlideIndex ? "var(--admin-primary)" : "var(--admin-border-subtle)",
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
                  background: "linear-gradient(135deg, var(--admin-primary-soft) 0%, var(--admin-surface-bg) 100%)",
                  borderRadius: "14px",
                  padding: "18px",
                  border: "1px solid var(--admin-border-subtle)",
                  boxShadow: "var(--admin-shadow-sm)"
                }}
              >
                {/* Badges */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
                  <span
                    style={{
                      background: "var(--admin-card-bg)",
                      border: "1px solid var(--admin-accent-gold)",
                      color: "var(--admin-accent-gold)",
                      padding: "2px 8px",
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
                        background: "var(--admin-primary)",
                        color: "#FFFFFF",
                        padding: "2px 8px",
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
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "var(--admin-text-main)",
                    margin: "0 0 6px",
                    lineHeight: 1.15
                  }}
                >
                  {currentSlide.headline}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--admin-text-muted)",
                    margin: "0 0 12px",
                    lineHeight: 1.4
                  }}
                >
                  {currentSlide.description}
                </p>

                {/* CTA Buttons */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                  <span
                    style={{
                      background: "var(--admin-primary)",
                      color: "#FFFFFF",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "10.5px",
                      fontWeight: 700
                    }}
                  >
                    {currentSlide.primaryCta?.label || "Explore Collection →"}
                  </span>
                  <span
                    style={{
                      background: "transparent",
                      color: "var(--admin-primary)",
                      border: "1px solid var(--admin-primary)",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "10.5px",
                      fontWeight: 600
                    }}
                  >
                    {currentSlide.secondaryCta?.label || "View Suit Sets"}
                  </span>
                </div>

                {/* Media Card Preview */}
                <div style={{ position: "relative", height: "180px", borderRadius: "12px", overflow: "hidden", border: "2px solid #FFFFFF", boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}>
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
                        background: "var(--admin-primary)",
                        color: "#FFFFFF",
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
                        border: "1px solid rgba(198, 146, 68, 0.4)",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "7px", fontWeight: 700, color: "#C69244", letterSpacing: "0.08em", display: "block" }}>
                          {currentSlide.featuredPiece.title}
                        </span>
                        <span style={{ fontSize: "9px", fontWeight: 600, color: "#2C1E20", display: "block" }}>
                          {currentSlide.featuredPiece.subtitle}
                        </span>
                      </div>
                      <span style={{ background: "var(--admin-primary)", color: "#FFFFFF", padding: "2px 6px", borderRadius: "4px", fontSize: "8px" }}>
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

      {/* TAB 2: Announcement Bar Settings */}
      {activeTab === "announcement" && (
        <div className="admin-form-preview-grid">
          <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--admin-border-subtle)",
                paddingBottom: "12px"
              }}
            >
              <h3 style={{ fontSize: "15px", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--admin-text-main)", margin: 0 }}>
                Top Announcement Bar Config
              </h3>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}>
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
            <div>
              <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "8px" }}>
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
                      background: "var(--admin-surface-bg)",
                      borderRadius: "8px",
                      border: "1px solid var(--admin-border-subtle)",
                      fontSize: "12px"
                    }}
                  >
                    <span>{msg}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(idx)}
                      style={{ background: "none", border: "none", color: "#E05353", cursor: "pointer", padding: "2px" }}
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
                  placeholder="Add new announcement message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--admin-border-subtle)",
                    background: "var(--admin-surface-bg)",
                    color: "var(--admin-text-main)",
                    fontSize: "12px",
                    outline: "none"
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddMessage}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--admin-border-subtle)",
                    background: "var(--admin-card-bg)",
                    color: "var(--admin-text-main)",
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
            <div className="admin-form-grid-2">
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "6px" }}>
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
                  placeholder="NILASA10"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--admin-border-subtle)",
                    background: "var(--admin-surface-bg)",
                    color: "var(--admin-text-main)",
                    fontSize: "12px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "6px" }}>
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
                  placeholder="10% OFF"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--admin-border-subtle)",
                    background: "var(--admin-surface-bg)",
                    color: "var(--admin-text-main)",
                    fontSize: "12px"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Live Storefront Preview
            </span>
            <div
              style={{
                background: "var(--admin-primary)",
                color: "#FFFFFF",
                padding: "9px 14px",
                borderRadius: "8px",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                textAlign: "center",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                boxShadow: "var(--admin-shadow-sm)"
              }}
            >
              {config.announcementBar.messages.join(" • ")}
              {config.announcementBar.couponCode && ` • USE CODE ${config.announcementBar.couponCode} FOR ${config.announcementBar.couponDiscount || ""}`}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Mid-Page Promotional Offer Banner Settings */}
      {activeTab === "offer" && (
        <div className="admin-form-preview-grid">
          <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--admin-border-subtle)",
                paddingBottom: "12px"
              }}
            >
              <h3 style={{ fontSize: "15px", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--admin-text-main)", margin: 0 }}>
                Mid-Page Promotional Offer Banner
              </h3>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}>
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

            <div className="admin-form-grid-2">
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "6px" }}>
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
                    borderRadius: "8px",
                    border: "1px solid var(--admin-border-subtle)",
                    background: "var(--admin-surface-bg)",
                    color: "var(--admin-text-main)",
                    fontSize: "12px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "6px" }}>
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
                    borderRadius: "8px",
                    border: "1px solid var(--admin-border-subtle)",
                    background: "var(--admin-surface-bg)",
                    color: "var(--admin-text-main)",
                    fontSize: "12px"
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "6px" }}>
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
                  borderRadius: "8px",
                  border: "1px solid var(--admin-border-subtle)",
                  background: "var(--admin-surface-bg)",
                  color: "var(--admin-text-main)",
                  fontSize: "13px"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "6px" }}>
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
                  borderRadius: "8px",
                  border: "1px solid var(--admin-border-subtle)",
                  background: "var(--admin-surface-bg)",
                  color: "var(--admin-text-main)",
                  fontSize: "12px"
                }}
              />
            </div>

            <div className="admin-form-grid-2">
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "6px" }}>
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
                    borderRadius: "8px",
                    border: "1px solid var(--admin-border-subtle)",
                    background: "var(--admin-surface-bg)",
                    color: "var(--admin-text-main)",
                    fontSize: "12px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "6px" }}>
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
                    borderRadius: "8px",
                    border: "1px solid var(--admin-border-subtle)",
                    background: "var(--admin-surface-bg)",
                    color: "var(--admin-text-main)",
                    fontSize: "12px"
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: "6px" }}>
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
                  borderRadius: "8px",
                  border: "1px solid var(--admin-border-subtle)",
                  background: "var(--admin-surface-bg)",
                  color: "var(--admin-text-main)",
                  fontSize: "12px"
                }}
              />
            </div>
          </div>

          {/* Promo Preview */}
          <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Offer Card Live Preview
            </span>
            <div
              style={{
                position: "relative",
                height: "220px",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid var(--admin-border-subtle)",
                display: "flex",
                alignItems: "flex-end",
                padding: "16px"
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
                  background: "linear-gradient(to top, rgba(18, 12, 14, 0.9) 0%, rgba(18, 12, 14, 0.3) 60%, transparent 100%)"
                }}
              />
              <div style={{ position: "relative", zIndex: 2, color: "#FFFFFF" }}>
                <span
                  style={{
                    background: "var(--admin-primary)",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.08em"
                  }}
                >
                  {config.promotionalOfferBanner.badge}
                </span>
                <h4 style={{ fontSize: "15px", margin: "6px 0 2px", color: "#FFFFFF", fontFamily: "var(--font-display)" }}>
                  {config.promotionalOfferBanner.title}
                </h4>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.85)", margin: "0 0 8px", lineHeight: 1.3 }}>
                  {config.promotionalOfferBanner.description}
                </p>
                <div style={{ display: "inline-block", background: "#C69244", color: "#2C1E20", padding: "5px 12px", borderRadius: "4px", fontSize: "10.5px", fontWeight: 700 }}>
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
