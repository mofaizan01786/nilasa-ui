"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/components/WishlistProvider";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/catalog";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  Check,
  PackageCheck
} from "lucide-react";

export default function WishlistPage() {
  const { items, count, remove, clear } = useWishlist();
  const { add } = useCart();
  const [movingId, setMovingId] = useState<number | null>(null);

  const handleMoveToBag = (item: typeof items[0]) => {
    add({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      basePrice: item.basePrice,
      size: "M",
      quantity: 1,
      image: item.image
    });

    setMovingId(item.productId);
    setTimeout(() => {
      remove(item.productId);
      setMovingId(null);
    }, 800);
  };

  return (
    <main
      className="shell wishlist-page-container"
      style={{
        paddingTop: "clamp(16px, 3vw, 28px)",
        paddingBottom: "clamp(50px, 8vw, 90px)",
        minHeight: "75vh"
      }}
    >
      {/* Breadcrumbs & Header */}
      <header style={{ marginBottom: "clamp(20px, 3vw, 32px)" }}>
        <nav
          className="breadcrumb"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.78rem",
            color: "var(--ink-muted)",
            marginBottom: 8
          }}
        >
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
            Home
          </Link>{" "}
          / <span style={{ color: "var(--nilasa-indigo)", fontWeight: 600 }}>My Wishlist</span>
        </nav>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 12,
            borderBottom: "1px solid var(--nilasa-border)",
            paddingBottom: 16
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--fs-h1)",
                color: "var(--nilasa-indigo)",
                margin: 0,
                lineHeight: 1.15
              }}
            >
              My Saved Pieces
            </h1>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "0.88rem",
                color: "var(--ink-muted)",
                fontFamily: "var(--font-body)"
              }}
            >
              {count === 0
                ? "Your personal curation of handcrafted ethnic wear"
                : `${count} item${count > 1 ? "s" : ""} saved in your private collection`}
            </p>
          </div>

          {count > 0 && (
            <button
              type="button"
              onClick={clear}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                border: "1px solid var(--nilasa-border)",
                padding: "8px 14px",
                borderRadius: 8,
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--ink-muted)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#EF4444";
                e.currentTarget.style.color = "#EF4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--nilasa-border)";
                e.currentTarget.style.color = "var(--ink-muted)";
              }}
            >
              <Trash2 size={14} />
              <span>Clear Wishlist</span>
            </button>
          )}
        </div>
      </header>

      {/* Empty State */}
      {count === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "clamp(60px, 8vw, 100px) 24px",
            background: "#FFFFFF",
            border: "1px dashed var(--nilasa-border)",
            borderRadius: 24,
            maxWidth: 640,
            margin: "0 auto"
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20
            }}
          >
            <Heart size={32} color="#EF4444" strokeWidth={1.5} />
          </div>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--fs-h2)",
              color: "var(--nilasa-indigo)",
              margin: "0 0 10px"
            }}
          >
            Your Wishlist is Empty
          </h2>

          <p
            style={{
              color: "var(--ink-muted)",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              maxWidth: 440,
              margin: "0 auto 28px",
              fontFamily: "var(--font-body)"
            }}
          >
            Explore our curated catalog of handcrafted suits, festive kurtis, and pure zari dupattas. Click the heart icon on any piece to save it here.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/shop"
              className="button button--primary button--large"
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <span>Explore All Collections</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        /* Wishlist Items Grid */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "clamp(16px, 2.5vw, 28px)"
          }}
        >
          {items.map((item) => {
            const isMoving = movingId === item.productId;

            return (
              <article
                key={item.productId}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid var(--nilasa-border)",
                  borderRadius: 16,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)"
                }}
              >
                {/* Media Frame */}
                <div style={{ position: "relative", aspectRatio: "3/4", background: "var(--nilasa-card)" }}>
                  <Link href={`/product/${item.slug}`} style={{ display: "block", width: "100%", height: "100%" }}>
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "var(--nilasa-card)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Sparkles size={24} color="var(--nilasa-gold)" />
                      </div>
                    )}
                  </Link>

                  {/* Top-Left Badge */}
                  {item.badge && (
                    <span
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        background: "rgba(53, 66, 50, 0.9)",
                        color: "#FFFFFF",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 4,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        fontFamily: "var(--font-body)"
                      }}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Delete / Remove Floating Button */}
                  <button
                    type="button"
                    onClick={() => remove(item.productId)}
                    aria-label={`Remove ${item.name} from wishlist`}
                    title="Remove from wishlist"
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(4px)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#EF4444",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Details & Actions Body */}
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
                  <div>
                    {item.categoryName && (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--nilasa-gold)",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          fontFamily: "var(--font-body)",
                          display: "block",
                          marginBottom: 4
                        }}
                      >
                        {item.categoryName}
                      </span>
                    )}

                    <h3
                      style={{
                        margin: 0,
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "var(--nilasa-indigo)",
                        fontFamily: "var(--font-body)",
                        lineHeight: 1.35
                      }}
                    >
                      <Link
                        href={`/product/${item.slug}`}
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        {item.name}
                      </Link>
                    </h3>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "auto"
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        color: "var(--nilasa-indigo)"
                      }}
                    >
                      {formatPrice(item.basePrice)}
                    </span>

                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "#16A34A",
                        fontWeight: 600,
                        fontFamily: "var(--font-body)"
                      }}
                    >
                      ● In Stock
                    </span>
                  </div>

                  {/* Move to Bag Action */}
                  <button
                    type="button"
                    disabled={isMoving}
                    onClick={() => handleMoveToBag(item)}
                    style={{
                      width: "100%",
                      height: 42,
                      borderRadius: 8,
                      border: "1px solid var(--nilasa-indigo)",
                      backgroundColor: isMoving ? "#16A34A" : "var(--nilasa-indigo)",
                      color: "#FFFFFF",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      cursor: isMoving ? "default" : "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {isMoving ? (
                      <>
                        <Check size={16} strokeWidth={2.5} />
                        <span>Moved to Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={16} strokeWidth={2} />
                        <span>Move to Bag</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
