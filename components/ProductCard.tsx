"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice, getProductImage, resolveProductImageUrl } from "@/lib/catalog";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { Heart, ShoppingBag, Check, Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
  activeColor?: string;
  activeSize?: string;
}

export function ProductCard({ product, activeColor, activeSize }: ProductCardProps) {
  // Find matching variant based on active filters (color / size)
  const matchedVariant = (() => {
    if (!product.variants || product.variants.length === 0) return null;

    const hasColor = activeColor && activeColor !== "all" && activeColor.trim() !== "";
    const hasSize = activeSize && activeSize !== "all" && activeSize.trim() !== "";

    if (hasColor && hasSize) {
      const matchBoth = product.variants.find(
        (v) =>
          v.color?.toLowerCase().includes(activeColor.toLowerCase().trim()) &&
          v.size?.toLowerCase() === activeSize.toLowerCase().trim()
      );
      if (matchBoth) return matchBoth;
    }

    if (hasColor) {
      const matchColor = product.variants.find(
        (v) => v.color?.toLowerCase().includes(activeColor.toLowerCase().trim())
      );
      if (matchColor) return matchColor;
    }

    if (hasSize) {
      const matchSize = product.variants.find(
        (v) => v.size?.toLowerCase() === activeSize.toLowerCase().trim()
      );
      if (matchSize) return matchSize;
    }

    return product.variants[0];
  })();

  // Resolve matching image:
  // 1. Variant's specific imageUrl if available
  // 2. Or default getProductImage
  const image =
    (matchedVariant?.imageUrl && resolveProductImageUrl(matchedVariant.imageUrl)) ||
    getProductImage(product);

  const { add } = useCart();
  const { isWishlisted: checkWishlisted, toggle: toggleWishlist } = useWishlist();
  const prodId = product.productId || (typeof product.id === "number" ? product.id : 1);
  const isWishlisted = checkWishlisted(prodId);
  const [added, setAdded] = useState(false);

  // Derive badge styling from product data or merchandising flags
  let badgeText = product.badge;
  let badgeType = product.badgeType;

  if (!badgeText) {
    if (product.isBestseller) {
      badgeText = "BESTSELLER";
      badgeType = "gold";
    } else if (product.isNewArrival) {
      badgeText = "NEW ARRIVAL";
      badgeType = "emerald";
    } else if (product.isFeatured) {
      badgeText = "FEATURED";
      badgeType = "lavender";
    } else if (product.discountPercent && product.discountPercent > 0) {
      badgeText = `${Math.round(product.discountPercent)}% OFF`;
      badgeType = "gold";
    }
  }

  const isOliveBadge =
    badgeType === "gold" ||
    badgeText?.toUpperCase().includes("BESTSELLER") ||
    badgeText?.toUpperCase().includes("LEFT") ||
    badgeText?.toUpperCase().includes("HOT");

  const isEmeraldBadge =
    badgeType === "emerald" ||
    badgeText?.toUpperCase().includes("NEW");

  const isLavenderBadge =
    badgeType === "lavender" ||
    badgeText?.toUpperCase().includes("FESTIVE") ||
    badgeText?.toUpperCase().includes("FEATURED") ||
    badgeText?.toUpperCase().includes("LAVENDER");

  // Determine color swatch & name
  const colorName =
    matchedVariant?.color ||
    product.color ||
    product.variants?.[0]?.color ||
    "Sage Green";

  const colorLower = colorName.toLowerCase();
  const colorCode =
    colorLower.includes("lavender") || colorLower.includes("purple") || colorLower.includes("lilac")
      ? "#A78BFA"
      : colorLower.includes("rose") || colorLower.includes("pink") || colorLower.includes("blush")
      ? "#F472B6"
      : colorLower.includes("indigo") || colorLower.includes("blue") || colorLower.includes("navy")
      ? "#2563EB"
      : colorLower.includes("emerald") || colorLower.includes("forest")
      ? "#047857"
      : colorLower.includes("olive") || colorLower.includes("mehndi")
      ? "#4D6345"
      : colorLower.includes("gold") || colorLower.includes("mustard") || colorLower.includes("yellow")
      ? "#B8912E"
      : colorLower.includes("ivory") || colorLower.includes("white") || colorLower.includes("cream")
      ? "#F7F3ED"
      : colorLower.includes("red") || colorLower.includes("maroon") || colorLower.includes("wine")
      ? "#DC2626"
      : colorLower.includes("black") || colorLower.includes("charcoal")
      ? "#111827"
      : "#7B8B6F"; // Default Sage Green

  const effectivePrice = matchedVariant?.price || product.basePrice;

  // Compare at price (mrp or estimated original price)
  const originalPrice =
    product.mrp && product.mrp > effectivePrice
      ? product.mrp
      : effectivePrice
      ? Math.round(effectivePrice * 1.32)
      : null;

  // Tags list
  const tagsList = product.tags
    ? product.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
    : [];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    add({
      productId: prodId,
      name: product.name,
      slug: product.slug,
      basePrice: effectivePrice,
      size: matchedVariant?.size || product.variants?.[0]?.size || "M",
      quantity: 1,
      image
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      productId: prodId,
      name: product.name,
      slug: product.slug,
      basePrice: effectivePrice,
      image,
      categoryName: product.categoryName,
      fabric: product.fabric,
      badge: badgeText,
      badgeType: badgeType,
      inStock: true
    });
  };

  return (
    <article className="mobile-product-card">
      <Link href={`/product/${product.slug}`} className="mobile-product-card__link">
        {/* Product Media Container */}
        <div className="mobile-product-card__media">
          <Image
            src={image}
            alt={`${product.name} - Nilasa Womenswear`}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="mobile-product-card__image"
          />

          {/* Top-Left Status Badge */}
          {badgeText && (
            <span
              className={`mobile-product-card__badge ${
                isEmeraldBadge
                  ? "badge-emerald"
                  : isLavenderBadge
                  ? "badge-lavender"
                  : "badge-olive"
              }`}
            >
              {badgeText}
            </span>
          )}

          {/* Top-Right Floating Wishlist Heart */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`mobile-product-card__wishlist ${isWishlisted ? "wishlisted" : ""}`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={15}
              fill={isWishlisted ? "#EF4444" : "none"}
              color={isWishlisted ? "#EF4444" : "#2C3527"}
              strokeWidth={isWishlisted ? 2.5 : 1.8}
            />
          </button>
        </div>

        {/* Product Details Body */}
        <div className="mobile-product-card__body">
          {/* Optional Tag Chips or Category Label */}
          {tagsList.length > 0 && (
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "4px" }}>
              {tagsList.slice(0, 2).map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "var(--ink-muted)",
                    backgroundColor: "rgba(198, 146, 68, 0.12)",
                    padding: "2px 6px",
                    borderRadius: "4px"
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <h3 className="mobile-product-card__title" title={product.name}>
            {product.name}
          </h3>

          <div className="mobile-product-card__pricing" style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span className="mobile-product-card__price">{formatPrice(product.basePrice)}</span>
            {originalPrice && originalPrice > product.basePrice && (
              <span className="mobile-product-card__original-price">
                {formatPrice(originalPrice)}
              </span>
            )}
            {product.discountPercent && product.discountPercent > 0 && (
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#15803D" }}>
                {Math.round(product.discountPercent)}% OFF
              </span>
            )}
          </div>

          {/* Average Rating indicator if present */}
          {product.averageRating !== undefined && product.averageRating > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "3px", fontSize: "11px", color: "var(--ink-muted)" }}>
              <Star size={12} fill="#D97706" color="#D97706" />
              <span style={{ fontWeight: 600, color: "var(--ink-primary)" }}>{product.averageRating.toFixed(1)}</span>
              {product.reviewCount ? <span>({product.reviewCount})</span> : null}
            </div>
          )}

          {/* Bottom Swatch & Add to Bag Row */}
          <div className="mobile-product-card__footer">
            <div className="mobile-product-card__swatch">
              <span
                className="color-dot"
                style={{ backgroundColor: colorCode }}
              />
              <span className="color-label">{colorName}</span>
            </div>

            <button
              type="button"
              onClick={handleQuickAdd}
              className={`mobile-product-card__quick-add ${added ? "added" : ""}`}
              aria-label="Quick add product to shopping bag"
            >
              {added ? (
                <>
                  <Check size={14} />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={14} />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}
