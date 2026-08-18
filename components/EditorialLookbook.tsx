"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, Shield, Users } from "lucide-react";

export function EditorialLookbook() {
  return (
    <section className="nilasa-lookbook shell" aria-label="Brand Story & Lookbook">
      <div className="nilasa-lookbook__grid">
        {/* Left Column: Visual Portrait Story Card */}
        <div className="nilasa-lookbook__media-col">
          <div className="nilasa-lookbook__frame">
            <Image
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85"
              alt="Nilasa Atelier Heritage"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="nilasa-lookbook__img"
            />
            <div className="nilasa-lookbook__badge">
              <span className="badge-year">EST. 2026</span>
              <span className="badge-craft">HAUTE ETHNIC COUTURE</span>
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Text & Values */}
        <div className="nilasa-lookbook__story-col">
          <span className="eyebrow eyebrow--gold">OUR ATELIER HERITAGE</span>
          <h2 className="nilasa-lookbook__title">
            Where Ancient Weaves Meet Modern Grace
          </h2>
          <p className="nilasa-lookbook__description">
            Nilasa was born from a deep reverence for the artistry of Indian textiles. Every silhouette is cut with intention, weaving together the timeless poetry of Banaras zari, the weightless drape of Chanderi, and clean lines tailored for the contemporary woman.
          </p>

          <div className="nilasa-lookbook__features">
            <div className="nilasa-feature-item">
              <div className="nilasa-feature-icon">
                <Sparkles size={20} color="var(--nilasa-gold)" />
              </div>
              <div>
                <h3 className="nilasa-feature-title">Pure Chanderi & Organza Silks</h3>
                <p className="nilasa-feature-sub">Breathable natural weaves that drape gracefully through all seasons.</p>
              </div>
            </div>

            <div className="nilasa-feature-item">
              <div className="nilasa-feature-icon">
                <Shield size={20} color="var(--nilasa-gold)" />
              </div>
              <div>
                <h3 className="nilasa-feature-title">Heritage Zari Embroidery</h3>
                <p className="nilasa-feature-sub">Hand-finished metallic zari threads woven into timeless necklines.</p>
              </div>
            </div>

            <div className="nilasa-feature-item">
              <div className="nilasa-feature-icon">
                <Users size={20} color="var(--nilasa-gold)" />
              </div>
              <div>
                <h3 className="nilasa-feature-title">Empowering Master Artisans</h3>
                <p className="nilasa-feature-sub">Ethically tailored by multi-generational craftspeople in Uttar Pradesh.</p>
              </div>
            </div>
          </div>

          <div className="nilasa-lookbook__cta-wrap">
            <Link href="/about" className="button button--gold">
              Read Our Full Story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
