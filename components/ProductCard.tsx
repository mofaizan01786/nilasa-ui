"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { formatPrice, getProductImage } from "@/lib/catalog";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { Heart } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const image = getProductImage(product);
  const { add } = useCart();
  const { isWishlisted: checkWishlisted, toggle: toggleWishlist } = useWishlist();
  const prodId = product.productId || (typeof product.id === "number" ? product.id : 1);
  const isWishlisted = checkWishlisted(prodId);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Available sizes
  const sizes =
    product.variants && product.variants.length > 0
      ? product.variants.map((v) => v.size)
      : ["S", "M", "L", "XL"];

  // Derive badge styling
  const badgeText = product.badge;
  const isSale =
    badgeText?.toUpperCase().includes("SALE") ||
    badgeText?.toUpperCase().includes("OFF") ||
    badgeText?.toUpperCase().includes("%");

  // Compare at price (estimated original price for discount tag)
  const originalPrice = product.basePrice ? Math.round(product.basePrice * 1.35) : null;

  const handleSizeAdd = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(size);

    add({
      productId: prodId,
      name: product.name,
      slug: product.slug,
      basePrice: product.basePrice,
      size,
      quantity: 1,
      image
    });

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setSelectedSize(null);
    }, 1800);
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
    <article className="nilasa-product-card">
      <Link href={`/product/${product.slug}`} className="nilasa-product-card__link">
        {/* Product Media Container (Aspect Ratio 3:4) */}
        <div className="nilasa-product-card__media">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="nilasa-product-card__image"
          />

          {/* Top-Left Custom Status Badge */}
          {badgeText && (
            <span
              className={`nilasa-product-card__badge ${
                isSale ? "badge-sale" : "badge-default"
              }`}
            >
              {badgeText}
            </span>
          )}

          {/* Top-Right Floating Wishlist Heart */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`nilasa-product-card__wishlist ${isWishlisted ? "active" : ""}`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={16}
              fill={isWishlisted ? "#EF4444" : "none"}
              color={isWishlisted ? "#EF4444" : "#212121"}
              strokeWidth={isWishlisted ? 2.5 : 1.8}
            />
          </button>

          {/* Slide-Up Quick Size Selector on Hover */}
          <div className="nilasa-product-card__quick-size">
            <span className="quick-size-label">
              {added ? `Added Size ${selectedSize}!` : "Select Size:"}
            </span>
            <div className="quick-size-pills">
              {sizes.slice(0, 4).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={(e) => handleSizeAdd(e, s)}
                  className={`quick-size-pill ${selectedSize === s ? "selected" : ""}`}
                  aria-label={`Add size ${s} to cart`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details Body */}
        <div className="nilasa-product-card__body">
          <h3 className="nilasa-product-card__title" title={product.name}>
            {product.name}
          </h3>

          <div className="nilasa-product-card__pricing">
            <span className="nilasa-product-card__price">
              {formatPrice(product.basePrice)}
            </span>
            {originalPrice && (
              <span className="nilasa-product-card__original-price">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
