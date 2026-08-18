"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { formatPrice, getProductImage } from "@/lib/catalog";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { Heart, ShoppingBag, Check } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const image = getProductImage(product);
  const { add } = useCart();
  const { isWishlisted: checkWishlisted, toggle: toggleWishlist } = useWishlist();
  const prodId = product.productId || (typeof product.id === "number" ? product.id : 1);
  const isWishlisted = checkWishlisted(prodId);
  const [added, setAdded] = useState(false);

  // Derive badge styling from product data or fallback
  const badgeText = product.badge;
  const isOliveBadge =
    badgeText?.toUpperCase().includes("BESTSELLER") ||
    badgeText?.toUpperCase().includes("LEFT") ||
    badgeText?.toUpperCase().includes("HOT");
  const isLavenderBadge =
    badgeText?.toUpperCase().includes("NEW") ||
    badgeText?.toUpperCase().includes("FESTIVE") ||
    badgeText?.toUpperCase().includes("LAVENDER");

  // Determine color swatch & name
  const colorName = product.color || "Sage Green";
  const colorCode =
    colorName.toLowerCase().includes("lavender") || colorName.toLowerCase().includes("purple")
      ? "#A78BFA"
      : colorName.toLowerCase().includes("rose") || colorName.toLowerCase().includes("pink")
      ? "#F472B6"
      : colorName.toLowerCase().includes("indigo") || colorName.toLowerCase().includes("blue")
      ? "#3B82F6"
      : colorName.toLowerCase().includes("mehndi") || colorName.toLowerCase().includes("olive")
      ? "#4D6345"
      : "#7B8B6F"; // Default Sage Green

  // Compare at price (estimated original price for discount tag)
  const originalPrice = product.basePrice ? Math.round(product.basePrice * 1.32) : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    add({
      productId: prodId,
      name: product.name,
      slug: product.slug,
      basePrice: product.basePrice,
      size: product.variants?.[0]?.size || "M",
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
      basePrice: product.basePrice,
      image,
      categoryName: product.categoryName,
      fabric: product.fabric,
      badge: product.badge,
      badgeType: product.badgeType,
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
                isOliveBadge ? "badge-olive" : isLavenderBadge ? "badge-lavender" : "badge-olive"
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
          <h3 className="mobile-product-card__title" title={product.name}>
            {product.name}
          </h3>

          <div className="mobile-product-card__pricing">
            <span className="mobile-product-card__price">{formatPrice(product.basePrice)}</span>
            {originalPrice && (
              <span className="mobile-product-card__original-price">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

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
              aria-label={`Add ${product.name} to shopping bag`}
              title="Quick Add to Bag"
            >
              {added ? <Check size={14} color="#10B981" /> : <ShoppingBag size={14} color="#1A1D20" />}
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}
