"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, Check, ShieldCheck } from "lucide-react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("nilasa-cookie-consent");
      if (!consent) {
        // Small delay to ensure smooth entry animation
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage access
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem("nilasa-cookie-consent", "all");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem("nilasa-cookie-consent", "essential");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        right: 20,
        maxWidth: 520,
        margin: "0 auto",
        backgroundColor: "#FFFFFF",
        color: "var(--ink-primary)",
        border: "1px solid var(--nilasa-border)",
        borderRadius: 12,
        boxShadow: "0 16px 36px -6px rgba(32, 43, 69, 0.16), 0 4px 12px rgba(0,0,0,0.06)",
        padding: "20px 22px",
        zIndex: 9999,
        animation: "slideUpFade 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards"
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            backgroundColor: "var(--nilasa-card)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            border: "1px solid var(--nilasa-border)"
          }}
        >
          <Cookie size={20} color="var(--nilasa-gold)" />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <h4
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "16px",
                fontWeight: 600,
                margin: 0,
                color: "var(--nilasa-indigo)"
              }}
            >
              We Value Your Privacy
            </h4>
            <button
              onClick={handleEssentialOnly}
              aria-label="Dismiss cookie notice"
              style={{
                background: "none",
                border: "none",
                padding: 4,
                cursor: "pointer",
                color: "var(--ink-muted)",
                display: "flex"
              }}
            >
              <X size={16} />
            </button>
          </div>

          <p
            style={{
              fontSize: "13px",
              lineHeight: 1.5,
              color: "var(--ink-muted)",
              margin: "0 0 14px 0"
            }}
          >
            Nilasa uses cookies to secure your shopping bag, preserve your bag items, and personalize your ethnic wear experience. Read our{" "}
            <Link
              href="/privacy-policy"
              style={{
                color: "var(--nilasa-indigo)",
                textDecoration: "underline",
                fontWeight: 500
              }}
            >
              Privacy Policy
            </Link>{" "}
            for details.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={handleAcceptAll}
              style={{
                backgroundColor: "var(--nilasa-indigo)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 6,
                padding: "8px 18px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "background-color 0.15s ease"
              }}
            >
              <Check size={14} strokeWidth={2.5} />
              <span>Accept All Cookies</span>
            </button>

            <button
              onClick={handleEssentialOnly}
              style={{
                backgroundColor: "transparent",
                color: "var(--ink-primary)",
                border: "1px solid var(--nilasa-border)",
                borderRadius: 6,
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background-color 0.15s ease"
              }}
            >
              Essential Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
