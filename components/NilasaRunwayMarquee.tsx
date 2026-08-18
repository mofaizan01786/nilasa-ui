"use client";

import Image from "next/image";

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85",
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85",
  "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=85",
  "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=85",
  "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=85",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85"
];

export function NilasaRunwayMarquee() {
  const images = [...GALLERY_IMAGES, ...GALLERY_IMAGES];

  return (
    <section className="nilasa-marquee-gallery" aria-label="Visual Runway Gallery">
      <div className="nilasa-marquee-gallery__track">
        {images.map((src, idx) => (
          <div key={idx} className="nilasa-marquee-gallery__item">
            <Image
              src={src}
              alt="Nilasa Festive Lookbook"
              fill
              sizes="(max-width: 768px) 45vw, 220px"
              className="nilasa-marquee-gallery__image"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
