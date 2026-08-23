"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Order, SavedAddress } from "@/lib/types";
import {
  fetchOrdersAuthoritative,
  fetchUserAddresses,
  createUserAddress,
  setDefaultUserAddress,
  deleteUserAddress
} from "@/lib/dotnet-backend";
import { formatPrice } from "@/lib/catalog";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import {
  User,
  ShoppingBag,
  Lock,
  LogOut,
  MapPin,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Plus,
  Trash2,
  Check,
  Building2,
  Home,
  Loader2,
  Save
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, logout, updatePassword } = useAuth();

  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "profile" | "security">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Address states
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [addressSuccess, setAddressSuccess] = useState("");
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "Uttar Pradesh",
    pincode: "",
    country: "India",
    isDefault: false
  });

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?redirect=/account");
    }
  }, [isLoading, isAuthenticated, router]);

  // Load customer orders directly from .NET backend API
  useEffect(() => {
    if (isAuthenticated && token) {
      setOrdersLoading(true);
      fetchOrdersAuthoritative(undefined, token)
        .then((data: any) => {
          if (Array.isArray(data)) setOrders(data);
        })
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
    }
  }, [isAuthenticated, token]);

  // Load saved delivery addresses from .NET backend API
  const loadAddresses = async () => {
    if (isAuthenticated && token) {
      setAddressesLoading(true);
      try {
        const list = await fetchUserAddresses(token);
        setAddresses(list);
      } catch {
        // ignore
      } finally {
        setAddressesLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      loadAddresses();
    }
  }, [isAuthenticated, token]);

  const handleSaveAddress = async (e: FormEvent) => {
    e.preventDefault();
    setAddressError("");
    setAddressSuccess("");

    if (!newAddress.addressLine1.trim() || !newAddress.city.trim() || !newAddress.pincode.trim()) {
      setAddressError("Please fill in Address Line 1, City, and PIN Code.");
      return;
    }

    setAddressSaving(true);
    try {
      const created = await createUserAddress(newAddress, token || undefined);
      if (created) {
        setAddressSuccess("Delivery address saved successfully.");
        setShowAddressForm(false);
        setNewAddress({
          label: "Home",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "Uttar Pradesh",
          pincode: "",
          country: "India",
          isDefault: false
        });
        await loadAddresses();
      } else {
        setAddressError("Failed to save address. Please try again.");
      }
    } catch (err: any) {
      setAddressError(err.message || "Network error while saving address.");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      const ok = await setDefaultUserAddress(id, token || undefined);
      if (ok) await loadAddresses();
    } catch {
      // ignore
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm("Are you sure you want to remove this delivery address?")) return;
    try {
      const ok = await deleteUserAddress(id, token || undefined);
      if (ok) await loadAddresses();
    } catch {
      // ignore
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    const result = await updatePassword(currentPassword, newPassword);
    if (result.success) {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } else {
      setPasswordError(result.error || "Failed to update password.");
    }
    setPasswordLoading(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--ink-muted)", fontSize: "14px" }}>Loading account details...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "80vh", padding: "30px 0 80px" }}>
      <div className="shell">
        {/* Account Header Banner */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--nilasa-border)",
            borderRadius: 14,
            padding: "24px 28px",
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                backgroundColor: "var(--nilasa-card)",
                border: "1.5px solid var(--nilasa-gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <User size={24} color="var(--nilasa-gold)" />
            </div>
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "var(--nilasa-indigo)",
                  margin: "0 0 4px 0"
                }}
              >
                Welcome back, {user?.name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "13px", color: "var(--ink-muted)", flexWrap: "wrap" }}>
                <span>{user?.email}</span>
                <span>•</span>
                <span
                  style={{
                    backgroundColor: "var(--nilasa-card)",
                    color: "var(--nilasa-gold)",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}
                >
                  Nilasa Club Member
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "transparent",
              color: "var(--status-danger)",
              border: "1px solid #F8C8C3",
              borderRadius: 6,
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer"
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Account Tabs & Content Grid */}
        <div className="account-layout-grid" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24, alignItems: "flex-start" }}>
          {/* Navigation Sidebar */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--nilasa-border)",
              borderRadius: 12,
              padding: "12px",
              height: "fit-content"
            }}
          >
            <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: activeTab === "orders" ? "var(--nilasa-card)" : "transparent",
                  color: activeTab === "orders" ? "var(--nilasa-indigo)" : "var(--ink-muted)",
                  fontWeight: activeTab === "orders" ? 700 : 500,
                  fontSize: "13px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <ShoppingBag size={16} color={activeTab === "orders" ? "var(--nilasa-gold)" : "var(--ink-muted)"} />
                <span>My Orders ({orders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("addresses")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: activeTab === "addresses" ? "var(--nilasa-card)" : "transparent",
                  color: activeTab === "addresses" ? "var(--nilasa-indigo)" : "var(--ink-muted)",
                  fontWeight: activeTab === "addresses" ? 700 : 500,
                  fontSize: "13px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <MapPin size={16} color={activeTab === "addresses" ? "var(--nilasa-gold)" : "var(--ink-muted)"} />
                <span>Saved Addresses ({addresses.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: activeTab === "profile" ? "var(--nilasa-card)" : "transparent",
                  color: activeTab === "profile" ? "var(--nilasa-indigo)" : "var(--ink-muted)",
                  fontWeight: activeTab === "profile" ? 700 : 500,
                  fontSize: "13px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <User size={16} color={activeTab === "profile" ? "var(--nilasa-gold)" : "var(--ink-muted)"} />
                <span>Personal Details</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("security")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: activeTab === "security" ? "var(--nilasa-card)" : "transparent",
                  color: activeTab === "security" ? "var(--nilasa-indigo)" : "var(--ink-muted)",
                  fontWeight: activeTab === "security" ? 700 : 500,
                  fontSize: "13px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <Lock size={16} color={activeTab === "security" ? "var(--nilasa-gold)" : "var(--ink-muted)"} />
                <span>Security & Password</span>
              </button>
            </nav>
          </div>

          {/* Main Tab Content */}
          <div>
            {/* ── ORDERS TAB ── */}
            {activeTab === "orders" && (
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--nilasa-border)",
                  borderRadius: 14,
                  padding: "24px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--nilasa-indigo)", margin: 0 }}>
                    Order History
                  </h2>
                  <Link href="/shop" className="button button--gold" style={{ fontSize: "12px", padding: "6px 14px" }}>
                    Continue Shopping
                  </Link>
                </div>

                {ordersLoading ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-muted)" }}>
                    <p>Loading your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 0" }}>
                    <ShoppingBag size={36} color="var(--nilasa-gold)" style={{ margin: "0 auto 12px", opacity: 0.7 }} />
                    <p style={{ fontWeight: 600, color: "var(--nilasa-indigo)", margin: "0 0 6px" }}>No orders placed yet</p>
                    <p style={{ color: "var(--ink-muted)", fontSize: "13px", margin: "0 0 20px" }}>
                      Explore our handcrafted collections and experience pure artisanal luxury.
                    </p>
                    <Link href="/shop" className="button button--gold" style={{ fontSize: "13px" }}>
                      Discover Collections →
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {orders.map((order) => {
                      const orderDate = new Date(order.placedAt || order.createdAt || Date.now()).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      });

                      return (
                        <div
                          key={order.orderId || order.id}
                          style={{
                            border: "1px solid var(--nilasa-border)",
                            borderRadius: 10,
                            padding: "16px 20px",
                            backgroundColor: "#FAFAFA"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                                <span style={{ fontWeight: 700, color: "var(--nilasa-indigo)", fontSize: "14px" }}>
                                  #{order.orderNumber || `NIL-${order.orderId || order.id}`}
                                </span>
                                <OrderStatusBadge status={order.status} />
                              </div>
                              <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>Placed on {orderDate}</span>
                            </div>

                            <div style={{ textAlign: "right" }}>
                              <span style={{ fontSize: "11px", color: "var(--ink-muted)", display: "block" }}>Total Amount</span>
                              <strong style={{ fontSize: "15px", color: "var(--nilasa-indigo)" }}>
                                {formatPrice(order.totalAmount)}
                              </strong>
                            </div>
                          </div>

                          <div style={{ borderTop: "1px solid #ECEAE5", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>
                              {order.items?.length || 1} item{order.items?.length !== 1 ? "s" : ""} • Payment: {order.paymentMethod?.toUpperCase() || "COD"}
                            </span>
                            <Link
                              href={`/order-confirmation?order=${order.orderId || order.id}`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "var(--nilasa-gold)"
                              }}
                            >
                              <span>View Receipt</span>
                              <ExternalLink size={12} />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── SAVED ADDRESSES TAB ── */}
            {activeTab === "addresses" && (
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--nilasa-border)",
                  borderRadius: 14,
                  padding: "24px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--nilasa-indigo)", margin: "0 0 2px" }}>
                      Saved Delivery Addresses
                    </h2>
                    <p style={{ color: "var(--ink-muted)", fontSize: "13px", margin: 0 }}>
                      Manage addresses for rapid, one-click checkout across India.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="button button--gold"
                    style={{ fontSize: "12px", padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <Plus size={14} />
                    <span>{showAddressForm ? "Cancel" : "Add New Address"}</span>
                  </button>
                </div>

                {addressSuccess && (
                  <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "10px 14px", borderRadius: 8, color: "#065F46", fontSize: "13px", marginBottom: 16 }}>
                    {addressSuccess}
                  </div>
                )}

                {/* Inline Address Creation Form */}
                {showAddressForm && (
                  <form onSubmit={handleSaveAddress} className="address-form-box" style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 14px", color: "#1A1D20" }}>
                      Add New Delivery Destination
                    </h3>

                    {addressError && (
                      <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", padding: "8px 12px", borderRadius: 6, color: "#991B1B", fontSize: "12px", marginBottom: 12 }}>
                        {addressError}
                      </div>
                    )}

                    <div style={{ marginBottom: 14 }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Address Type</span>
                      <div style={{ display: "flex", gap: 10 }}>
                        {["Home", "Work", "Other"].map((lbl) => (
                          <button
                            key={lbl}
                            type="button"
                            onClick={() => setNewAddress({ ...newAddress, label: lbl })}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 6,
                              fontSize: "12px",
                              fontWeight: 600,
                              border: newAddress.label === lbl ? "1.5px solid var(--nilasa-gold)" : "1px solid #CBD5E1",
                              background: newAddress.label === lbl ? "var(--nilasa-card)" : "#FFFFFF",
                              color: newAddress.label === lbl ? "var(--nilasa-indigo)" : "#64748B",
                              cursor: "pointer",
                              transition: "all 0.15s ease"
                            }}
                          >
                            {lbl === "Home" ? "🏠 Home" : lbl === "Work" ? "🏢 Work" : "📍 Other"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginBottom: 14 }}>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                        Flat, House No., Building, Street Name *
                        <input
                          type="text"
                          required
                          value={newAddress.addressLine1}
                          onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                          placeholder="e.g. Flat 402, Lotus Court, Civil Lines"
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #CBD5E1", marginTop: 4, fontSize: "13px" }}
                        />
                      </label>

                      <label style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                        Area, Colony, Landmark (Optional)
                        <input
                          type="text"
                          value={newAddress.addressLine2 || ""}
                          onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                          placeholder="Near City Mall"
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #CBD5E1", marginTop: 4, fontSize: "13px" }}
                        />
                      </label>
                    </div>

                    <div className="address-form-grid-3">
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                        City *
                        <input
                          type="text"
                          required
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          placeholder="Kanpur"
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #CBD5E1", marginTop: 4, fontSize: "13px" }}
                        />
                      </label>

                      <label style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                        State *
                        <input
                          type="text"
                          required
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          placeholder="Uttar Pradesh"
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #CBD5E1", marginTop: 4, fontSize: "13px" }}
                        />
                      </label>

                      <label style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                        PIN Code *
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, "") })}
                          placeholder="208001"
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #CBD5E1", marginTop: 4, fontSize: "13px" }}
                        />
                      </label>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <input
                        type="checkbox"
                        id="isDefaultCheck"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      />
                      <label htmlFor="isDefaultCheck" style={{ fontSize: "12px", color: "#475569", cursor: "pointer" }}>
                        Set as primary delivery address for one-click checkout
                      </label>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        type="submit"
                        disabled={addressSaving}
                        className="button button--gold"
                        style={{ fontSize: "13px", padding: "9px 22px", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700 }}
                      >
                        {addressSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        <span>{addressSaving ? "Saving..." : "Save Address"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="button button--lavender-glass"
                        style={{ fontSize: "13px", padding: "9px 16px" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Addresses Grid */}
                {addressesLoading ? (
                  <div style={{ textAlign: "center", padding: "30px 0", color: "var(--ink-muted)" }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 8px" }} />
                    <p style={{ fontSize: "13px" }}>Loading saved addresses from server...</p>
                  </div>
                ) : addresses.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", background: "#FAF8F5", borderRadius: 10, border: "1px dashed #D1D5DB" }}>
                    <MapPin size={32} color="var(--nilasa-gold)" style={{ margin: "0 auto 8px", opacity: 0.8 }} />
                    <p style={{ fontWeight: 600, color: "var(--nilasa-indigo)", margin: "0 0 4px" }}>No saved addresses</p>
                    <p style={{ color: "#64748B", fontSize: "12px", margin: "0 0 16px" }}>
                      Add your home or office address for fast, effortless checkout.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(true)}
                      className="button button--gold"
                      style={{ fontSize: "12px", padding: "7px 18px" }}
                    >
                      + Add First Address
                    </button>
                  </div>
                ) : (
                  <div className="address-cards-grid">
                    {addresses.map((addr) => (
                      <div
                        key={addr.addressId}
                        className={`luxury-address-card ${addr.isDefault ? "luxury-address-card--selected" : ""}`}
                      >
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <span className="address-type-pill">
                              {addr.label === "Home" ? <Home size={12} /> : addr.label === "Work" ? <Building2 size={12} /> : <MapPin size={12} />}
                              {addr.label}
                            </span>

                            {addr.isDefault && (
                              <span style={{ fontSize: "9px", fontWeight: 700, color: "#92400E", background: "#FEF3C7", padding: "2px 6px", borderRadius: 4 }}>
                                PRIMARY DEFAULT
                              </span>
                            )}
                          </div>

                          <p style={{ margin: "0 0 3px", fontWeight: 600, color: "#1A1D20", fontSize: "13px", lineHeight: 1.4 }}>
                            {addr.addressLine1}
                          </p>
                          {addr.addressLine2 && (
                            <p style={{ margin: "0 0 3px", color: "#64748B", fontSize: "12px" }}>
                              {addr.addressLine2}
                            </p>
                          )}
                          <p style={{ margin: "0 0 12px", color: "#64748B", fontSize: "12px" }}>
                            {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                          </p>
                        </div>

                        <div style={{ borderTop: "1px solid #F1EFEA", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          {!addr.isDefault ? (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr.addressId)}
                              style={{ background: "none", border: "none", color: "var(--nilasa-indigo)", fontSize: "11px", fontWeight: 600, cursor: "pointer", padding: 0 }}
                            >
                              Make Default
                            </button>
                          ) : (
                            <span style={{ fontSize: "11px", color: "#059669", display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 600 }}>
                              <Check size={12} /> Default
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.addressId)}
                            style={{ background: "none", border: "none", color: "#DC2626", fontSize: "11px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 3, padding: 0 }}
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── PROFILE TAB ── */}
            {activeTab === "profile" && (
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--nilasa-border)",
                  borderRadius: 14,
                  padding: "24px"
                }}
              >
                <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--nilasa-indigo)", margin: "0 0 18px 0" }}>
                  Account Profile Details
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 20 }}>
                  <div style={{ border: "1px solid var(--nilasa-border)", padding: "14px 16px", borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink-muted)", fontSize: "12px", marginBottom: 4 }}>
                      <User size={14} />
                      <span>Full Name</span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "var(--nilasa-indigo)" }}>{user?.name || "Nilasa Customer"}</strong>
                  </div>

                  <div style={{ border: "1px solid var(--nilasa-border)", padding: "14px 16px", borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink-muted)", fontSize: "12px", marginBottom: 4 }}>
                      <Mail size={14} />
                      <span>Email Address</span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "var(--nilasa-indigo)" }}>{user?.email}</strong>
                  </div>

                  <div style={{ border: "1px solid var(--nilasa-border)", padding: "14px 16px", borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink-muted)", fontSize: "12px", marginBottom: 4 }}>
                      <Phone size={14} />
                      <span>Phone Number</span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "var(--nilasa-indigo)" }}>{user?.phone || "Not specified"}</strong>
                  </div>

                  <div style={{ border: "1px solid var(--nilasa-border)", padding: "14px 16px", borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink-muted)", fontSize: "12px", marginBottom: 4 }}>
                      <Calendar size={14} />
                      <span>Member Since</span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "var(--nilasa-indigo)" }}>
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "August 2026"}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "var(--nilasa-card)",
                    border: "1px solid var(--nilasa-border)",
                    borderRadius: 8,
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12
                  }}
                >
                  <ShieldCheck size={20} color="var(--nilasa-gold)" />
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--nilasa-indigo)", lineHeight: 1.4 }}>
                    Your personal information is strictly protected under Nilasa Privacy Safeguards and never shared with third-party marketers.
                  </p>
                </div>
              </div>
            )}

            {/* ── SECURITY TAB ── */}
            {activeTab === "security" && (
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--nilasa-border)",
                  borderRadius: 14,
                  padding: "24px"
                }}
              >
                <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--nilasa-indigo)", margin: "0 0 6px 0" }}>
                  Account Security
                </h2>
                <p style={{ fontSize: "13px", color: "var(--ink-muted)", margin: "0 0 20px 0" }}>
                  Ensure your account is protected with a strong, distinct password.
                </p>

                {passwordSuccess && (
                  <div
                    style={{
                      backgroundColor: "#ECFDF5",
                      border: "1px solid #A7F3D0",
                      color: "#065F46",
                      padding: "12px 16px",
                      borderRadius: 8,
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 16
                    }}
                  >
                    <CheckCircle2 size={16} color="#059669" />
                    <span>Your password has been changed successfully.</span>
                  </div>
                )}

                {passwordError && (
                  <div
                    style={{
                      backgroundColor: "#FEF2F2",
                      border: "1px solid #FECACA",
                      color: "#991B1B",
                      padding: "12px 16px",
                      borderRadius: 8,
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 16
                    }}
                  >
                    <AlertCircle size={16} color="#DC2626" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} style={{ maxWidth: 440 }}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--nilasa-indigo)", marginBottom: 4 }}>
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 6,
                        border: "1px solid var(--nilasa-border)",
                        fontSize: "13px"
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--nilasa-indigo)", marginBottom: 4 }}>
                      New Password (min. 8 characters)
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="••••••••"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 6,
                        border: "1px solid var(--nilasa-border)",
                        fontSize: "13px"
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--nilasa-indigo)", marginBottom: 4 }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="••••••••"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 6,
                        border: "1px solid var(--nilasa-border)",
                        fontSize: "13px"
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="button button--gold"
                    style={{ fontSize: "13px", padding: "10px 24px" }}
                  >
                    {passwordLoading ? "Updating Password..." : "Update Password"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
