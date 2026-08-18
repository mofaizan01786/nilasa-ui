"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/lib/types";
import { resolveProductImageUrl } from "@/lib/catalog";

interface ProductGalleryProps {
  productName: string;
  images: ProductImage[];
  fallbackUrl: string;
}

export function ProductGallery({ productName, images, fallbackUrl }: ProductGalleryProps) {
  const galleryList = images.length > 0
    ? [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((img) => resolveProductImageUrl(img.imageUrl) || fallbackUrl)
    : [fallbackUrl];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = galleryList[activeIndex] || fallbackUrl;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Featured Main Image Display */}
      <div
        style={{
          position: "relative",
          aspectRatio: "3/4",
          borderRadius: 16,
          overflow: "hidden",
          background: "var(--nilasa-card)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.06)"
        }}
      >
        <Image
          src={activeImage}
          alt={productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: "cover", transition: "opacity 0.2s ease" }}
        />
      </div>

      {/* Interactive Thumbnail Strip */}
      {galleryList.length > 1 && (
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
          {galleryList.map((imgUrl, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                style={{
                  position: "relative",
                  width: 72,
                  height: 96,
                  flexShrink: 0,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: isActive ? "2.5px solid var(--nilasa-gold)" : "1.5px solid #E2E8F0",
                  padding: 0,
                  background: "#F8FAFC",
                  cursor: "pointer",
                  opacity: isActive ? 1 : 0.65,
                  transition: "all 0.15s ease",
                  transform: isActive ? "scale(1.03)" : "scale(1)"
                }}
                aria-label={`View photo ${idx + 1} of ${productName}`}
              >
                <Image
                  src={imgUrl}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
