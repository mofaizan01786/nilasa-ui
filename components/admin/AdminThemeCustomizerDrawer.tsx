"use client";

import React from "react";
import { useAdminTheme, AdminThemePalette, AdminThemeMode } from "./AdminThemeProvider";
import { X, Sun, Moon, Palette, Check, Sparkles, Sliders, ShieldCheck } from "lucide-react";

interface PaletteOption {
  id: AdminThemePalette;
  name: string;
  desc: string;
  primary: string;
  accent: string;
  bgPreview: string;
}

const PALETTES: PaletteOption[] = [
  {
    id: "burgundy",
    name: "Royal Velvet Burgundy",
    desc: "Signature Atelier Royale edition (Default reference theme)",
    primary: "#7A2832",
    accent: "#C69244",
    bgPreview: "#FAF6F4"
  },
  {
    id: "indigo",
    name: "Midnight Indigo",
    desc: "Imperial Rajasthani deep sapphire night",
    primary: "#202A44",
    accent: "#CFA268",
    bgPreview: "#F4F6FB"
  },
  {
    id: "emerald",
    name: "Emerald Raj Heritage",
    desc: "Royal Jaipur gemstone & deep forest luxury",
    primary: "#1C3F35",
    accent: "#E2B874",
    bgPreview: "#F3F8F5"
  },
  {
    id: "rose",
    name: "Desert Rose Gold",
    desc: "Romantic Mughal blush & warm rose terracotta",
    primary: "#8C485A",
    accent: "#D4A373",
    bgPreview: "#FAF3F5"
  },
  {
    id: "amber",
    name: "Imperial Amber Zari",
    desc: "Handcrafted golden zari & rich cognac leather",
    primary: "#8A5620",
    accent: "#E9C46A",
    bgPreview: "#FAF6F0"
  }
];

export function AdminThemeCustomizerDrawer() {
  const { palette, mode, isCustomizerOpen, setIsCustomizerOpen, setPalette, setMode } = useAdminTheme();

  if (!isCustomizerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setIsCustomizerOpen(false)}
        className="admin-theme-backdrop"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(18, 12, 14, 0.45)",
          backdropFilter: "blur(4px)",
          zIndex: 99998,
          transition: "opacity 0.25s ease"
        }}
      />

      {/* Drawer */}
      <aside
        className="admin-theme-drawer"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: 420,
          background: "var(--admin-card-bg)",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.18)",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid var(--admin-border-subtle)",
          overflowY: "auto"
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--admin-border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--admin-surface-bg)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "var(--admin-primary)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Palette size={18} />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 600,
                  fontFamily: "var(--font-display)",
                  color: "var(--admin-text-main)"
                }}
              >
                Atelier Theme Studio
              </h3>
              <p style={{ margin: 0, fontSize: "11px", color: "var(--admin-text-muted)" }}>
                Live color palette & day/night customization
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCustomizerOpen(false)}
            aria-label="Close"
            style={{
              background: "none",
              border: "1px solid var(--admin-border-subtle)",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--admin-text-muted)",
              transition: "all 0.15s ease"
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Day / Night Mode Toggle */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--admin-text-muted)",
                marginBottom: 10
              }}
            >
              Lighting & Ambiance
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                background: "var(--admin-surface-bg)",
                padding: 6,
                borderRadius: 12,
                border: "1px solid var(--admin-border-subtle)"
              }}
            >
              <button
                type="button"
                onClick={() => setMode("day")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: mode === "day" ? "1px solid var(--admin-primary)" : "1px solid transparent",
                  background: mode === "day" ? "var(--admin-card-bg)" : "transparent",
                  color: mode === "day" ? "var(--admin-primary)" : "var(--admin-text-muted)",
                  fontWeight: mode === "day" ? 600 : 500,
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: mode === "day" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                  transition: "all 0.18s ease"
                }}
              >
                <Sun size={16} />
                <span>Atelier Day</span>
              </button>

              <button
                type="button"
                onClick={() => setMode("night")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: mode === "night" ? "1px solid var(--admin-primary)" : "1px solid transparent",
                  background: mode === "night" ? "var(--admin-card-bg)" : "transparent",
                  color: mode === "night" ? "var(--admin-primary)" : "var(--admin-text-muted)",
                  fontWeight: mode === "night" ? 600 : 500,
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: mode === "night" ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
                  transition: "all 0.18s ease"
                }}
              >
                <Moon size={16} />
                <span>Luxury Noir</span>
              </button>
            </div>
          </div>

          {/* Color Palettes */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--admin-text-muted)"
                }}
              >
                Royal Color Palette
              </label>
              <span style={{ fontSize: "11px", color: "var(--admin-primary)", fontWeight: 600 }}>
                {PALETTES.find((p) => p.id === palette)?.name}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PALETTES.map((item) => {
                const isSelected = palette === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPalette(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: isSelected
                        ? "1.5px solid var(--admin-primary)"
                        : "1px solid var(--admin-border-subtle)",
                      background: isSelected ? "var(--admin-primary-soft)" : "var(--admin-surface-bg)",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                      position: "relative"
                    }}
                  >
                    {/* Swatch */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: item.primary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        border: "2px solid #FFFFFF",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                      }}
                    >
                      {isSelected && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: isSelected ? "var(--admin-primary)" : "var(--admin-text-main)"
                          }}
                        >
                          {item.name}
                        </span>
                        {item.id === "burgundy" && (
                          <span
                            style={{
                              fontSize: "9px",
                              padding: "2px 6px",
                              borderRadius: 999,
                              background: "var(--admin-primary)",
                              color: "#FFFFFF",
                              fontWeight: 700,
                              letterSpacing: "0.04em"
                            }}
                          >
                            MATCHING DESIGN
                          </span>
                        )}
                      </div>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--admin-text-muted)" }}>
                        {item.desc}
                      </p>
                    </div>

                    {/* Accent Indicator */}
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: item.accent,
                        border: "1px solid rgba(0,0,0,0.1)"
                      }}
                      title="Accent Gold"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Preview Card */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--admin-text-muted)",
                marginBottom: 10
              }}
            >
              Component Preview
            </label>
            <div
              style={{
                background: "var(--admin-card-bg)",
                border: "1px solid var(--admin-border-subtle)",
                borderRadius: 14,
                padding: "16px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: "11px", color: "var(--admin-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  TOTAL ATELIER SALES
                </span>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "var(--admin-primary-soft)",
                    color: "var(--admin-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 700
                  }}
                >
                  ₹
                </span>
              </div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  color: "var(--admin-primary)",
                  marginBottom: 6
                }}
              >
                ₹48,24,600
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11px", color: "#2E7D32", fontWeight: 600 }}>
                <span>↗ +3.34% vs last week</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--admin-border-subtle)",
            background: "var(--admin-surface-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <button
            type="button"
            onClick={() => {
              setPalette("burgundy");
              setMode("day");
            }}
            style={{
              background: "none",
              border: "none",
              fontSize: "12px",
              color: "var(--admin-text-muted)",
              cursor: "pointer",
              textDecoration: "underline"
            }}
          >
            Reset to Default
          </button>

          <button
            type="button"
            onClick={() => setIsCustomizerOpen(false)}
            style={{
              background: "var(--admin-primary)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 999,
              padding: "8px 20px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
            }}
          >
            Apply Theme
          </button>
        </div>
      </aside>
    </>
  );
}
