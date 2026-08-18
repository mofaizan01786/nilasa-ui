"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import type { Product } from "@/lib/types";
import { getProductImage } from "@/lib/catalog";
import {
  ShoppingBag,
  Ruler,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  X,
  Zap
} from "lucide-react";

interface AddToBagProps {
  product: Product;
}

export function AddToBag({ product }: AddToBagProps) {
  const router = useRouter();
  const { add } = useCart();

  // Determine available sizes from variants or fallback
  const variantSizes = product.variants && product.variants.length > 0
    ? Array.from(new Set(product.variants.map((v) => v.size.toUpperCase())))
    : ["XS", "S", "M", "L", "XL", "XXL"];

  const [selectedSize, setSelectedSize] = useState(variantSizes[0] || "M");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Check stock for selected variant
  const selectedVariant = product.variants?.find(
    (v) => v.size.toUpperCase() === selectedSize.toUpperCase()
  );
  const stock = selectedVariant ? selectedVariant.stockQuantity : 10;
  const isOutOfStock = stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    add({
      productId: product.productId || product.id || 0,
      variantId: selectedVariant?.productVariantId,
      name: product.name,
      slug: product.slug,
      basePrice: selectedVariant?.price || product.basePrice,
      size: selectedSize,
      quantity: quantity,
      image: getProductImage(product)
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2400);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    add({
      productId: product.productId || product.id || 0,
      variantId: selectedVariant?.productVariantId,
      name: product.name,
      slug: product.slug,
      basePrice: selectedVariant?.price || product.basePrice,
      size: selectedSize,
      quantity: quantity,
      image: getProductImage(product)
    });
    router.push("/checkout");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 8 }}>
      {/* Size Selector Header */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--nilasa-indigo)"
            }}
          >
            Select Size: <span style={{ color: "var(--nilasa-gold)", fontWeight: 700 }}>{selectedSize}</span>
          </span>

          <button
            type="button"
            onClick={() => setSizeGuideOpen(true)}
            style={{
              background: "none",
              border: "none",
              color: "var(--nilasa-indigo)",
              fontSize: "12px",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0
            }}
          >
            <Ruler size={14} color="var(--nilasa-gold)" />
            <span>Size Guide</span>
          </button>
        </div>

        {/* Size Pills Grid */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10
          }}
          role="group"
          aria-label="Select garment size"
        >
          {variantSizes.map((size) => {
            const isSelected = selectedSize === size;
            const variant = product.variants?.find((v) => v.size.toUpperCase() === size.toUpperCase());
            const out = variant && variant.stockQuantity <= 0;

            return (
              <button
                key={size}
                type="button"
                disabled={out}
                onClick={() => setSelectedSize(size)}
                aria-pressed={isSelected}
                style={{
                  minWidth: 52,
                  height: 44,
                  padding: "0 14px",
                  borderRadius: 8,
                  border: isSelected
                    ? "2px solid var(--nilasa-indigo)"
                    : "1px solid var(--nilasa-border)",
                  backgroundColor: isSelected
                    ? "var(--nilasa-indigo)"
                    : out
                    ? "#F5F5F5"
                    : "#FFFFFF",
                  color: isSelected
                    ? "#FFFFFF"
                    : out
                    ? "#A0A0A0"
                    : "var(--ink-primary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  fontWeight: isSelected ? 700 : 600,
                  cursor: out ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: out ? "line-through" : "none",
                  transition: "all 0.15s ease",
                  boxShadow: isSelected ? "0 4px 12px rgba(32, 43, 69, 0.15)" : "none"
                }}
              >
                {size}
              </button>
            );
          })}
        </div>

        {/* Stock Urgency Tag */}
        <div style={{ marginTop: 10, fontSize: "12px" }}>
          {isOutOfStock ? (
            <span style={{ color: "var(--status-danger)", fontWeight: 600 }}>
              ● Out of Stock in size {selectedSize}
            </span>
          ) : stock <= 5 ? (
            <span style={{ color: "#B45309", fontWeight: 600 }}>
              🔥 Only {stock} left in size {selectedSize} — order soon!
            </span>
          ) : (
            <span style={{ color: "#1E8E5A", fontWeight: 500 }}>
              ✓ In Stock • Ready for dispatch within 24 hours
            </span>
          )}
        </div>
      </div>

      {/* Quantity & CTA Buttons Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Quantity Selector */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              border: "1px solid var(--nilasa-border)",
              borderRadius: 8,
              backgroundColor: "#FFFFFF",
              height: 48
            }}
          >
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              style={{
                width: 40,
                height: "100%",
                background: "none",
                border: "none",
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--nilasa-indigo)",
                cursor: quantity <= 1 ? "not-allowed" : "pointer"
              }}
            >
              −
            </button>
            <span
              style={{
                minWidth: 32,
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--ink-primary)"
              }}
            >
              {quantity}
            </span>
            <button
              type="button"
              disabled={quantity >= stock}
              onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
              style={{
                width: 40,
                height: "100%",
                background: "none",
                border: "none",
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--nilasa-indigo)",
                cursor: quantity >= stock ? "not-allowed" : "pointer"
              }}
            >
              +
            </button>
          </div>

          {/* Primary Add to Bag Button */}
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 8,
              border: "1px solid var(--nilasa-indigo)",
              backgroundColor: added ? "#1E8E5A" : "var(--nilasa-indigo)",
              color: "#FFFFFF",
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: isOutOfStock ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 6px 16px rgba(32, 43, 69, 0.12)"
            }}
          >
            {added ? (
              <>
                <Check size={16} strokeWidth={2.5} />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} strokeWidth={2} />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>

        {/* Secondary Instant Buy Now Button */}
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleBuyNow}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 8,
            border: "1px solid var(--nilasa-gold)",
            backgroundColor: "var(--nilasa-gold)",
            color: "#FFFFFF",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: isOutOfStock ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 14px var(--nilasa-gold-glow)"
          }}
        >
          <Zap size={16} strokeWidth={2} />
          <span>Buy It Now</span>
        </button>
      </div>

      {/* Assurance Icons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          paddingTop: 16,
          borderTop: "1px solid var(--nilasa-border)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "12px", color: "var(--ink-muted)" }}>
          <Truck size={16} color="var(--nilasa-gold)" />
          <span>Free Pan-India Express Delivery</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "12px", color: "var(--ink-muted)" }}>
          <RotateCcw size={16} color="var(--nilasa-gold)" />
          <span>7-Day Easy Returns & Exchanges</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "12px", color: "var(--ink-muted)" }}>
          <ShieldCheck size={16} color="var(--nilasa-gold)" />
          <span>100% Authentic Artisanal Fabrics</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "12px", color: "var(--ink-muted)" }}>
          <Check size={16} color="var(--nilasa-gold)" />
          <span>Cash On Delivery & UPI Available</span>
        </div>
      </div>

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Garment Size Guide"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(21, 29, 48, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              border: "1px solid var(--nilasa-border)",
              maxWidth: 580,
              width: "100%",
              padding: "28px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "var(--nilasa-indigo)",
                    margin: "0 0 4px 0"
                  }}
                >
                  Size & Measurement Guide
                </h3>
                <p style={{ fontSize: "12px", color: "var(--ink-muted)", margin: 0 }}>
                  Standard body measurements in inches (all Nilasa ethnic silhouettes)
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                aria-label="Close size guide"
                style={{
                  background: "none",
                  border: "none",
                  padding: 6,
                  cursor: "pointer",
                  color: "var(--ink-muted)"
                }}
              >
                <X size={18} />
              </button>
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
                textAlign: "center"
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "var(--nilasa-card)", color: "var(--nilasa-indigo)" }}>
                  <th style={{ padding: "10px", borderBottom: "2px solid var(--nilasa-border)" }}>Size</th>
                  <th style={{ padding: "10px", borderBottom: "2px solid var(--nilasa-border)" }}>Bust (in)</th>
                  <th style={{ padding: "10px", borderBottom: "2px solid var(--nilasa-border)" }}>Waist (in)</th>
                  <th style={{ padding: "10px", borderBottom: "2px solid var(--nilasa-border)" }}>Hip (in)</th>
                  <th style={{ padding: "10px", borderBottom: "2px solid var(--nilasa-border)" }}>Kurti Length</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "10px", fontWeight: 700, borderBottom: "1px solid var(--nilasa-border)" }}>XS</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>34&quot;</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>28&quot;</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>38&quot;</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>46&quot;</td>
                </tr>
                <tr style={{ backgroundColor: "var(--nilasa-ivory)" }}>
                  <td style={{ padding: "10px", fontWeight: 700, borderBottom: "1px solid var(--nilasa-border)" }}>S</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>36&quot;</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>30&quot;</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>40&quot;</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>46&quot;</td>
                </tr>
                <tr>
                  <td style={{ padding: "10px", fontWeight: 700, borderBottom: "1px solid var(--nilasa-border)" }}>M</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>38&quot;</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>32&quot;</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>42&quot;</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>47&quot;</td>
                </tr>
                <tr style={{ backgroundColor: "var(--nilasa-ivory)" }}>
                  <td style={{ padding: "10px", fontWeight: 700, borderBottom: "1px solid var(--nilasa-border)" }}>L</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>40&quot;</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>34&quot;</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>44&quot;</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>47&quot;</td>
                </tr>
                <tr>
                  <td style={{ padding: "10px", fontWeight: 700, borderBottom: "1px solid var(--nilasa-border)" }}>XL</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>42&quot;</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>36&quot;</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>46&quot;</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>48&quot;</td>
                </tr>
                <tr style={{ backgroundColor: "var(--nilasa-ivory)" }}>
                  <td style={{ padding: "10px", fontWeight: 700, borderBottom: "1px solid var(--nilasa-border)" }}>XXL</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>44&quot;</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>38&quot;</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>48&quot;</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid var(--nilasa-border)" }}>48&quot;</td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: 20, fontSize: "12px", color: "var(--ink-muted)", lineHeight: 1.5 }}>
              💡 <em>Fit Advice:</em> If you are between sizes, we recommend choosing the larger size for relaxed festive comfort. We offer free size exchanges on your first order.
            </div>

            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                style={{
                  backgroundColor: "var(--nilasa-indigo)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
