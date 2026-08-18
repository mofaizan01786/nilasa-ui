"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PromotionalOfferBannerConfig } from "@/lib/types";
import { Copy, Check, Sparkles, ArrowRight } from "lucide-react";

interface PromotionalBannerProps {
  banner?: PromotionalOfferBannerConfig;
}

export function PromotionalBanner({ banner }: PromotionalBannerProps) {
  const [copied, setCopied] = useState(false);

  if (!banner || !banner.isActive) {
    return null;
  }

  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    if (banner.code) {
      navigator.clipboard.writeText(banner.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section className="shell" style={{ margin: "40px auto 70px" }}>
      <div
        className="promotional-offer-card"
        style={{
          background: "linear-gradient(135deg, #151D30 0%, #1E273F 100%)",
          border: "1px solid rgba(212, 178, 88, 0.4)",
          borderRadius: "18px",
          overflow: "hidden",
          boxShadow: "0 16px 40px -10px rgba(21, 29, 48, 0.25)",
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          alignItems: "stretch"
        }}
      >
        {/* Content Left Column */}
        <div
          style={{
            padding: "clamp(24px, 5vw, 44px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
        >
          {banner.badge && (
            <div style={{ marginBottom: "14px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(212, 178, 88, 0.15)",
                  border: "1px solid rgba(212, 178, 88, 0.5)",
                  color: "#D4B258",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase"
                }}
              >
                <Sparkles size={11} />
                <span>{banner.badge}</span>
              </span>
            </div>
          )}

          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.4rem, 2.5vw, 1.85rem)",
              color: "#FAF7F2",
              margin: "0 0 14px",
              lineHeight: 1.25
            }}
          >
            {banner.title}
          </h3>

          <p
            style={{
              fontSize: "0.95rem",
              color: "rgba(250, 247, 242, 0.8)",
              lineHeight: 1.6,
              margin: "0 0 24px",
              maxWidth: "520px"
            }}
          >
            {banner.description}
          </p>

          {/* Action Row with Copyable Coupon Code */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              flexWrap: "wrap"
            }}
          >
            {banner.code && (
              <div
                onClick={handleCopyCode}
                title="Click to copy coupon code"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#FAF7F2",
                  border: "1px dashed var(--nilasa-gold)",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--nilasa-indigo)",
                    letterSpacing: "0.1em"
                  }}
                >
                  {banner.code}
                </span>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    color: copied ? "#10B981" : "var(--nilasa-gold)",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: 0
                  }}
                  aria-label="Copy code"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: copied ? "#059669" : "#6B7280",
                    fontWeight: 600
                  }}
                >
                  {copied ? "Copied!" : "Copy"}
                </span>
              </div>
            )}

            <Link
              href={banner.ctaHref || "/shop"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #D4B258 0%, #B8912E 100%)",
                color: "#151D30",
                fontSize: "0.82rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(212, 178, 88, 0.3)"
              }}
            >
              <span>{banner.ctaLabel || "Shop Now"}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Media Right Column */}
        <div
          style={{
            position: "relative",
            minHeight: "260px",
            borderLeft: "1px solid rgba(212, 178, 88, 0.25)"
          }}
        >
          <Image
            src={
              banner.imageUrl ||
              "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85"
            }
            alt={banner.title}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 40vw"
          />
        </div>
      </div>
    </section>
  );
}
