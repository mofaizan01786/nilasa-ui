"use client";

import React, { useState, useEffect } from "react";
import { useAdminTheme, AdminThemePalette, AdminThemeMode } from "@/components/admin/AdminThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { fetchAdminAuthSettings, updateAdminAuthSettings } from "@/lib/dotnet-backend";
import { AdminAuthSettings } from "@/lib/types";
import {
  Palette,
  Sun,
  Moon,
  Check,
  Building,
  ShieldCheck,
  Save,
  RotateCcw,
  Sparkles,
  Sliders,
  Bell,
  Globe,
  Lock,
  Smartphone,
  Layers,
  KeyRound,
  Info
} from "lucide-react";

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

export default function AdminSettingsPage() {
  const { palette, mode, setPalette, setMode } = useAdminTheme();
  const { token } = useAuth();
  const [savedToast, setSavedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Atelier theme and settings saved successfully!");

  const [atelierName, setAtelierName] = useState("Nilasa Atelier Royale");
  const [primaryLoom, setPrimaryLoom] = useState("Jaipur Main Loom & Delhi Workshop");
  const [currency, setCurrency] = useState("INR (₹)");
  const [karigarFeed, setKarigarFeed] = useState(true);

  // Admin Auth Settings State (GET/PUT /api/v1/admin/settings/auth)
  const [authSettings, setAuthSettings] = useState<AdminAuthSettings>({
    googleEnabled: false,
    googleEnabledByConfig: false,
    mobileOtpEnabled: true,
    mobileOtpEnabledByConfig: true,
    otpLength: 6,
    resendCooldownSeconds: 30,
    defaultCountryCode: "+91"
  });
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchAdminAuthSettings(token || undefined).then((settings) => {
      if (isMounted && settings) {
        setAuthSettings(settings);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleToggleMobileOtp = async () => {
    const nextVal = !authSettings.mobileOtpEnabled;
    setAuthSettings((prev) => ({ ...prev, mobileOtpEnabled: nextVal }));
    setAuthLoading(true);
    const ok = await updateAdminAuthSettings({ mobileOtpEnabled: nextVal }, token || undefined);
    setAuthLoading(false);
    if (ok) {
      setToastMessage(nextVal ? "Mobile OTP Login enabled!" : "Mobile OTP Login disabled!");
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    }
  };

  const handleToggleGoogle = async () => {
    if (!authSettings.googleEnabledByConfig) return; // disabled if backend not configured
    const nextVal = !authSettings.googleEnabled;
    setAuthSettings((prev) => ({ ...prev, googleEnabled: nextVal }));
    setAuthLoading(true);
    const ok = await updateAdminAuthSettings({ googleEnabled: nextVal }, token || undefined);
    setAuthLoading(false);
    if (ok) {
      setToastMessage(nextVal ? "Google OAuth Login enabled!" : "Google OAuth Login disabled!");
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    }
  };

  const handleSave = async () => {
    setAuthLoading(true);
    await updateAdminAuthSettings(
      {
        mobileOtpEnabled: authSettings.mobileOtpEnabled,
        googleEnabled: authSettings.googleEnabled
      },
      token || undefined
    );
    setAuthLoading(false);
    setToastMessage("Atelier theme and settings saved successfully!");
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: 600,
              fontFamily: "var(--font-display)",
              color: "var(--admin-text-main)"
            }}
          >
            Atelier Theme & Control Settings
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--admin-text-muted)" }}>
            Customize backend visual theme, color palettes, day/night lighting, and loom preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 20px",
            borderRadius: 999,
            background: "var(--admin-primary)",
            color: "#FFFFFF",
            border: "none",
            fontSize: "12.5px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 10px var(--admin-primary-glow)",
            transition: "all 0.15s ease"
          }}
        >
          <Save size={15} />
          <span>Save Preferences</span>
        </button>
      </div>

      {savedToast && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            background: "#E8F5E9",
            color: "#1E6B24",
            fontSize: "13px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid #C8E6C9"
          }}
        >
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── 1. THEME STUDIO & COLOR PALETTES ─── */}
      <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--admin-primary)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Palette size={16} />
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
              Theme Color & Lighting Ambiance
            </h3>
            <p style={{ margin: 0, fontSize: "11.5px", color: "var(--admin-text-muted)" }}>
              Switch between Royal Velvet Burgundy, Midnight Sapphire, Emerald Raj, or Luxury Noir Night.
            </p>
          </div>
        </div>

        {/* Day / Night Mode Toggles */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--admin-text-muted)",
              marginBottom: 8
            }}
          >
            Ambiance Mode
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              maxWidth: 400
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
                padding: "12px 16px",
                borderRadius: 12,
                border: mode === "day" ? "1.5px solid var(--admin-primary)" : "1px solid var(--admin-border-subtle)",
                background: mode === "day" ? "var(--admin-primary-soft)" : "var(--admin-surface-bg)",
                color: mode === "day" ? "var(--admin-primary)" : "var(--admin-text-muted)",
                fontWeight: mode === "day" ? 700 : 500,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <Sun size={17} />
              <span>Atelier Day Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("night")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px 16px",
                borderRadius: 12,
                border: mode === "night" ? "1.5px solid var(--admin-primary)" : "1px solid var(--admin-border-subtle)",
                background: mode === "night" ? "var(--admin-primary-soft)" : "var(--admin-surface-bg)",
                color: mode === "night" ? "var(--admin-primary)" : "var(--admin-text-muted)",
                fontWeight: mode === "night" ? 700 : 500,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              <Moon size={17} />
              <span>Luxury Noir Night</span>
            </button>
          </div>
        </div>

        {/* Color Palette Cards Grid */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--admin-text-muted)",
              marginBottom: 10
            }}
          >
            Royal Color Schemes
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14
            }}
          >
            {PALETTES.map((item) => {
              const isSelected = palette === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setPalette(item.id)}
                  style={{
                    padding: "14px",
                    borderRadius: 14,
                    border: isSelected ? "2px solid var(--admin-primary)" : "1px solid var(--admin-border-subtle)",
                    background: isSelected ? "var(--admin-primary-soft)" : "var(--admin-surface-bg)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: item.primary,
                          border: "2px solid #FFFFFF",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.15)"
                        }}
                      />
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: item.accent
                        }}
                      />
                    </div>
                    {isSelected && (
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "var(--admin-primary)",
                          color: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--admin-text-main)" }}>
                      {item.name}
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--admin-text-muted)", lineHeight: 1.3 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── 2. ATELIER PROFILE & LOOM CONTROLS ─── */}
      <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--admin-surface-bg)",
              color: "var(--admin-text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Building size={16} />
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
              Atelier Workshop & Karigar Feed
            </h3>
            <p style={{ margin: 0, fontSize: "11.5px", color: "var(--admin-text-muted)" }}>
              Manage master artisan loom feeds and regional currency formats.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: 6 }}>
              Atelier Brand Title
            </label>
            <input
              type="text"
              value={atelierName}
              onChange={(e) => setAtelierName(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 14px",
                borderRadius: 10,
                border: "1px solid var(--admin-border-subtle)",
                background: "var(--admin-surface-bg)",
                color: "var(--admin-text-main)",
                fontSize: "13px",
                outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "var(--admin-text-muted)", marginBottom: 6 }}>
              Primary Loom Hub
            </label>
            <input
              type="text"
              value={primaryLoom}
              onChange={(e) => setPrimaryLoom(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 14px",
                borderRadius: 10,
                border: "1px solid var(--admin-border-subtle)",
                background: "var(--admin-surface-bg)",
                color: "var(--admin-text-main)",
                fontSize: "13px",
                outline: "none"
              }}
            />
          </div>
        </div>
      </div>

      {/* ─── 3. AUTHENTICATION & LOGIN METHOD CONTROLS ─── */}
      <div className="admin-luxury-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--admin-surface-bg)",
              color: "var(--admin-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <KeyRound size={16} />
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
              Customer Authentication & Security
            </h3>
            <p style={{ margin: 0, fontSize: "11.5px", color: "var(--admin-text-muted)" }}>
              Manage customer login options, mobile SMS OTP verification, and single sign-on providers.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Mobile OTP Login Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px",
              borderRadius: 12,
              backgroundColor: "var(--admin-surface-bg)",
              border: "1px solid var(--admin-border-subtle)",
              gap: 16
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: authSettings.mobileOtpEnabled ? "var(--admin-primary-soft)" : "rgba(0,0,0,0.04)",
                  color: authSettings.mobileOtpEnabled ? "var(--admin-primary)" : "var(--admin-text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <Smartphone size={18} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--admin-text-main)" }}>
                    Mobile Phone OTP Login
                  </span>
                  <span
                    style={{
                      padding: "2px 7px",
                      borderRadius: 999,
                      fontSize: "10.5px",
                      fontWeight: 700,
                      backgroundColor: authSettings.mobileOtpEnabled ? "#E8F5E9" : "#ECEFF1",
                      color: authSettings.mobileOtpEnabled ? "#1E6B24" : "#546E7A"
                    }}
                  >
                    {authSettings.mobileOtpEnabled ? "ACTIVE" : "DISABLED"}
                  </span>
                </div>
                <p style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--admin-text-muted)", lineHeight: 1.4 }}>
                  Allows customers to sign in instantly with a 6-digit SMS verification code on their Indian mobile number (+91).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleMobileOtp}
              disabled={authLoading}
              style={{
                width: 46,
                height: 26,
                borderRadius: 999,
                backgroundColor: authSettings.mobileOtpEnabled ? "var(--admin-primary)" : "#CFD8DC",
                border: "none",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.2s ease",
                flexShrink: 0
              }}
              aria-label="Toggle Mobile OTP Login"
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: "#FFFFFF",
                  position: "absolute",
                  top: 3,
                  left: authSettings.mobileOtpEnabled ? 23 : 3,
                  transition: "all 0.2s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                }}
              />
            </button>
          </div>

          {/* Google OAuth Login Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px",
              borderRadius: 12,
              backgroundColor: "var(--admin-surface-bg)",
              border: "1px solid var(--admin-border-subtle)",
              opacity: authSettings.googleEnabledByConfig ? 1 : 0.65,
              gap: 16
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: authSettings.googleEnabled ? "var(--admin-primary-soft)" : "rgba(0,0,0,0.04)",
                  color: authSettings.googleEnabled ? "var(--admin-primary)" : "var(--admin-text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <Globe size={18} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--admin-text-main)" }}>
                    Google Single Sign-On (OAuth 2.0)
                  </span>
                  {!authSettings.googleEnabledByConfig ? (
                    <span
                      style={{
                        padding: "2px 7px",
                        borderRadius: 999,
                        fontSize: "10.5px",
                        fontWeight: 600,
                        backgroundColor: "#FFF3E0",
                        color: "#E65100"
                      }}
                    >
                      Requires Backend Config
                    </span>
                  ) : (
                    <span
                      style={{
                        padding: "2px 7px",
                        borderRadius: 999,
                        fontSize: "10.5px",
                        fontWeight: 700,
                        backgroundColor: authSettings.googleEnabled ? "#E8F5E9" : "#ECEFF1",
                        color: authSettings.googleEnabled ? "#1E6B24" : "#546E7A"
                      }}
                    >
                      {authSettings.googleEnabled ? "ACTIVE" : "DISABLED"}
                    </span>
                  )}
                </div>
                <p style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--admin-text-muted)", lineHeight: 1.4 }}>
                  One-tap customer sign-in via Google accounts.{" "}
                  {!authSettings.googleEnabledByConfig && "Set Google Client ID in backend appsettings to activate."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleGoogle}
              disabled={authLoading || !authSettings.googleEnabledByConfig}
              style={{
                width: 46,
                height: 26,
                borderRadius: 999,
                backgroundColor: authSettings.googleEnabled ? "var(--admin-primary)" : "#CFD8DC",
                border: "none",
                cursor: !authSettings.googleEnabledByConfig ? "not-allowed" : "pointer",
                position: "relative",
                transition: "all 0.2s ease",
                flexShrink: 0
              }}
              aria-label="Toggle Google Login"
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: "#FFFFFF",
                  position: "absolute",
                  top: 3,
                  left: authSettings.googleEnabled ? 23 : 3,
                  transition: "all 0.2s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
