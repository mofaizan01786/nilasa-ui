"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/catalog";
import { useCart } from "@/components/CartProvider";
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, Truck, Sparkles, CreditCard, ShieldCheck } from "lucide-react";

export default function CartPage() {
  const { items, count, total, update, clear } = useCart();

  return (
    <main className="shell cart-page-container" style={{ paddingTop: "clamp(16px, 2.5vw, 32px)", paddingBottom: "clamp(40px, 6vw, 80px)" }}>
      <header className="page-title" style={{ marginBottom: "clamp(16px, 3vw, 28px)", textAlign: "left" }}>
        <div className="breadcrumb" style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--ink-muted)", marginBottom: 8 }}>
          <Link href="/">Home</Link> / <span>Shopping Bag</span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-h1)", margin: "4px 0 0", color: "var(--nilasa-indigo)" }}>
          Shopping Bag ({count} {count === 1 ? "item" : "items"})
        </h1>
      </header>

      {items.length === 0 ? (
        <div className="empty-cart-state" style={{ textAlign: "center", padding: "clamp(48px, 8vw, 80px) 24px", background: "#FFFFFF", border: "1px dashed var(--nilasa-border)", borderRadius: 24, maxWidth: 640, margin: "20px auto" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--nilasa-ivory)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingBag size={40} color="var(--nilasa-gold)" strokeWidth={1.5} />
            </div>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem, 3vw, 1.8rem)", color: "var(--nilasa-indigo)", margin: "0 0 10px" }}>
            Your Bag is Empty
          </h2>
          <p style={{ fontFamily: "var(--font-body)", color: "var(--ink-muted)", fontSize: "0.95rem", maxWidth: 420, margin: "0 auto 28px", lineHeight: 1.6 }}>
            Explore our artisanal luxury ethnic collection featuring pure silk suits, handloom kurtis, and festive dupattas.
          </p>
          <Link className="button button--gold button--large" href="/shop" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span>Explore Collections</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Main Cart Items Section */}
          <div className="cart-items-section">
            <div className="cart-items-header">
              <span>Selected Pieces ({count})</span>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && window.confirm("Are you sure you want to clear your shopping bag?")) {
                    clear();
                  }
                }}
                className="clear-all-btn"
                title="Remove all items from bag"
              >
                Clear Bag
              </button>
            </div>

            <div className="cart-items-list">
              {items.map((item) => {
                const itemKey = `${item.productId}-${item.size}`;
                const itemTotal = item.basePrice * item.quantity;
                const productUrl = item.slug ? `/product/${item.slug}` : "/shop";

                return (
                  <article key={itemKey} className="cart-item-card">
                    {/* Thumbnail Image */}
                    <Link href={productUrl} className="cart-item-img-wrapper" tabIndex={-1} aria-hidden="true">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="110px"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ShoppingBag size={24} color="#94A3B8" />
                        </div>
                      )}
                    </Link>

                    {/* Details and Controls */}
                    <div className="cart-item-content">
                      <div className="cart-item-main">
                        <div>
                          <h3 className="cart-item-title">
                            <Link href={productUrl} style={{ textDecoration: "none", color: "inherit" }}>
                              {item.name}
                            </Link>
                          </h3>
                          <div className="cart-item-size-badge">
                            <span className="cart-size-pill">Size: {item.size}</span>
                            <span className="in-stock-label">✓ In Stock</span>
                          </div>
                        </div>

                        {/* Desktop Total for Item */}
                        <div className="cart-item-price-desktop hide-mobile">
                          <span className="total-item-price">{formatPrice(itemTotal)}</span>
                          {item.quantity > 1 && (
                            <span style={{ fontSize: "0.75rem", color: "var(--ink-muted)", fontFamily: "var(--font-body)" }}>
                              {formatPrice(item.basePrice)} each
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer Row: Stepper + Mobile Price + Remove Button */}
                      <div className="cart-item-footer">
                        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                          {/* Quantity Stepper */}
                          <div className="cart-quantity-selector" aria-label="Quantity Controls">
                            <button
                              type="button"
                              onClick={() => update(itemKey, item.quantity - 1)}
                              className="qty-btn"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="qty-number" aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => update(itemKey, item.quantity + 1)}
                              className="qty-btn"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Mobile Total Price */}
                          <div className="cart-item-price-mobile show-mobile-only">
                            <span className="total-item-price">{formatPrice(itemTotal)}</span>
                          </div>
                        </div>

                        {/* Remove Action */}
                        <button
                          type="button"
                          onClick={() => update(itemKey, 0)}
                          className="cart-remove-btn"
                          aria-label={`Remove ${item.name} from shopping bag`}
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div style={{ borderTop: "1px solid var(--nilasa-border)", marginTop: 24, paddingTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Link href="/shop" style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600, color: "var(--nilasa-indigo)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span>← Continue Shopping Collections</span>
              </Link>
            </div>
          </div>

          {/* Sticky Order Summary Sidebar */}
          <aside className="cart-summary-sidebar">
            <div className="cart-summary-card">
              <h2 className="summary-card-title">Order Summary</h2>

              <div className="summary-calc-rows">
                <div className="calc-row">
                  <span>Subtotal ({count} {count === 1 ? "item" : "items"})</span>
                  <span className="price-value">{formatPrice(total)}</span>
                </div>

                <div className="calc-row">
                  <span>Pan-India Shipping</span>
                  <span className="free-shipping-tag">COMPLIMENTARY FREE</span>
                </div>

                <div className="calc-row" style={{ color: "#7D4C37" }}>
                  <span>Coupon & Promo</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: "#854D0E" }}>Applied at Checkout</span>
                </div>

                <div className="calc-row grand-total-row">
                  <strong>Estimated Total</strong>
                  <strong className="grand-total-amount">{formatPrice(total)}</strong>
                </div>
              </div>

              <div className="summary-actions">
                <Link
                  className="button button--gold button--large"
                  href="/checkout"
                  style={{
                    width: "100%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    textDecoration: "none"
                  }}
                >
                  <span>Proceed to Checkout</span>
                  <span>•</span>
                  <span>{formatPrice(total)}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="cart-perks-box">
                <div className="perk-item">
                  <Truck size={16} color="var(--nilasa-gold)" style={{ flexShrink: 0 }} />
                  <span><strong>Complimentary Free Shipping</strong> across India</span>
                </div>
                <div className="perk-item">
                  <Sparkles size={16} color="var(--nilasa-gold)" style={{ flexShrink: 0 }} />
                  <span><strong>Handcrafted Quality Guarantee</strong> & Artisanal Finish</span>
                </div>
                <div className="perk-item">
                  <CreditCard size={16} color="var(--nilasa-gold)" style={{ flexShrink: 0 }} />
                  <span><strong>Multiple Payment Options</strong> (UPI, Cards, NetBanking, COD)</span>
                </div>
                <div className="perk-item">
                  <ShieldCheck size={16} color="var(--nilasa-gold)" style={{ flexShrink: 0 }} />
                  <span><strong>100% Secure Checkout</strong> with End-to-End Encryption</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
