"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Feather, Shield } from "lucide-react";
import { NilasaScrollReveal } from "@/components/NilasaScrollReveal";
import { NilasaParallaxCard } from "@/components/NilasaParallaxCard";

export function NilasaCraftsmanshipStory() {
  return (
    <section className="nilasa-craft-section shell" aria-label="Atelier Craftsmanship">
      <div className="nilasa-craft-grid">
        {/* Left Column: Hero Editorial Artwork with Floating Badge */}
        <NilasaScrollReveal animation="fade-right" duration={900} className="nilasa-craft-media-wrap">
          <NilasaParallaxCard maxTilt={5} scale={1.015} className="nilasa-craft-card">
            <div className="nilasa-craft-image-box">
              <Image
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=90"
                alt="Master Weavers Handcrafting Zari Silk"
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
                className="nilasa-craft-image"
              />
              <div className="nilasa-craft-gradient-overlay" />
            </div>

            {/* Floating Luxury Seal Badge */}
            <div className="nilasa-craft-seal-badge">
              <Sparkles size={16} color="#8E6EA8" />
              <div>
                <span className="seal-tag">100% HANDLOOM</span>
                <span className="seal-sub">Pure Chanderi & Organza</span>
              </div>
            </div>
          </NilasaParallaxCard>
        </NilasaScrollReveal>

        {/* Right Column: Editorial Narrative & Values */}
        <div className="nilasa-craft-content-wrap">
          <NilasaScrollReveal animation="fade-up" delay={100} duration={800}>
            <span className="nilasa-craft-eyebrow">OUR ATELIER HERITAGE</span>
            <h2 className="nilasa-craft-title">
              Where Ancient Loom Weaves Meet Modern Haute Couture
            </h2>
            <p className="nilasa-craft-desc">
              Every Nilasa silhouette is born in the hands of master artisans. From the rhythmic clatter of traditional handlooms to the meticulous placement of zari resham threads, we preserve India's timeless textile legacy with contemporary grace.
            </p>
          </NilasaScrollReveal>

          {/* Value Badges */}
          <div className="nilasa-craft-pillars">
            <NilasaScrollReveal animation="fade-up" delay={200} duration={800} className="nilasa-craft-pillar">
              <div className="pillar-icon-box">
                <Feather size={20} color="#8E6EA8" />
              </div>
              <div>
                <h4 className="pillar-title">Pure Artisanal Weaves</h4>
                <p className="pillar-desc">Woven with featherlight Chanderi silk and breathable handloom cottons.</p>
              </div>
            </NilasaScrollReveal>

            <NilasaScrollReveal animation="fade-up" delay={300} duration={800} className="nilasa-craft-pillar">
              <div className="pillar-icon-box">
                <Shield size={20} color="#8E6EA8" />
              </div>
              <div>
                <h4 className="pillar-title">Heirloom Durability</h4>
                <p className="pillar-desc">Designed with timeless cuts and reinforced seam craftsmanship to last generations.</p>
              </div>
            </NilasaScrollReveal>
          </div>

          <NilasaScrollReveal animation="fade-up" delay={400} duration={800}>
            <Link href="/shop" className="nilasa-craft-cta-btn">
              <span>EXPLORE THE ATELIER COLLECTION</span>
              <ArrowRight size={16} />
            </Link>
          </NilasaScrollReveal>
        </div>
      </div>
    </section>
  );
}
