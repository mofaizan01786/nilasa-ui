"use client";

import Image from "next/image";
import Link from "next/link";

export function NilasaAtelierStory() {
  return (
    <section className="nilasa-parallax" aria-label="Our Story & Atelier">
      <div className="nilasa-parallax__bg">
        <Image
          src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=2000&q=85"
          alt="Nilasa Atelier Craftsmanship"
          fill
          sizes="100vw"
          className="nilasa-parallax__image"
        />
        <div className="nilasa-parallax__overlay" />
      </div>

      <div className="nilasa-parallax__content shell">
        <span className="nilasa-parallax__subtitle">OUR STORY</span>
        <h2 className="nilasa-parallax__title">
          An understated collection of contemporary pieces where exceptional materials meet timeless ethnic design.
        </h2>
        <div className="nilasa-parallax__cta">
          <Link href="/shop" className="nilasa-parallax__btn">
            <span>DISCOVER THE ATELIER</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
