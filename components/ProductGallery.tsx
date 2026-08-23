"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ProductImage } from "@/lib/types";
import { resolveProductImageUrl } from "@/lib/catalog";
import { ChevronLeft, ChevronRight, Sparkles, ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  productName: string;
  images: ProductImage[];
  fallbackUrl: string;
}

export function ProductGallery({ productName, images, fallbackUrl }: ProductGalleryProps) {
  const galleryList =
    images.length > 0
      ? [...images]
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((img) => resolveProductImageUrl(img.imageUrl) || fallbackUrl)
      : [fallbackUrl];

  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const total = galleryList.length;
  const activeImage = galleryList[activeIndex] || fallbackUrl;

  const nextImage = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevImage = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Keyboard arrow keys navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextImage, prevImage]);

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 40) nextImage();
    if (distance < -40) prevImage();
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Hover zoom coordinate tracker
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="product-gallery-container">
      {/* 1. Left Vertical Thumbnail Column (Desktop) */}
      {total > 1 && (
        <div className="product-gallery-thumbnails">
          {galleryList.map((imgUrl, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`product-gallery-thumb-btn ${isActive ? "product-gallery-thumb-btn--active" : ""}`}
                aria-label={`View image ${idx + 1} of ${productName}`}
              >
                <Image
                  src={imgUrl}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  style={{ objectFit: "cover" }}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Center / Main Hero Image Stage */}
      <div
        className="product-gallery-main-stage"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <div className="product-gallery-image-wrapper">
          <Image
            key={activeImage}
            src={activeImage}
            alt={`${productName} - Image ${activeIndex + 1}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 560px"
            className="product-gallery-image"
            style={{
              objectFit: "cover",
              transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
              transform: isZoomed ? "scale(1.4)" : "scale(1)"
            }}
          />
        </div>

        {/* Counter Pill Badge (e.g. 1 / 4) */}
        {total > 1 && (
          <div className="product-gallery-counter">
            <span>{activeIndex + 1} / {total}</span>
          </div>
        )}

        {/* Floating Prev / Next Navigation Arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="gallery-nav-arrow gallery-nav-arrow--prev"
              aria-label="Previous photo"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="gallery-nav-arrow gallery-nav-arrow--next"
              aria-label="Next photo"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* 3. Mobile Bottom Dots (Mobile View Only) */}
      {total > 1 && (
        <div className="product-gallery-mobile-dots">
          {galleryList.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`gallery-mobile-dot ${idx === activeIndex ? "gallery-mobile-dot--active" : ""}`}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
