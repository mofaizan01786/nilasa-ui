"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    quote: "The Indigo Pleat Anarkali Suit is perfection. The zari border has a subtle, regal sheen without being overwhelming. Wore it to a family sangeet and received endless compliments.",
    author: "Ananya Sharma",
    location: "New Delhi",
    piece: "Indigo Pleat Anarkali Suit",
    rating: 5
  },
  {
    id: 2,
    quote: "Nilasa’s Chanderi Silk Co-Ord sets redefine ethnic elegance for modern working women. Super lightweight, breathable fabric, and impeccable stitching.",
    author: "Pooja Singhania",
    location: "Mumbai",
    piece: "Chanderi Silk Co-Ord Set",
    rating: 5
  },
  {
    id: 3,
    quote: "From ordering to delivery in Bangalore within 48 hours, the experience was seamless. The packaging and handwritten note made it feel truly bespoke.",
    author: "Dr. Ritu Verma",
    location: "Bangalore",
    piece: "Dusty Rose Zari Kurti Set",
    rating: 5
  }
];

export function TestimonialSlider() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? TESTIMONIALS.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === TESTIMONIALS.length - 1 ? 0 : c + 1));
  const item = TESTIMONIALS[current];

  return (
    <section className="nilasa-testimonials shell" aria-label="Customer Reviews">
      <div className="nilasa-testimonials__card">
        <div className="nilasa-testimonials__icon">
          <Quote size={32} color="var(--nilasa-gold)" />
        </div>

        {/* 5-Star Rating */}
        <div className="nilasa-testimonials__stars" aria-label="5 out of 5 stars rating">
          {[...Array(item.rating)].map((_, i) => (
            <Star key={i} size={16} fill="var(--nilasa-gold)" color="var(--nilasa-gold)" />
          ))}
        </div>

        {/* Editorial Quote */}
        <blockquote className="nilasa-testimonials__quote">
          “{item.quote}”
        </blockquote>

        {/* Author & Piece Details */}
        <div className="nilasa-testimonials__meta">
          <strong className="nilasa-testimonials__author">{item.author}</strong>
          <span className="nilasa-testimonials__dot">•</span>
          <span className="nilasa-testimonials__location">{item.location}</span>
          <span className="nilasa-testimonials__verified">✓ Verified Buyer</span>
        </div>
        <p className="nilasa-testimonials__piece">
          Purchased: <em>{item.piece}</em>
        </p>

        {/* Carousel Stepper Controls */}
        <div className="nilasa-testimonials__controls">
          <button
            type="button"
            onClick={prev}
            className="nilasa-testimonials__btn"
            aria-label="Previous review"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="nilasa-testimonials__dots">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={`nilasa-testimonials__dot-btn ${current === i ? "active" : ""}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            className="nilasa-testimonials__btn"
            aria-label="Next review"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
