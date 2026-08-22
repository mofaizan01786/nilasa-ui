"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/catalog";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import {
  createOrderBackend,
  initiatePaymentBackend,
  verifyPaymentBackend
} from "@/lib/api";
import {
  QrCode,
  CreditCard,
  Building2,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Tag,
  Loader2,
  Lock,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  Smartphone,
  AlertCircle
} from "lucide-react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (response: any) => void) => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Client-side fallback coupon validation
const FALLBACK_COUPONS: Record<string, { discountPercent: number; name: string }> = {
  NILASA10: { discountPercent: 10, name: "10% Welcome Discount" },
  LAVENDER15: { discountPercent: 15, name: "15% Lavender Festive Edit Off" },
  FESTIVE20: { discountPercent: 20, name: "20% Royal Festive Season Savings" }
};

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { user, isAuthenticated, token } = useAuth();
  const router = useRouter();

  // Prevent SSR hydration flash
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Form states
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "upi" | "card" | "netbanking" | "cod">("razorpay");
  const [submitting, setSubmitting] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [error, setError] = useState("");
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number; name: string; discountAmount?: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Address & Customer Info form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "Uttar Pradesh",
    postalCode: "",
    upiId: "",
    utrNumber: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    selectedBank: "HDFC Bank"
  });

  // Prefill authenticated user details
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || ""
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Coupon application logic
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    setCouponLoading(true);
    try {
      const activeToken = token || (typeof window !== "undefined" ? window.localStorage.getItem("nilasa-auth-token") : null);
      const headers: HeadersInit = activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
      const res = await fetch(
        `/api/v1/coupons/validate/${encodeURIComponent(cleanCode)}?orderAmount=${total}`,
        { headers }
      );

      if (res.ok) {
        const data = await res.json();
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
      // fallback
    }

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

  // Nilasa official UPI Virtual Payment Address & dynamic UPI URI
  const NILASA_UPI_VPA = "nilasawear@okhdfcbank";
  const upiIntentUri = `upi://pay?pa=${NILASA_UPI_VPA}&pn=Nilasa%20Luxury%20Wear&am=${finalTotal}&cu=INR&tn=Nilasa-Order`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiIntentUri)}&bgcolor=FAF8FD&color=354232&margin=1`;

  const copyUpiId = () => {
    navigator.clipboard.writeText(NILASA_UPI_VPA);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // ── Authoritative .NET Backend Razorpay Checkout Execution ──
  const executeAuthoritativeRazorpayCheckout = async () => {
    // 1. Ensure Razorpay SDK script is loaded
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      throw new Error("Unable to load Razorpay payment gateway. Please check your network connection.");
    }

    const activeToken = token || (typeof window !== "undefined" ? window.localStorage.getItem("nilasa-auth-token") : null);

    // 2. Step 1: Create or Reuse Order on .NET API (POST /api/v1/orders)
    let orderIdToUse = activeOrderId;

    if (!orderIdToUse) {
      setProcessingStatus("Creating order on secure server...");
      const orderPayload = {
        addressId: 1, // Default address reference
        items: items.map((item) => ({
          productVariantId: item.variantId || item.productId || 1,
          quantity: item.quantity
        }))
      };

      const orderRes = await createOrderBackend(orderPayload, activeToken || undefined);

      if (!orderRes.success || !orderRes.orderId) {
        throw new Error(orderRes.error || "Failed to create order on server. Please try again.");
      }

      orderIdToUse = orderRes.orderId;
      setActiveOrderId(orderIdToUse);
    }

    // 3. Step 2: Initiate Payment on .NET API (POST /api/v1/payments/initiate)
    setProcessingStatus("Initializing payment gateway...");
    const idempotencyKey = `pay_order_${orderIdToUse}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const initRes = await initiatePaymentBackend(orderIdToUse, idempotencyKey, activeToken || undefined);

    if (!initRes.success || !initRes.data) {
      throw new Error(initRes.error || "Failed to initiate payment gateway session.");
    }

    const gatewayData = initRes.data;

    // 4. Step 3: Open Razorpay Provider Checkout UI using Backend-Returned Values Only
    return new Promise<void>((resolve, reject) => {
      const options = {
        key: gatewayData.gatewayKey,
        amount: Math.round(Number(gatewayData.amount) * 100), // convert rupees to paise for gateway modal
        currency: gatewayData.currency || "INR",
        name: "Nilasa",
        description: `Nilasa Luxury Order #${orderIdToUse}`,
        image: "/nilasa-brand-logo.png",
        order_id: gatewayData.gatewayOrderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        notes: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          order_id: String(orderIdToUse)
        },
        theme: {
          color: "#354232" // Nilasa Signature Deep Olive
        },
        // Step 4: Handle Payment Completion -> Call .NET /verify Endpoint
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            setProcessingStatus("Verifying payment with bank & confirming order...");
            const verifyRes = await verifyPaymentBackend(
              {
                gatewayOrderId: response.razorpay_order_id,
                gatewayPaymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              },
              activeToken || undefined
            );

            if (!verifyRes.success || !verifyRes.data) {
              throw new Error(verifyRes.error || "Payment verification failed on server.");
            }

            // Only declare success once backend confirms
            clear();
            resolve();
            router.push(`/order-confirmation?order=${orderIdToUse}`);
          } catch (verifyErr) {
            reject(verifyErr);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setProcessingStatus("");
            setError("Payment window was closed. You can retry payment whenever ready.");
            resolve();
          }
        }
      };

      const rzp = new window.Razorpay!(options);

      rzp.on("payment.failed", (failResponse: any) => {
        setSubmitting(false);
        setProcessingStatus("");
        const reason = failResponse.error?.description || failResponse.error?.reason || "Transaction declined by bank.";
        setError(`Payment failed: ${reason}`);
      });

      setProcessingStatus("Payment window open...");
      rzp.open();
    });
  };

  // Main Checkout Submission Handler
  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length || submitting) return;

    // Validate essential fields
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setError("Please fill in your name, phone number, and delivery address.");
      return;
    }

    setSubmitting(true);
    setError("");
    setProcessingStatus("Preparing order...");

    try {
      // 1. Authoritative Online Gateway Checkout
      if (paymentMethod === "razorpay" || paymentMethod === "card" || paymentMethod === "netbanking") {
        await executeAuthoritativeRazorpayCheckout();
        return;
      }

      // 2. Direct Order Placement on .NET Backend
      const activeToken = token || (typeof window !== "undefined" ? window.localStorage.getItem("nilasa-auth-token") : null);
      const orderPayload = {
        addressId: 1,
        items: items.map((item) => ({
          productVariantId: item.variantId || item.productId || 1,
          quantity: item.quantity
        }))
      };

      const orderRes = await createOrderBackend(orderPayload, activeToken || undefined);

      if (!orderRes.success || !orderRes.orderId) {
        throw new Error(orderRes.error || "Order processing failed. Please try again.");
      }

      clear();
      router.push(`/order-confirmation?order=${orderRes.orderId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Order processing failed. Please try again.");
    } finally {
      setSubmitting(false);
      setProcessingStatus("");
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
    <main className="shell checkout-page" style={{ paddingBottom: "clamp(30px, 5vw, 60px)", paddingTop: "clamp(12px, 2vw, 24px)" }}>
      <header className="page-title" style={{ marginBottom: "clamp(16px, 3vw, 28px)", textAlign: "left" }}>
        <div className="breadcrumb" style={{ marginBottom: 6 }}>
          <Link href="/">Home</Link> / <Link href="/cart">Bag</Link> / <span>Checkout</span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-h1)", margin: "4px 0 0" }}>
          Checkout
        </h1>
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
              </div>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>Full Name *</span>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  autoComplete="name"
                />
              </label>

              <label className="field">
                <span>Phone Number (for Courier & Tracking Updates) *</span>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  autoComplete="tel"
                />
              </label>

              <label className="field wide">
                <span>Email Address (for Invoice & Order Receipt) *</span>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                />
              </label>

              <label className="field wide">
                <span>Delivery Address (House / Flat / Street / Area) *</span>
                <input
                  name="address"
                  type="text"
                  required
                  placeholder="Flat / House no., building, street address, landmark"
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
                  placeholder="City / Town"
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
                  <option value="Haryana">Haryana</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Bihar">Bihar</option>
                </select>
              </label>

              <label className="field">
                <span>PIN Code *</span>
                <input
                  name="postalCode"
                  type="text"
                  required
                  placeholder="6-digit PIN code"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  autoComplete="postal-code"
                />
              </label>
            </div>
          </section>

          {/* Section 2: Payment Options */}
          <section className="checkout-section" style={{ marginTop: "clamp(20px, 3vw, 32px)" }}>
            <div className="checkout-section-header">
              <span className="step-number">2</span>
              <div>
                <h2>Payment Method</h2>
              </div>
            </div>

            <div className="payment-options-grid">
              {/* Option 1: Razorpay Standard Checkout */}
              <label className={`payment-option-card ${paymentMethod === "razorpay" ? "payment-option-card--active" : ""}`}>
                <div className="payment-radio-wrap">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                  />
                </div>
                <div className="payment-option-content">
                  <div className="payment-title-row">
                    <div className="payment-name-wrap">
                      <ShieldCheck size={18} className="payment-icon-emerald" />
                      <span className="payment-name">Razorpay Checkout</span>
                      <span className="payment-pill-recommend">Recommended</span>
                    </div>
                    <span className="payment-badge emerald">UPI • Cards • NetBanking</span>
                  </div>
                  <p className="payment-desc">Official secure gateway with 100% buyer protection and instant verification.</p>
                </div>
              </label>

              {/* Option 2: Instant UPI / QR */}
              <label className={`payment-option-card ${paymentMethod === "upi" ? "payment-option-card--active" : ""}`}>
                <div className="payment-radio-wrap">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === "upi"}
                    onChange={() => setPaymentMethod("upi")}
                  />
                </div>
                <div className="payment-option-content">
                  <div className="payment-title-row">
                    <div className="payment-name-wrap">
                      <QrCode size={18} className="payment-icon-olive" />
                      <span className="payment-name">Direct UPI / QR Code</span>
                    </div>
                    <span className="payment-badge lavender">GPay • PhonePe • Paytm</span>
                  </div>
                  <p className="payment-desc">Scan dynamic QR code or open your favorite UPI app directly.</p>
                </div>
              </label>

              {/* Option 3: Cards */}
              <label className={`payment-option-card ${paymentMethod === "card" ? "payment-option-card--active" : ""}`}>
                <div className="payment-radio-wrap">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />
                </div>
                <div className="payment-option-content">
                  <div className="payment-title-row">
                    <div className="payment-name-wrap">
                      <CreditCard size={18} className="payment-icon-olive" />
                      <span className="payment-name">Credit / Debit Card</span>
                    </div>
                    <span className="payment-badge gold">Visa • Mastercard • RuPay</span>
                  </div>
                  <p className="payment-desc">All major Indian and international debit & credit cards accepted.</p>
                </div>
              </label>

              {/* Option 4: Netbanking */}
              <label className={`payment-option-card ${paymentMethod === "netbanking" ? "payment-option-card--active" : ""}`}>
                <div className="payment-radio-wrap">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="netbanking"
                    checked={paymentMethod === "netbanking"}
                    onChange={() => setPaymentMethod("netbanking")}
                  />
                </div>
                <div className="payment-option-content">
                  <div className="payment-title-row">
                    <div className="payment-name-wrap">
                      <Building2 size={18} className="payment-icon-olive" />
                      <span className="payment-name">Net Banking</span>
                    </div>
                    <span className="payment-badge">50+ Banks</span>
                  </div>
                  <p className="payment-desc">HDFC, SBI, ICICI, Axis, Kotak, PNB and all major Indian banks.</p>
                </div>
              </label>

              {/* Option 5: Cash on Delivery */}
              <label className={`payment-option-card ${paymentMethod === "cod" ? "payment-option-card--active" : ""}`}>
                <div className="payment-radio-wrap">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                </div>
                <div className="payment-option-content">
                  <div className="payment-title-row">
                    <div className="payment-name-wrap">
                      <Banknote size={18} className="payment-icon-olive" />
                      <span className="payment-name">Cash On Delivery (COD)</span>
                    </div>
                    <span className="payment-badge emerald">Complimentary</span>
                  </div>
                  <p className="payment-desc">Pay in cash or UPI when your Nilasa package is delivered to your door.</p>
                </div>
              </label>
            </div>

            {/* ── Razorpay Highlight Badge ── */}
            {paymentMethod === "razorpay" && (
              <div className="payment-active-info-panel">
                <ShieldCheck size={20} className="payment-info-shield" />
                <div className="payment-info-copy">
                  <h4>Razorpay Standard Checkout Selected</h4>
                  <p>
                    Clicking &quot;Pay with Razorpay&quot; below will open the official secure popup supporting Google Pay, PhonePe, Paytm, All Cards, EMI, and Net Banking.
                  </p>
                </div>
              </div>
            )}

            {/* ── Dynamic UPI / QR Interactive Payment Card ── */}
            {paymentMethod === "upi" && (
              <div
                className="upi-interactive-panel"
                style={{
                  marginTop: 18,
                  padding: "20px 24px",
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #FAF8FD 0%, #F5EEFA 100%)",
                  border: "1.5px solid #E4D9F0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 700, color: "#1A1D20" }}>
                      Scan QR with any UPI App to Pay {formatPrice(finalTotal)}
                    </h4>
                    <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#64748B" }}>
                      Scan using Google Pay, PhonePe, Paytm, or BHIM UPI
                    </p>
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFFFFF", padding: "6px 12px", borderRadius: 8, border: "1px solid #E4D9F0" }}>
                    <span style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600 }}>UPI ID:</span>
                    <strong style={{ fontSize: "0.84rem", color: "#354232", fontFamily: "var(--font-mono)" }}>
                      {NILASA_UPI_VPA}
                    </strong>
                    <button
                      type="button"
                      onClick={copyUpiId}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: copiedUpi ? "#10B981" : "#8E6EA8",
                        display: "flex",
                        alignItems: "center",
                        padding: "2px 4px"
                      }}
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
                  {/* QR Code Container */}
                  <div
                    style={{
                      background: "#FFFFFF",
                      padding: 10,
                      borderRadius: 12,
                      border: "1px solid #E4D9F0",
                      display: "inline-flex",
                      flexDirection: "column",
                      alignItems: "center",
                      boxShadow: "0 4px 14px rgba(142, 110, 168, 0.12)"
                    }}
                  >
                    <Image
                      src={qrCodeImageUrl}
                      alt="Nilasa UPI Payment QR Code"
                      width={170}
                      height={170}
                      style={{ borderRadius: 8 }}
                      unoptimized
                    />
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#8E6EA8", marginTop: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      Nilasa Verified Merchant
                    </span>
                  </div>

                  {/* UPI App Quick Intent Launchers */}
                  <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 10 }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Direct App Links (Mobile)
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      <a
                        href={upiIntentUri}
                        className="button button--lavender-glass"
                        style={{ fontSize: "0.8rem", padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        <Smartphone size={14} /> Open Google Pay
                      </a>
                      <a
                        href={upiIntentUri}
                        className="button button--lavender-glass"
                        style={{ fontSize: "0.8rem", padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        <Smartphone size={14} /> Open PhonePe
                      </a>
                      <a
                        href={upiIntentUri}
                        className="button button--lavender-glass"
                        style={{ fontSize: "0.8rem", padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        <Smartphone size={14} /> Open Paytm
                      </a>
                    </div>

                    <label className="field" style={{ marginTop: 6 }}>
                      <span style={{ fontSize: "0.76rem" }}>UTR / UPI Reference No. (Optional for fast verification)</span>
                      <input
                        type="text"
                        name="utrNumber"
                        placeholder="12-digit UTR number"
                        value={formData.utrNumber}
                        onChange={handleInputChange}
                        style={{ padding: "8px 12px", fontSize: "0.85rem", background: "#FFFFFF" }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Card Subpanel */}
            {paymentMethod === "card" && (
              <div className="payment-subpanel form-grid" style={{ marginTop: 16 }}>
                <label className="field wide">
                  <span>Card Number *</span>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="field">
                  <span>Expiry Date *</span>
                  <input
                    type="text"
                    name="cardExpiry"
                    placeholder="MM / YY"
                    maxLength={5}
                    value={formData.cardExpiry}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="field">
                  <span>CVV / CVC *</span>
                  <input
                    type="password"
                    name="cardCvv"
                    placeholder="CVV"
                    maxLength={4}
                    value={formData.cardCvv}
                    onChange={handleInputChange}
                  />
                </label>
              </div>
            )}

            {/* Net Banking Subpanel */}
            {paymentMethod === "netbanking" && (
              <div className="payment-subpanel" style={{ marginTop: 16 }}>
                <label className="field">
                  <span>Select Your Bank *</span>
                  <select
                    name="selectedBank"
                    value={formData.selectedBank}
                    onChange={handleInputChange}
                    className="field-select"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                  </select>
                </label>
              </div>
            )}
          </section>

          {error && (
            <p className="notice notice--error" role="alert" style={{ marginTop: 20 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="button button--gold button--large"
            disabled={submitting}
            style={{ marginTop: 32, width: "100%", padding: "16px 24px", fontSize: "1.05rem" }}
          >
            {submitting ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Loader2 size={18} className="animate-spin" /> {processingStatus || "Processing Payment..."}
              </span>
            ) : paymentMethod === "razorpay" ? (
              `Pay with Razorpay • ${formatPrice(finalTotal)}`
            ) : (
              `Confirm Order • ${formatPrice(finalTotal)}`
            )}
          </button>

          <p className="checkout-guarantee" style={{ marginTop: 14, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: "0.78rem", color: "#64748B" }}>
            <Lock size={13} color="#64748B" />
            <span>By placing your order, you agree to Nilasa&apos;s Terms of Sale. Complimentary Pan-India Express Delivery & 7-day hassle-free returns.</span>
          </p>
        </form>

        {/* Sidebar Order Summary */}
        <aside className="checkout-sidebar">
          <div className="checkout-summary-card">
            <h3 className="summary-title">Order Summary ({items.length} item{items.length > 1 ? "s" : ""})</h3>

            <div className="summary-items-list">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="summary-item-row">
                  <div className="summary-item-img">
                    <Image
                      src={item.image || "/images/hero-festive.jpg"}
                      alt={item.name}
                      width={52}
                      height={68}
                      style={{ objectFit: "cover", borderRadius: 6 }}
                    />
                    <span className="summary-item-qty">{item.quantity}</span>
                  </div>
                  <div className="summary-item-details">
                    <h4 className="summary-item-name">{item.name}</h4>
                    <span className="summary-item-meta">Size: {item.size}</span>
                    <span className="summary-item-price">{formatPrice(item.basePrice * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyCoupon} className="checkout-coupon-form" style={{ marginTop: 20 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-mono)"
                  }}
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponCode.trim()}
                  className="button button--lavender-glass"
                  style={{ padding: "8px 16px", fontSize: "0.82rem", fontWeight: 700 }}
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
              {appliedCoupon && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, background: "#F0FDF4", padding: "6px 10px", borderRadius: 6, border: "1px solid #BBF7D0" }}>
                  <span style={{ fontSize: "0.75rem", color: "#166534", fontWeight: 600 }}>
                    ✨ Coupon Applied: {appliedCoupon.code} (-{formatPrice(discountAmount)})
                  </span>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(null)}
                    style={{ background: "none", border: "none", color: "#DC2626", fontSize: "0.72rem", cursor: "pointer", fontWeight: 700 }}
                  >
                    Remove
                  </button>
                </div>
              )}
              {couponError && (
                <p style={{ color: "#DC2626", fontSize: "0.75rem", margin: "6px 0 0" }}>{couponError}</p>
              )}
            </form>

            {/* Price Calculations */}
            <div className="summary-breakdown" style={{ marginTop: 20, borderTop: "1px solid #ECE7F2", paddingTop: 14 }}>
              <div className="breakdown-row">
                <span>Subtotal</span>
                <span className="price">{formatPrice(total)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="breakdown-row discount">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span className="price">- {formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="breakdown-row">
                <span>Pan-India Shipping</span>
                <span style={{ color: "#15803D", fontWeight: 600 }}>FREE</span>
              </div>
              <div className="breakdown-row total" style={{ borderTop: "1px solid #ECE7F2", paddingTop: 12, marginTop: 8 }}>
                <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>Payable Total</span>
                <span className="price" style={{ fontSize: "1.2rem", fontWeight: 800, color: "#354232" }}>
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            <div style={{ marginTop: 18, background: "#FAF8F5", padding: "10px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={18} color="#354232" />
              <span style={{ fontSize: "0.75rem", color: "#64748B" }}>
                100% Authentic Handcrafted Fabrics • Inspected Before Dispatch
              </span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
