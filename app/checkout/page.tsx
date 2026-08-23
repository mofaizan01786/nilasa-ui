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
  verifyPaymentBackend,
  validateCoupon,
  fetchUserAddresses,
  createUserAddress
} from "@/lib/dotnet-backend";
import { SavedAddress } from "@/lib/types";
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
  AlertCircle,
  User,
  MapPin,
  Home,
  Plus,
  Save,
  CheckCircle
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

  // Saved Addresses state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState<"Home" | "Work" | "Other">("Home");
  const [savingNewAddress, setSavingNewAddress] = useState(false);
  const [addressSaveSuccess, setAddressSaveSuccess] = useState("");

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

  // Load saved delivery addresses from .NET backend API
  const loadUserSavedAddresses = async () => {
    const activeToken = token || (typeof window !== "undefined" ? window.localStorage.getItem("nilasa-auth-token") : null);
    if (activeToken) {
      setAddressesLoading(true);
      try {
        const list = await fetchUserAddresses(activeToken);
        if (Array.isArray(list) && list.length > 0) {
          setSavedAddresses(list);
          const defaultAddr = list.find((a) => a.isDefault) || list[0];
          setSelectedAddressId((prev) => prev || defaultAddr.addressId);
          setUseNewAddress(false);
        } else {
          setSavedAddresses([]);
          setUseNewAddress(true);
        }
      } catch {
        setUseNewAddress(true);
      } finally {
        setAddressesLoading(false);
      }
    } else {
      setUseNewAddress(true);
    }
  };

  useEffect(() => {
    loadUserSavedAddresses();
  }, [token, isAuthenticated]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Direct standalone "Save & Deliver to this Address" handler
  const handleSaveAndSelectAddress = async () => {
    if (!formData.address.trim() || !formData.city.trim() || !formData.postalCode.trim()) {
      setError("Please fill in Street Address, City, and PIN Code.");
      return;
    }

    const activeToken = token || (typeof window !== "undefined" ? window.localStorage.getItem("nilasa-auth-token") : null);
    if (!activeToken) {
      setError("Sign in to save this address to your account profile.");
      return;
    }

    setSavingNewAddress(true);
    setError("");
    setAddressSaveSuccess("");

    try {
      const created = await createUserAddress(
        {
          label: newAddressLabel,
          addressLine1: formData.address.trim(),
          addressLine2: null,
          city: formData.city.trim(),
          state: formData.state.trim() || "Uttar Pradesh",
          pincode: formData.postalCode.trim(),
          country: "India",
          isDefault: savedAddresses.length === 0
        },
        activeToken
      );

      if (created && created.addressId) {
        setSavedAddresses((prev) => [created, ...prev]);
        setSelectedAddressId(created.addressId);
        setUseNewAddress(false);
        setAddressSaveSuccess("Address saved successfully and selected for delivery!");
        setTimeout(() => setAddressSaveSuccess(""), 4000);
      } else {
        setError("Could not save address to database. You can still proceed with checkout.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save address to server.");
    } finally {
      setSavingNewAddress(false);
    }
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
      const data = await validateCoupon(cleanCode, total, activeToken || undefined);

      if (data && data.isValid) {
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
      } else if (data && !data.isValid) {
        setCouponError(data.message || "This coupon code is invalid or expired.");
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

  // ── Authoritative .NET Backend Razorpay Checkout Execution ──
  const executeAuthoritativeRazorpayCheckout = async () => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      throw new Error("Unable to load Razorpay payment gateway. Please check your network connection.");
    }

    const activeToken = token || (typeof window !== "undefined" ? window.localStorage.getItem("nilasa-auth-token") : null);

    if (!activeToken) {
      router.push("/login?redirect=/checkout");
      throw new Error("Please sign in to your Nilasa account to proceed with checkout.");
    }

    // 1. Step 1: Create or Reuse Order on .NET API (POST /api/v1/orders)
    let orderIdToUse = activeOrderId;

    if (!orderIdToUse) {
      setProcessingStatus("Creating order on secure server...");

      const orderPayload: any = {
        items: items.map((item) => ({
          productVariantId: item.variantId || item.productId || 1,
          quantity: item.quantity
        })),
        totalAmount: finalTotal,
        paymentMethod: "razorpay",
        itemsList: items,
        couponCode: appliedCoupon?.code,
        discountApplied: discountAmount
      };

      if (!useNewAddress && selectedAddressId) {
        orderPayload.addressId = selectedAddressId;
      } else {
        orderPayload.shippingAddress = {
          label: newAddressLabel,
          addressLine1: formData.address.trim(),
          addressLine2: null,
          city: formData.city.trim() || "Kanpur",
          state: formData.state.trim() || "Uttar Pradesh",
          pincode: formData.postalCode.trim() || "208001",
          country: "India",
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          postalCode: formData.postalCode
        };
      }

      const orderRes = await createOrderBackend(orderPayload, activeToken);

      if (!orderRes.success || !orderRes.orderId) {
        throw new Error(orderRes.error || "Failed to create order on server. Please try again.");
      }

      orderIdToUse = orderRes.orderId;
      setActiveOrderId(orderIdToUse);
    }

    // 2. Step 2: Initiate Payment on .NET API (POST /api/v1/payments/initiate)
    setProcessingStatus("Initializing payment gateway...");
    const initRes = await initiatePaymentBackend(orderIdToUse, `checkout-${orderIdToUse}-${Date.now()}`, undefined, activeToken || undefined);

    if (!initRes.success || !initRes.data) {
      throw new Error(initRes.error || "Failed to initiate payment gateway session.");
    }

    const { gatewayOrderId, gatewayKey, amount, currency } = initRes.data;

    // 3. Step 3: Open Razorpay Gateway Popup
    return new Promise<void>((resolve, reject) => {
      const options = {
        key: gatewayKey || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: Math.round(amount * 100),
        currency: currency || "INR",
        name: "Nilasa",
        description: `Authoritative Order #${orderIdToUse} Payment`,
        order_id: gatewayOrderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#354232"
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setProcessingStatus("Verifying signature with server...");
          try {
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

            clear();
            resolve();
            router.push(`/order-confirmation?order=${orderIdToUse}&method=razorpay`);
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

    // Validate essential fields if using a new address
    if (useNewAddress && (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim())) {
      setError("Please fill in your name, phone number, and delivery address.");
      return;
    }

    setSubmitting(true);
    setError("");
    setProcessingStatus(paymentMethod === "cod" ? "Placing Cash on Delivery order..." : "Preparing order...");

    try {
      const activeToken = token || (typeof window !== "undefined" ? window.localStorage.getItem("nilasa-auth-token") : null);
      if (!activeToken) {
        setError("Please sign in or create an account to proceed with checkout.");
        setSubmitting(false);
        setProcessingStatus("");
        router.push("/login?redirect=/checkout");
        return;
      }

      // 1. Authoritative Online Gateway Checkout
      if (paymentMethod === "razorpay" || paymentMethod === "card" || paymentMethod === "netbanking") {
        await executeAuthoritativeRazorpayCheckout();
        return;
      }

      // 2. Direct COD / Manual UPI Order Placement
      const orderPayload: any = {
        items: items.map((item) => ({
          productVariantId: item.variantId || item.productId || 1,
          quantity: item.quantity
        })),
        totalAmount: finalTotal,
        paymentMethod: paymentMethod,
        itemsList: items,
        couponCode: appliedCoupon?.code,
        discountApplied: discountAmount
      };

      if (!useNewAddress && selectedAddressId) {
        orderPayload.addressId = selectedAddressId;
      } else {
        orderPayload.shippingAddress = {
          label: newAddressLabel,
          addressLine1: formData.address.trim(),
          addressLine2: null,
          city: formData.city.trim() || "Kanpur",
          state: formData.state.trim() || "Uttar Pradesh",
          pincode: formData.postalCode.trim() || "208001",
          country: "India",
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          postalCode: formData.postalCode
        };
      }

      const orderRes = await createOrderBackend(orderPayload, activeToken);

      if (!orderRes.success || !orderRes.orderId) {
        throw new Error(orderRes.error || "Order processing failed. Please try again.");
      }

      clear();
      router.push(`/order-confirmation?order=${orderRes.orderId}&method=${paymentMethod}`);
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
          {/* Guest Sign-In Notice */}
          {!isAuthenticated && (
            <div
              style={{
                background: "#FFFBEB",
                border: "1px solid #FDE68A",
                borderRadius: 10,
                padding: "14px 18px",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <User size={20} color="#D97706" />
                <div>
                  <strong style={{ color: "#92400E", fontSize: "0.88rem", display: "block" }}>
                    Sign in required for order placement
                  </strong>
                  <span style={{ color: "#B45309", fontSize: "0.80rem" }}>
                    Please log in to your account to save your order on the backend.
                  </span>
                </div>
              </div>
              <Link
                href="/login?redirect=/checkout"
                className="button button--gold"
                style={{ fontSize: "0.78rem", padding: "7px 16px", whiteSpace: "nowrap" }}
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Section 1: Delivery Address Selection */}
          <section className="checkout-section">
            <div className="checkout-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="step-number">1</span>
                <div>
                  <h2>Delivery Address</h2>
                  <p style={{ fontSize: "12px", color: "var(--ink-muted)", margin: "2px 0 0" }}>
                    Select where you want your order delivered across India
                  </p>
                </div>
              </div>

              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setUseNewAddress(!useNewAddress);
                    setError("");
                  }}
                  className="button button--lavender-glass"
                  style={{
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: 6,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  {useNewAddress ? "← Choose From Saved Addresses" : "+ Add New Address"}
                </button>
              )}
            </div>

            {/* Address Save Success Alert */}
            {addressSaveSuccess && (
              <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "10px 14px", borderRadius: 8, color: "#065F46", fontSize: "13px", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <CheckCircle size={16} color="#059669" />
                <span>{addressSaveSuccess}</span>
              </div>
            )}

            {/* Case A: User has saved addresses and is choosing from them */}
            {savedAddresses.length > 0 && !useNewAddress ? (
              <div style={{ marginTop: 14 }}>
                <div className="address-cards-grid">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.addressId;
                    return (
                      <div
                        key={addr.addressId}
                        onClick={() => setSelectedAddressId(addr.addressId)}
                        className={`luxury-address-card ${isSelected ? "luxury-address-card--selected" : ""}`}
                      >
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <span className="address-type-pill">
                              {addr.label === "Home" ? <Home size={12} /> : addr.label === "Work" ? <Building2 size={12} /> : <MapPin size={12} />}
                              {addr.label}
                            </span>

                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              {addr.isDefault && (
                                <span style={{ fontSize: "9px", fontWeight: 700, color: "#92400E", background: "#FEF3C7", padding: "2px 6px", borderRadius: 4 }}>
                                  DEFAULT
                                </span>
                              )}
                              <div
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: "50%",
                                  border: isSelected ? "5px solid var(--nilasa-gold)" : "2px solid #CBD5E1",
                                  backgroundColor: "#FFFFFF",
                                  transition: "all 0.15s ease"
                                }}
                              />
                            </div>
                          </div>

                          <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#1A1D20", fontSize: "13px", lineHeight: 1.4 }}>
                            {addr.addressLine1}
                          </p>
                          {addr.addressLine2 && (
                            <p style={{ margin: "0 0 4px", color: "#64748B", fontSize: "12px" }}>
                              {addr.addressLine2}
                            </p>
                          )}
                          <p style={{ margin: 0, color: "#64748B", fontSize: "12px", fontWeight: 500 }}>
                            {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                          </p>
                        </div>

                        {isSelected && (
                          <div style={{ marginTop: 12, paddingTop: 8, borderTop: "1px solid #EAE5D9", display: "flex", alignItems: "center", gap: 4, fontSize: "11px", color: "#059669", fontWeight: 600 }}>
                            <Check size={13} />
                            <span>Deliver to this location</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 14, textAlign: "right" }}>
                  <button
                    type="button"
                    onClick={() => setUseNewAddress(true)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--nilasa-gold)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    <Plus size={14} />
                    <span>Deliver to a different / new address</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Case B: User entering a new address */
              <div className="address-form-box">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    Select Address Label
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["Home", "Work", "Other"] as const).map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setNewAddressLabel(lbl)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 6,
                          fontSize: "12px",
                          fontWeight: 600,
                          border: newAddressLabel === lbl ? "1.5px solid var(--nilasa-gold)" : "1px solid #CBD5E1",
                          background: newAddressLabel === lbl ? "var(--nilasa-card)" : "#FFFFFF",
                          color: newAddressLabel === lbl ? "var(--nilasa-indigo)" : "#64748B",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        {lbl === "Home" ? "🏠 Home" : lbl === "Work" ? "🏢 Work" : "📍 Other"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="address-form-grid-2">
                  <label className="field">
                    <span>Full Name *</span>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="e.g. Mohd Faizan"
                      value={formData.name}
                      onChange={handleInputChange}
                      autoComplete="name"
                      style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: "13px" }}
                    />
                  </label>

                  <label className="field">
                    <span>Phone Number *</span>
                    <input
                      name="phone"
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      autoComplete="tel"
                      style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: "13px" }}
                    />
                  </label>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="field wide">
                    <span>Email Address (for Invoice & Receipt) *</span>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="name@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      autoComplete="email"
                      style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: "13px" }}
                    />
                  </label>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="field wide">
                    <span>Flat / House No. / Building / Street Address *</span>
                    <input
                      name="address"
                      type="text"
                      required
                      placeholder="e.g. Flat 402, Lotus Court, Civil Lines"
                      value={formData.address}
                      onChange={handleInputChange}
                      autoComplete="street-address"
                      style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: "13px" }}
                    />
                  </label>
                </div>

                <div className="address-form-grid-3">
                  <label className="field">
                    <span>City *</span>
                    <input
                      name="city"
                      type="text"
                      required
                      placeholder="e.g. Kanpur"
                      value={formData.city}
                      onChange={handleInputChange}
                      autoComplete="address-level2"
                      style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: "13px" }}
                    />
                  </label>

                  <label className="field">
                    <span>State *</span>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      style={{
                        padding: "10px 12px",
                        border: "1px solid #CBD5E1",
                        borderRadius: 8,
                        backgroundColor: "#FFFFFF",
                        fontSize: "13px",
                        outline: "none"
                      }}
                    >
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Delhi">Delhi / NCR</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Other">Other State / UT</option>
                    </select>
                  </label>

                  <label className="field">
                    <span>PIN Code *</span>
                    <input
                      name="postalCode"
                      type="text"
                      required
                      placeholder="6-digit PIN"
                      maxLength={6}
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      autoComplete="postal-code"
                      style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: "13px" }}
                    />
                  </label>
                </div>

                {/* Direct Save Address Action Bar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, borderTop: "1px solid #EAE5D9", paddingTop: 14 }}>
                  <button
                    type="button"
                    onClick={handleSaveAndSelectAddress}
                    disabled={savingNewAddress}
                    className="button button--gold"
                    style={{ fontSize: "12px", padding: "9px 20px", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700 }}
                  >
                    {savingNewAddress ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>{savingNewAddress ? "Saving to Account..." : "Save Address & Select"}</span>
                  </button>

                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setUseNewAddress(false)}
                      className="button button--lavender-glass"
                      style={{ fontSize: "12px", padding: "8px 16px" }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Section 2: Authoritative Payment Method Selector */}
          <section className="checkout-section" style={{ marginTop: 24 }}>
            <div className="checkout-section-header">
              <span className="step-number">2</span>
              <div>
                <h2>Payment Method</h2>
                <p style={{ color: "var(--ink-muted)", fontSize: "12px", margin: "2px 0 0" }}>
                  All transactions are encrypted and authoritatively verified on server.
                </p>
              </div>
            </div>

            <div className="payment-options-grid">
              {/* Option A: Razorpay All-in-One Gateway */}
              <label className={`payment-option-card ${paymentMethod === "razorpay" ? "payment-option-card--active" : ""}`}>
                <div className="payment-radio-wrap">
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                  />
                </div>
                <div className="payment-option-content">
                  <div className="payment-title-row">
                    <div className="payment-name-wrap">
                      <CreditCard size={18} className="payment-icon-olive" />
                      <span className="payment-name">Razorpay Instant Gateway (UPI, Cards, Netbanking)</span>
                    </div>
                    <span className="payment-pill-recommend">RECOMMENDED</span>
                  </div>
                  <p className="payment-desc">Pay instantly with Google Pay, PhonePe, Paytm, Any Debit/Credit Card, or Netbanking.</p>
                </div>
              </label>

              {/* Option B: Direct QR Code / UPI */}
              <label className={`payment-option-card ${paymentMethod === "upi" ? "payment-option-card--active" : ""}`}>
                <div className="payment-radio-wrap">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === "upi"}
                    onChange={() => setPaymentMethod("upi")}
                  />
                </div>
                <div className="payment-option-content">
                  <div className="payment-title-row">
                    <div className="payment-name-wrap">
                      <QrCode size={18} className="payment-icon-olive" />
                      <span className="payment-name">Direct UPI & Dynamic QR Transfer</span>
                    </div>
                  </div>
                  <p className="payment-desc">Scan official Nilasa merchant QR code with any UPI app.</p>
                </div>
              </label>

              {/* Option C: Credit / Debit Card Direct */}
              <label className={`payment-option-card ${paymentMethod === "card" ? "payment-option-card--active" : ""}`}>
                <div className="payment-radio-wrap">
                  <input
                    type="radio"
                    name="payment"
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
                  </div>
                  <p className="payment-desc">Visa, MasterCard, RuPay, and American Express cards accepted.</p>
                </div>
              </label>

              {/* Option D: Netbanking Direct */}
              <label className={`payment-option-card ${paymentMethod === "netbanking" ? "payment-option-card--active" : ""}`}>
                <div className="payment-radio-wrap">
                  <input
                    type="radio"
                    name="payment"
                    value="netbanking"
                    checked={paymentMethod === "netbanking"}
                    onChange={() => setPaymentMethod("netbanking")}
                  />
                </div>
                <div className="payment-option-content">
                  <div className="payment-title-row">
                    <div className="payment-name-wrap">
                      <Building2 size={18} className="payment-icon-olive" />
                      <span className="payment-name">Net Banking (50+ Indian Banks)</span>
                    </div>
                  </div>
                  <p className="payment-desc">Transfer directly via HDFC, ICICI, SBI, Axis, Kotak, and all major Indian banks.</p>
                </div>
              </label>

              {/* Option E: Cash on Delivery (COD) */}
              <label className={`payment-option-card ${paymentMethod === "cod" ? "payment-option-card--active" : ""}`}>
                <div className="payment-radio-wrap">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                </div>
                <div className="payment-option-content">
                  <div className="payment-title-row">
                    <div className="payment-name-wrap">
                      <Banknote size={18} className="payment-icon-olive" />
                      <span className="payment-name">Cash on Delivery (COD)</span>
                    </div>
                  </div>
                  <p className="payment-desc">Pay cash or UPI at your doorstep upon courier arrival.</p>
                </div>
              </label>
            </div>

            {/* Dynamic UPI Instructions Drawer */}
            {paymentMethod === "upi" && (
              <div
                style={{
                  marginTop: 18,
                  padding: 20,
                  backgroundColor: "#FAF8FD",
                  border: "1px solid #E8E0F0",
                  borderRadius: 10
                }}
              >
                <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ textAlign: "center", padding: 8, background: "#FFFFFF", borderRadius: 8, border: "1px solid #E2D9EE" }}>
                    <Image
                      src={qrCodeImageUrl}
                      alt="Nilasa Official UPI QR Code"
                      width={160}
                      height={160}
                      style={{ display: "block" }}
                      unoptimized
                    />
                    <span style={{ fontSize: "11px", color: "var(--nilasa-indigo)", fontWeight: 600, marginTop: 4, display: "block" }}>
                      Scan to Pay {formatPrice(finalTotal)}
                    </span>
                  </div>

                  <div style={{ flex: 1, minWidth: 240 }}>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", color: "var(--nilasa-indigo)" }}>
                      Nilasa Official Merchant UPI ID
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <code
                        style={{
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #D8CEE6",
                          padding: "6px 10px",
                          borderRadius: 4,
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "var(--nilasa-indigo)"
                        }}
                      >
                        {NILASA_UPI_VPA}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof navigator !== "undefined") {
                            navigator.clipboard.writeText(NILASA_UPI_VPA);
                            setCopiedUpi(true);
                            setTimeout(() => setCopiedUpi(false), 2500);
                          }
                        }}
                        style={{
                          border: "1px solid #D8CEE6",
                          background: "#FFFFFF",
                          padding: "6px 10px",
                          borderRadius: 4,
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        {copiedUpi ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                        <span>{copiedUpi ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>

                    <label style={{ display: "block", fontSize: "12px", color: "var(--ink-muted)", marginBottom: 4 }}>
                      UPI Reference / UTR Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="utrNumber"
                      placeholder="12-digit UTR from your bank app"
                      value={formData.utrNumber}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #D8CEE6",
                        borderRadius: 6,
                        fontSize: "13px",
                        backgroundColor: "#FFFFFF"
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Submission Feedback & Error Alerts */}
          {error && (
            <div
              style={{
                marginTop: 20,
                padding: "12px 16px",
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 8,
                color: "#991B1B",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "13px"
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <div style={{ marginTop: 24 }}>
            <button
              type="submit"
              disabled={submitting}
              className="button button--gold button--full"
              style={{
                padding: "16px 24px",
                fontSize: "15px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{processingStatus || "Processing Order..."}</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>
                    {paymentMethod === "cod"
                      ? `Confirm Cash on Delivery Order • ${formatPrice(finalTotal)}`
                      : `Proceed to Pay • ${formatPrice(finalTotal)}`}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Order Summary Sidebar */}
        <aside className="checkout-summary">
          <div className="checkout-summary-card">
            <h2>Order Summary ({items.reduce((sum, item) => sum + item.quantity, 0)} Items)</h2>

            {/* Cart Items Mini List */}
            <div className="checkout-items-list" style={{ maxHeight: 280, overflowY: "auto", margin: "14px 0" }}>
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 0",
                    borderBottom: "1px solid #F1EFEA"
                  }}
                >
                  <div style={{ width: 44, height: 56, position: "relative", borderRadius: 4, overflow: "hidden", flexShrink: 0 }}>
                    <Image
                      src={item.image || "/images/placeholder.jpg"}
                      alt={item.name}
                      fill
                      sizes="44px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 2px 0", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.name}
                    </p>
                    <span style={{ fontSize: "11px", color: "var(--ink-muted)" }}>
                      Size: {item.size} • Qty: {item.quantity}
                    </span>
                  </div>
                  <strong style={{ fontSize: "13px", color: "var(--nilasa-indigo)" }}>
                    {formatPrice(item.basePrice * item.quantity)}
                  </strong>
                </div>
              ))}
            </div>

            {/* Coupon Application Box */}
            <div style={{ borderTop: "1px solid #ECEAE5", paddingTop: 14, marginBottom: 14 }}>
              {appliedCoupon ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    background: "#ECFDF5",
                    border: "1px solid #A7F3D0",
                    borderRadius: 6
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Tag size={14} color="#059669" />
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#065F46" }}>
                      {appliedCoupon.code} ({appliedCoupon.name})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(null)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#DC2626",
                      fontSize: "11px",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} style={{ display: "flex", gap: 6 }}>
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. NILASA10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      fontSize: "12px",
                      border: "1px solid var(--nilasa-border)",
                      borderRadius: 6,
                      textTransform: "uppercase"
                    }}
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="button button--lavender-glass"
                    style={{ fontSize: "12px", padding: "8px 12px" }}
                  >
                    {couponLoading ? "Applying..." : "Apply"}
                  </button>
                </form>
              )}
              {couponError && (
                <p style={{ margin: "6px 0 0 0", fontSize: "11px", color: "#DC2626" }}>{couponError}</p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="summary-rows" style={{ borderTop: "1px solid #ECEAE5", paddingTop: 12 }}>
              <div className="summary-row">
                <span>Bag Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="summary-row" style={{ color: "#059669" }}>
                  <span>Coupon Savings</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="summary-row">
                <span>Complimentary Express Delivery</span>
                <span style={{ color: "#059669", fontWeight: 600 }}>FREE</span>
              </div>

              <div className="summary-row summary-row--total" style={{ borderTop: "1px solid #ECEAE5", paddingTop: 10, marginTop: 8 }}>
                <strong>Payable Grand Total</strong>
                <strong style={{ fontSize: "18px", color: "var(--nilasa-gold)" }}>
                  {formatPrice(finalTotal)}
                </strong>
              </div>
            </div>

            {/* Trust Badges */}
            <div style={{ marginTop: 18, borderTop: "1px solid #ECEAE5", paddingTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "11px", color: "var(--ink-muted)", marginBottom: 6 }}>
                <ShieldCheck size={14} color="#059669" />
                <span>100% Genuine Handcrafted Luxury Quality</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "11px", color: "var(--ink-muted)" }}>
                <Lock size={14} color="#059669" />
                <span>256-bit Encrypted Secure Payment Processing</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
