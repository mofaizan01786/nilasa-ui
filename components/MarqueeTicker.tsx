"use client";

import { useEffect, useState } from "react";
import { fetchBannersConfig } from "@/lib/api";

const DEFAULT_HIGHLIGHTS = [
  "Complimentary Express Shipping Across India",
  "Handcrafted with 100% Pure Chanderi & Banarasi Silk",
  "Artisanal Zari Embroidery from Uttar Pradesh",
  "Effortless 7-Day Hassle-Free Exchanges",
  "Bespoke Bridal & Festive Tailoring"
];

export function MarqueeTicker() {
  const [highlights, setHighlights] = useState<string[]>(DEFAULT_HIGHLIGHTS);

  useEffect(() => {
    fetchBannersConfig()
      .then((cfg) => {
        if (cfg?.marqueeHighlights && cfg.marqueeHighlights.length > 0) {
          setHighlights(cfg.marqueeHighlights);
        }
      })
      .catch(() => {});
  }, []);

  const items = [...highlights, ...highlights];

  return (
    <section className="nilasa-marquee" aria-label="Brand Highlights Ticker">
      <div
        className="nilasa-marquee__track"
        style={{ animationDuration: `${Math.max(25, highlights.length * 6)}s` }}
      >
        {items.map((text, idx) => (
          <span key={idx} className="nilasa-marquee__item">
            <span className="nilasa-marquee__bullet">✦</span>
            <span className="nilasa-marquee__text">{text}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
