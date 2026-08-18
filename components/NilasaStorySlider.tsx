"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface StoryCard {
  id: string;
  tag: string;
  headline: string;
  href: string;
  imageUrl: string;
}

const DEFAULT_STORIES: StoryCard[] = [
  {
    id: "1",
    tag: "Festive Edit",
    headline: "Unlock the Secrets of Pure Chanderi",
    href: "/category/suits",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "2",
    tag: "Everyday Glamour",
    headline: "It’s time to refresh with closet staples",
    href: "/category/co-ord-sets",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "3",
    tag: "Pure Elegance",
    headline: "The new festive season is on the horizon",
    href: "/shop",
    imageUrl: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=900&q=85"
  }
];

export function NilasaStorySlider({ stories = DEFAULT_STORIES }: { stories?: StoryCard[] }) {
  return (
    <section className="nilasa-multicol-section shell" aria-label="Curated Fashion Stories">
      <div className="nilasa-multicol-grid">
        {stories.map((story) => (
          <Link key={story.id} href={story.href} className="nilasa-multicol-card">
            <div className="nilasa-multicol-card__media">
              <Image
                src={story.imageUrl}
                alt={story.headline}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="nilasa-multicol-card__img"
              />
              <div className="nilasa-multicol-card__overlay" />
            </div>

            <div className="nilasa-multicol-card__content">
              <span className="nilasa-multicol-card__tag">{story.tag}</span>
              <h3 className="nilasa-multicol-card__title">{story.headline}</h3>
              <span className="nilasa-multicol-card__link">
                <span>Check Now</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
