"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/catalog";
import { useCart } from "@/components/CartProvider";
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, Truck, Sparkles, CreditCard } from "lucide-react";

export default function CartPage() {
  const { items, count, total, update, clear } = useCart();

  return (
    <main className="shell cart-page-container">
      <header className="page-title">
        <div className="breadcrumb" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--ink-muted)", marginBottom: 10 }}>
          <Link href="/">Home</Link> / <span>Shopping Bag</span>
        </div>
        <span className="eyebrow eyebrow--gold">YOUR SELECTION</span>
        <h1>Shopping Bag ({count} {count === 1 ? "item" : "items"})</h1>
        <p>Review your chosen ethnic pieces before proceeding to secure checkout.</p>
      </header>

      {items.length === 0 ? (
        <div className="empty-cart-state" style={{ textAlign: "center", padding: "80px 24px", background: "#FFFFFF", border: "1px dashed var(--nilasa-border)", borderRadius: 24, maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <ShoppingBag size={54} color="var(--nilasa-gold)" strokeWidth={1.5} />
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-h2)", color: "var(--nilasa-indigo)", margin: "0 0 10px" }}>
            Your Shopping Bag is Empty
          </h2>
          <p style={{ color: "var(--ink-muted)", fontSize: "var(--fs-body-base)", maxWidth: 460, margin: "0 auto 28px" }}>
            Explore our curated collections of modern suits, kurtis, co-ord sets, dupattas, and lehengas.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
            <Link className="button button--gold" href="/shop">
              Explore All Collections →
            </Link>
            <Link className="button button--indigo" href="/shop?q=lavender">
              ✨ Discover Lavender Edit
            </Link>
          </div>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Cart Items List */}
          <div className="cart-items-section">
            <div className="cart-items-header">
              <span>Product Details</span>
              <span className="hide-mobile">Quantity & Line Total</span>
              <button
                type="button"
                className="clear-all-btn"
                onClick={clear}
                title="Clear all items in bag"
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                <Trash2 size={13} />
                <span>Clear Bag</span>
              </button>
            </div>

            <div className="cart-items-list">
              {items.map((item) => {
                const itemKey = `${item.productId}-${item.size}`;
                const itemTotal = item.basePrice * item.quantity;

                return (
                  <article className="cart-item-card" key={itemKey}>
                    <div className="cart-item-img-wrapper">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>

                    <div className="cart-item-content">
                      <div className="cart-item-main">
                        <div>
                          <h3 className="cart-item-title">
                            <Link href={`/product/${item.slug}`}>{item.name}</Link>
                          </h3>
                          <div className="cart-item-size-badge">
                            <span>Size: <strong>{item.size}</strong></span>
                            <span>•</span>
                            <span className="in-stock-label">In Stock</span>
                          </div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", fontWeight: 700, color: "var(--nilasa-gold)", marginTop: 4 }}>
                            {formatPrice(item.basePrice)}
                          </div>
                        </div>
                      </div>

                      <div className="cart-item-footer">
                        {/* Quantity Selector */}
                        <div className="cart-quantity-selector">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => update(itemKey, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus size={13} />
                          </button>
                          <span className="qty-number">{item.quantity}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => update(itemKey, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Price Desktop */}
                        <div className="cart-item-price-desktop">
                          <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}>
                            Line Total
                          </span>
                          <span className="total-item-price">{formatPrice(itemTotal)}</span>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          className="cart-remove-btn"
                          onClick={() => update(itemKey, 0)}
                          aria-label={`Remove ${item.name} from bag`}
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

            <div style={{ borderTop: "1px solid var(--nilasa-border)", marginTop: 24, paddingTop: 18 }}>
              <Link href="/shop" style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", fontWeight: 700, color: "var(--nilasa-indigo)", textTransform: "uppercase" }}>
                ← Continue Shopping Collections
              </Link>
            </div>
          </div>

          {/* Sticky Order Summary Box */}
          <aside className="cart-summary-sidebar">
            <div className="cart-summary-card">
              <h2 className="summary-card-title">Bag Summary</h2>

              <div className="summary-calc-rows">
                <div className="calc-row">
                  <span>Subtotal ({count} item{count > 1 ? "s" : ""})</span>
                  <span className="price-value">{formatPrice(total)}</span>
                </div>

                <div className="calc-row">
                  <span>Pan-India Shipping</span>
                  <span className="free-shipping-tag">COMPLIMENTARY</span>
                </div>

                <div className="calc-row" style={{ color: "#7D4C37" }}>
                  <span>Promo Discount</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>Applied at Checkout</span>
                </div>

                <div className="calc-row grand-total-row">
                  <strong>Estimated Total</strong>
                  <strong className="grand-total-amount">{formatPrice(total)}</strong>
                </div>
              </div>

              <div className="summary-actions">
                <Link className="button button--gold button--large" href="/checkout" style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span>Proceed to Checkout</span>
                  <span>•</span>
                  <span>{formatPrice(total)}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="cart-perks-box">
                <div className="perk-item">
                  <Truck size={16} color="var(--nilasa-gold)" style={{ flexShrink: 0 }} />
                  <span><strong>Pan-India Free Shipping</strong> on all orders</span>
                </div>
                <div className="perk-item">
                  <Sparkles size={16} color="var(--nilasa-gold)" style={{ flexShrink: 0 }} />
                  <span><strong>Dispatched within 24 Hours</strong> from Kanpur</span>
                </div>
                <div className="perk-item">
                  <CreditCard size={16} color="var(--nilasa-gold)" style={{ flexShrink: 0 }} />
                  <span><strong>Multiple Payment Options</strong> (UPI, Cards, NetBanking, COD)</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
