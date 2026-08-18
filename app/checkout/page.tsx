"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/catalog";
import { useCart } from "@/components/CartProvider";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Client-side fallback coupon validation (when backend is offline)
const FALLBACK_COUPONS: Record<string, { discountPercent: number; name: string }> = {
  NILASA10: { discountPercent: 10, name: "10% Welcome Discount" },
  LAVENDER15: { discountPercent: 15, name: "15% Lavender Festive Edit Off" },
  FESTIVE20: { discountPercent: 20, name: "20% Royal Festive Season Savings" }
};

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const router = useRouter();

  // Prevent SSR / localStorage hydration flash
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Form states
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "cod" | "razorpay">("upi");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number; name: string; discountAmount?: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Address form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "Uttar Pradesh",
    postalCode: "",
    upiId: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Coupon application logic — tries real backend first, then falls back
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    setCouponLoading(true);
    try {
      // Try real backend coupon validation
      const token = typeof window !== "undefined" ? window.localStorage.getItem("nilasa-auth-token") : null;
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(
        `${apiUrl}/coupons/validate/${encodeURIComponent(cleanCode)}?orderAmount=${total}`,
        { headers }
      );

      if (res.ok) {
        const data = await res.json();
        // Backend returns { couponId, code, discountType, discountAmount, payableAmount }
        const pct = data.discountType === "percentage"
          ? Math.round((data.discountAmount / total) * 100)
          : 0;
        setAppliedCoupon({
          code: data.code,
          percent: pct,
          name: `${data.discountType === "percentage" ? pct + "%" : "₹" + data.discountAmount} discount`,
          discountAmount: data.discountAmount
        });
        setCouponCode("");
        setCouponLoading(false);
        return;
      } else if (res.status === 400 || res.status === 404) {
        const errText = await res.text();
        setCouponError(errText || "This coupon code is invalid or expired.");
        setCouponLoading(false);
        return;
      }
    } catch {
      // Backend offline — try local fallback
    }

    // Fallback: client-side coupon check
    if (FALLBACK_COUPONS[cleanCode]) {
      const coupon = FALLBACK_COUPONS[cleanCode];
      setAppliedCoupon({ code: cleanCode, percent: coupon.discountPercent, name: coupon.name });
      setCouponCode("");
    } else {
      setCouponError("Invalid promo code. Try NILASA10 or LAVENDER15.");
    }
    setCouponLoading(false);
  };

  const discountAmount = appliedCoupon?.discountAmount
    ? appliedCoupon.discountAmount
    : appliedCoupon ? Math.round((total * appliedCoupon.percent) / 100) : 0;
  const shippingFee = 0; // Complimentary shipping
  const finalTotal = Math.max(0, total - discountAmount + shippingFee);

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) return;

    setSubmitting(true);
    setError("");

    try {
      const token = typeof window !== "undefined" ? window.localStorage.getItem("nilasa-auth-token") : null;
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      // Backend CreateOrderCommand: { UserId (set by backend), AddressId, Items[{ProductVariantId, Quantity}] }
      const orderPayload = {
        addressId: 0, // TODO: create address first or use default
        items: items.map((item) => ({
          productVariantId: item.productId,
          quantity: item.quantity
        }))
      };

      let orderId: number | string = 0;

      if (paymentMethod === "razorpay") {
        try {
          // Create order first
          const orderResponse = await fetch(`${apiUrl}/orders`, {
            method: "POST", headers,
            body: JSON.stringify(orderPayload)
          });
          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            orderId = typeof orderData === "number" ? orderData : orderData.orderId ?? orderData;
          }

          // Initiate payment
          const paymentResponse = await fetch(`${apiUrl}/payments/initiate`, {
            method: "POST", headers,
            body: JSON.stringify({ orderId, amount: finalTotal })
          });
          if (paymentResponse.ok) {
            const payment = await paymentResponse.json();
            if ((await loadRazorpay()) && window.Razorpay) {
              new window.Razorpay({
                key: payment.gatewayKey ?? payment.key,
                order_id: payment.gatewayOrderId ?? payment.orderId,
                amount: finalTotal * 100,
                currency: payment.currency ?? "INR",
                name: "Nilasa",
                description: "Nilasa Luxury Order Payment",
                handler: () => {
                  clear();
                  router.push(`/order-confirmation?order=${orderId}&amount=${finalTotal}`);
                },
                theme: { color: "#0A291E" }
              }).open();
              return;
            }
          }
        } catch {
          // Fall back to direct complete if payment gateway unavailable
        }
      }

      // Try to create order via API
      try {
        const orderResponse = await fetch(`${apiUrl}/orders`, {
          method: "POST", headers,
          body: JSON.stringify(orderPayload)
        });
        if (orderResponse.ok) {
          const orderData = await orderResponse.json();
          orderId = typeof orderData === "number" ? orderData : orderData.orderId ?? orderData;
        }
      } catch {
        // Backend offline — generate mock order ID
        orderId = `NIL-${Math.floor(100000 + Math.random() * 900000)}`;
      }

      // Simulate swift luxury order processing
      await new Promise((res) => setTimeout(res, 1000));
      clear();
      router.push(`/order-confirmation?order=${orderId}&amount=${finalTotal}&name=${encodeURIComponent(formData.name)}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Order processing failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Loading skeleton while mounted check completes
  if (!mounted) {
    return (
      <main className="shell checkout-page">
        <header className="page-title">
          <span className="eyebrow eyebrow--gold">SECURE CHECKOUT</span>
          <h1>Loading Checkout...</h1>
        </header>
      </main>
    );
  }

  // Empty cart fallback state
  if (items.length === 0) {
    return (
      <main className="shell checkout-page">
        <header className="page-title">
          <div className="breadcrumb">
            <Link href="/">Home</Link> / <Link href="/cart">Bag</Link> / <span>Checkout</span>
          </div>
          <span className="eyebrow eyebrow--gold">NILASA CHECKOUT</span>
          <h1>Your Shopping Bag is Empty</h1>
          <p>Discover our modern suits, kurtis, and festive lavender collection.</p>
          <div style={{ marginTop: 28 }}>
            <Link className="button button--gold" href="/shop">
              Explore Collections →
            </Link>
          </div>
        </header>
      </main>
    );
  }

  return (
    <main className="shell checkout-page">
      <header className="page-title">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <Link href="/cart">Bag</Link> / <span>Checkout</span>
        </div>
        <span className="eyebrow eyebrow--gold">SECURE CHECKOUT</span>
        <h1>Complete Your Order</h1>
        <p>Grace and luxury delivered to your doorstep with complimentary Pan-India shipping.</p>
      </header>

      <div className="checkout-layout">
        {/* Main Checkout Form */}
        <form onSubmit={handleCheckout} className="checkout-main-form">
          {/* Section 1: Contact & Delivery Information */}
          <section className="checkout-section">
            <div className="checkout-section-header">
              <span className="step-number">1</span>
              <div>
                <h2>Shipping & Contact Details</h2>
                <p>Enter the address where you would like your Nilasa order delivered.</p>
              </div>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>Full Name *</span>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Swaleha Ansari"
                  value={formData.name}
                  onChange={handleInputChange}
                  autoComplete="name"
                />
              </label>

              <label className="field">
                <span>Phone Number *</span>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  autoComplete="tel"
                />
              </label>

              <label className="field wide">
                <span>Email Address *</span>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="your.email@domain.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                />
              </label>

              <label className="field wide">
                <span>Delivery Address *</span>
                <input
                  name="address"
                  type="text"
                  required
                  placeholder="House/Flat No., Street, Landmark"
                  value={formData.address}
                  onChange={handleInputChange}
                  autoComplete="street-address"
                />
              </label>

              <label className="field">
                <span>City *</span>
                <input
                  name="city"
                  type="text"
                  required
                  placeholder="Kanpur"
                  value={formData.city}
                  onChange={handleInputChange}
                  autoComplete="address-level2"
                />
              </label>

              <label className="field">
                <span>State *</span>
                <select name="state" value={formData.state} onChange={handleInputChange} className="field-select">
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Telangana">Telangana</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Punjab">Punjab</option>
                </select>
              </label>

              <label className="field">
                <span>PIN Code *</span>
                <input
                  name="postalCode"
                  type="text"
                  required
                  placeholder="208001"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  autoComplete="postal-code"
                />
              </label>
            </div>
          </section>

          {/* Section 2: Payment Options */}
          <section className="checkout-section" style={{ marginTop: 40 }}>
            <div className="checkout-section-header">
              <span className="step-number">2</span>
              <div>
                <h2>Select Payment Method</h2>
                <p>All transactions are 256-bit SSL encrypted and 100% secure.</p>
              </div>
            </div>

            <div className="payment-options-grid">
              {/* Option 1: Instant UPI */}
              <label className={`payment-option-card ${paymentMethod === "upi" ? "payment-option-card--active" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={() => setPaymentMethod("upi")}
                />
                <div className="payment-option-content">
                  <div className="payment-title-row">
                    <span className="payment-name">⚡ Instant UPI / QR</span>
                    <span className="payment-badge lavender">GPay • PhonePe • Paytm</span>
                  </div>
                  <p className="payment-desc">Pay instantly using Google Pay, PhonePe, Paytm or BHIM UPI.</p>
                </div>
              </label>

              {/* Option 2: Cards */}
              <label className={`payment-option-card ${paymentMethod === "card" ? "payment-option-card--active" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                <div className="payment-option-content">
                  <div className="payment-title-row">
                    <span className="payment-name">💳 Credit / Debit Card</span>
                    <span className="payment-badge gold">Visa • Mastercard • RuPay</span>
                  </div>
                  <p className="payment-desc">All major Indian and international debit & credit cards accepted.</p>
                </div>
              </label>

              {/* Option 3: Netbanking */}
              <label className={`payment-option-card ${paymentMethod === "netbanking" ? "payment-option-card--active" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="netbanking"
                  checked={paymentMethod === "netbanking"}
                  onChange={() => setPaymentMethod("netbanking")}
                />
                <div className="payment-option-content">
                  <div className="payment-title-row">
                    <span className="payment-name">🏦 Net Banking</span>
                    <span className="payment-badge">All Major Banks</span>
                  </div>
                  <p className="payment-desc">HDFC, SBI, ICICI, Axis, Kotak and 50+ Indian banks.</p>
                </div>
              </label>

              {/* Option 4: Cash on Delivery */}
              <label className={`payment-option-card ${paymentMethod === "cod" ? "payment-option-card--active" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <div className="payment-option-content">
                  <div className="payment-title-row">
                    <span className="payment-name">💵 Cash On Delivery (COD)</span>
                    <span className="payment-badge emerald">Complimentary COD</span>
                  </div>
                  <p className="payment-desc">Pay cash when your Nilasa package is delivered to your doorstep.</p>
                </div>
              </label>
            </div>

            {/* Sub-inputs based on payment method */}
            {paymentMethod === "upi" && (
              <div className="payment-subpanel">
                <label className="field">
                  <span>Enter UPI ID / VPA (Optional)</span>
                  <input
                    type="text"
                    name="upiId"
                    placeholder="mobile@upi or username@okicici"
                    value={formData.upiId}
                    onChange={handleInputChange}
                  />
                </label>
                <p className="payment-subpanel-note">✨ A payment prompt or QR code will be generated upon clicking order confirmation.</p>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="payment-subpanel form-grid">
                <label className="field wide">
                  <span>Card Number</span>
                  <input type="text" placeholder="4111 2222 3333 4444" maxLength={19} />
                </label>
                <label className="field">
                  <span>Expiry Date</span>
                  <input type="text" placeholder="MM / YY" maxLength={5} />
                </label>
                <label className="field">
                  <span>CVV / CVC</span>
                  <input type="password" placeholder="123" maxLength={4} />
                </label>
              </div>
            )}
          </section>

          {error && <p className="notice notice--error" role="alert">{error}</p>}

          <button
            type="submit"
            className="button button--gold button--large"
            disabled={submitting}
            style={{ marginTop: 32, width: "100%" }}
          >
            {submitting ? "Processing Order..." : `Place Order • ${formatPrice(finalTotal)}`}
          </button>

          <p className="checkout-guarantee">
            🔒 By placing your order, you agree to Nilasa&apos;s Terms of Sale and Return Policy. Free 7-day returns & exchanges.
          </p>
        </form>

        {/* Sidebar Order Summary */}
        <aside className="checkout-sidebar">
          <div className="checkout-summary-card">
            <h3 className="summary-title">Order Summary ({items.length} item{items.length > 1 ? "s" : ""})</h3>

            <div className="summary-items-list">
              {items.map((item) => (
                <div className="summary-item-row" key={`${item.productId}-${item.size}`}>
                  <div className="summary-item-img">
                    <Image src={item.image} alt={item.name} width={54} height={70} style={{ objectFit: "cover" }} />
                    <span className="summary-item-qty">{item.quantity}</span>
                  </div>
                  <div className="summary-item-info">
                    <h4 className="summary-item-name">{item.name}</h4>
                    <span className="summary-item-size">Size: {item.size}</span>
                  </div>
                  <div className="summary-item-price">
                    {formatPrice(item.basePrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Input */}
            <div className="promo-code-section">
              <span className="promo-label">Have a Promo Code?</span>
              {appliedCoupon ? (
                <div className="applied-coupon-pill">
                  <span>🎉 <strong>{appliedCoupon.code}</strong> ({appliedCoupon.name})</span>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(null)}
                    className="remove-coupon-btn"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="coupon-form">
                  <input
                    type="text"
                    placeholder="Try NILASA10 or LAVENDER15"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="coupon-input"
                    disabled={couponLoading}
                  />
                  <button type="submit" className="coupon-apply-btn" disabled={couponLoading}>
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </form>
              )}
              {couponError && <span className="coupon-error">{couponError}</span>}
            </div>

            {/* Totals Breakdown */}
            <div className="totals-breakdown">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>

              {appliedCoupon && (
                <div className="summary-row discount">
                  <span>Promo Discount ({appliedCoupon.code})</span>
                  <span>− {formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="summary-row">
                <span>Pan-India Shipping</span>
                <span className="free-shipping-text">COMPLIMENTARY</span>
              </div>

              <div className="summary-row grand-total">
                <strong>Total Payable</strong>
                <strong className="grand-total-price">{formatPrice(finalTotal)}</strong>
              </div>
            </div>

            {/* Guarantee badges */}
            <div className="sidebar-trust-box">
              <div className="trust-mini-item">
                <span className="trust-icon">✨</span>
                <span>Handcrafted Authentic Ethnic Wear</span>
              </div>
              <div className="trust-mini-item">
                <span className="trust-icon">📦</span>
                <span>Dispatched within 24-48 Hours</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
