"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Order } from "@/lib/types";
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
  ShieldCheck
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, logout, updatePassword } = useAuth();

  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "security">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

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

  // Load customer orders
  useEffect(() => {
    if (isAuthenticated && token) {
      setOrdersLoading(true);
      fetch("/api/v1/orders", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) {
            setOrders(data);
          }
        })
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
    }
  }, [isAuthenticated, token]);

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
    <div style={{ minHeight: "80vh", padding: "40px 0 80px" }}>
      <div className="shell">
        {/* Account Header Banner */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--nilasa-border)",
            borderRadius: 12,
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
                border: "1px solid var(--nilasa-border)",
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
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "13px", color: "var(--ink-muted)" }}>
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
              padding: "8px 14px",
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
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
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
            <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: activeTab === "orders" ? "var(--nilasa-card)" : "transparent",
                  color: activeTab === "orders" ? "var(--nilasa-indigo)" : "var(--ink-muted)",
                  fontWeight: activeTab === "orders" ? 600 : 500,
                  fontSize: "13px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "background-color 0.12s ease"
                }}
              >
                <ShoppingBag size={16} color={activeTab === "orders" ? "var(--nilasa-gold)" : "var(--ink-muted)"} />
                <span>My Orders ({orders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: activeTab === "profile" ? "var(--nilasa-card)" : "transparent",
                  color: activeTab === "profile" ? "var(--nilasa-indigo)" : "var(--ink-muted)",
                  fontWeight: activeTab === "profile" ? 600 : 500,
                  fontSize: "13px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "background-color 0.12s ease"
                }}
              >
                <User size={16} color={activeTab === "profile" ? "var(--nilasa-gold)" : "var(--ink-muted)"} />
                <span>Profile & Details</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("security")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: activeTab === "security" ? "var(--nilasa-card)" : "transparent",
                  color: activeTab === "security" ? "var(--nilasa-indigo)" : "var(--ink-muted)",
                  fontWeight: activeTab === "security" ? 600 : 500,
                  fontSize: "13px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "background-color 0.12s ease"
                }}
              >
                <Lock size={16} color={activeTab === "security" ? "var(--nilasa-gold)" : "var(--ink-muted)"} />
                <span>Security & Password</span>
              </button>
            </nav>
          </div>

          {/* Main Tab Panel */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--nilasa-border)",
              borderRadius: 12,
              padding: "28px 30px"
            }}
          >
            {/* Tab 1: Orders */}
            {activeTab === "orders" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <h2
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "20px",
                        fontWeight: 600,
                        color: "var(--nilasa-indigo)",
                        margin: "0 0 4px 0"
                      }}
                    >
                      My Purchase History
                    </h2>
                    <p style={{ fontSize: "13px", color: "var(--ink-muted)", margin: 0 }}>
                      Track current shipments and view previous Nilasa orders.
                    </p>
                  </div>

                  <Link
                    href="/shop"
                    style={{
                      fontSize: "13px",
                      color: "var(--nilasa-indigo)",
                      fontWeight: 600,
                      textDecoration: "underline"
                    }}
                  >
                    Browse Collections
                  </Link>
                </div>

                {ordersLoading ? (
                  <p style={{ color: "var(--ink-muted)", fontSize: "13px" }}>Loading your orders...</p>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 20px" }}>
                    <ShoppingBag size={38} color="var(--nilasa-gold)" style={{ margin: "0 auto 12px" }} />
                    <h3 style={{ fontSize: "16px", color: "var(--nilasa-indigo)", margin: "0 0 6px 0" }}>
                      No orders placed yet
                    </h3>
                    <p style={{ fontSize: "13px", color: "var(--ink-muted)", maxWidth: 360, margin: "0 auto 18px" }}>
                      Discover our curated collection of handcrafted suits, chanderi kurtis, and silk dupattas.
                    </p>
                    <Link
                      href="/shop"
                      style={{
                        backgroundColor: "var(--nilasa-indigo)",
                        color: "#FFFFFF",
                        borderRadius: 6,
                        padding: "10px 20px",
                        fontSize: "13px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        display: "inline-block"
                      }}
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {orders.map((ord) => {
                      const oid = ord.orderId || ord.id || 0;
                      const dateStr = ord.placedAt || ord.createdAt || "";
                      return (
                        <div
                          key={oid}
                          style={{
                            border: "1px solid var(--nilasa-border)",
                            borderRadius: 8,
                            padding: "18px 20px",
                            backgroundColor: "var(--nilasa-ivory)"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                            <div>
                              <strong style={{ fontSize: "15px", color: "var(--nilasa-indigo)" }}>
                                Order #{oid}
                              </strong>
                              <div style={{ fontSize: "12px", color: "var(--ink-muted)", marginTop: 2 }}>
                                Placed on {dateStr ? new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                              </div>
                            </div>

                            <div style={{ textAlign: "right" }}>
                              <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--nilasa-indigo)" }}>
                                {formatPrice(ord.totalAmount)}
                              </span>
                              <div style={{ marginTop: 4 }}>
                                <OrderStatusBadge status={ord.status} showStepper />
                              </div>
                            </div>
                          </div>

                          {/* Line items summary */}
                          {ord.items && ord.items.length > 0 && (
                            <div style={{ borderTop: "1px solid var(--nilasa-border)", paddingTop: 12, marginTop: 12 }}>
                              <span style={{ fontSize: "12px", color: "var(--ink-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                                Items ({ord.items.length}):
                              </span>
                              <ul style={{ margin: "6px 0 0 0", paddingLeft: 18, fontSize: "13px", color: "var(--ink-primary)" }}>
                                {ord.items.map((it, idx) => (
                                  <li key={it.orderItemId || idx} style={{ marginBottom: 4 }}>
                                    {it.productName} ({it.size}) × {it.quantity} — {formatPrice(it.priceAtPurchase * it.quantity)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Profile */}
            {activeTab === "profile" && (
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "var(--nilasa-indigo)",
                    margin: "0 0 4px 0"
                  }}
                >
                  Personal Profile
                </h2>
                <p style={{ fontSize: "13px", color: "var(--ink-muted)", margin: "0 0 24px 0" }}>
                  Your verified identity and contact information at Nilasa.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ padding: "16px", backgroundColor: "var(--nilasa-ivory)", borderRadius: 8, border: "1px solid var(--nilasa-border)" }}>
                    <div style={{ fontSize: "11px", color: "var(--ink-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>
                      Full Name
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--nilasa-indigo)" }}>
                      {user?.name}
                    </div>
                  </div>

                  <div style={{ padding: "16px", backgroundColor: "var(--nilasa-ivory)", borderRadius: 8, border: "1px solid var(--nilasa-border)" }}>
                    <div style={{ fontSize: "11px", color: "var(--ink-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>
                      Email Address
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--nilasa-indigo)" }}>
                      {user?.email}
                    </div>
                  </div>

                  <div style={{ padding: "16px", backgroundColor: "var(--nilasa-ivory)", borderRadius: 8, border: "1px solid var(--nilasa-border)" }}>
                    <div style={{ fontSize: "11px", color: "var(--ink-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>
                      Contact Phone
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--nilasa-indigo)" }}>
                      {user?.phone || "Not provided"}
                    </div>
                  </div>

                  <div style={{ padding: "16px", backgroundColor: "var(--nilasa-ivory)", borderRadius: 8, border: "1px solid var(--nilasa-border)" }}>
                    <div style={{ fontSize: "11px", color: "var(--ink-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>
                      Account Role
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--nilasa-indigo)" }}>
                      {user?.role || "Customer"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Security */}
            {activeTab === "security" && (
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "var(--nilasa-indigo)",
                    margin: "0 0 4px 0"
                  }}
                >
                  Security & Password
                </h2>
                <p style={{ fontSize: "13px", color: "var(--ink-muted)", margin: "0 0 24px 0" }}>
                  Ensure your account is protected with a secure password.
                </p>

                {passwordSuccess && (
                  <div
                    style={{
                      backgroundColor: "#EDF7F2",
                      color: "#156E45",
                      border: "1px solid #BEE3D1",
                      padding: "12px 14px",
                      borderRadius: 6,
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 20
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Your account password has been updated successfully.</span>
                  </div>
                )}

                {passwordError && (
                  <div
                    style={{
                      backgroundColor: "#FDF0EE",
                      color: "var(--status-danger)",
                      border: "1px solid #F8C8C3",
                      padding: "12px 14px",
                      borderRadius: 6,
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 20
                    }}
                  >
                    <AlertCircle size={16} strokeWidth={2} />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} style={{ maxWidth: 400, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-primary)", marginBottom: 6 }}>
                      Current Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      style={{
                        width: "100%",
                        height: 40,
                        padding: "0 12px",
                        borderRadius: 6,
                        border: "1px solid var(--nilasa-border)",
                        fontSize: "14px",
                        backgroundColor: "var(--nilasa-ivory)"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-primary)", marginBottom: 6 }}>
                      New Password (Min 8 Characters) *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter new password (8+ chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{
                        width: "100%",
                        height: 40,
                        padding: "0 12px",
                        borderRadius: 6,
                        border: "1px solid var(--nilasa-border)",
                        fontSize: "14px",
                        backgroundColor: "var(--nilasa-ivory)"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-primary)", marginBottom: 6 }}>
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Confirm new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      style={{
                        width: "100%",
                        height: 40,
                        padding: "0 12px",
                        borderRadius: 6,
                        border: "1px solid var(--nilasa-border)",
                        fontSize: "14px",
                        backgroundColor: "var(--nilasa-ivory)"
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    style={{
                      backgroundColor: "var(--nilasa-indigo)",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: 6,
                      height: 42,
                      fontSize: "13px",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      cursor: passwordLoading ? "not-allowed" : "pointer",
                      marginTop: 6
                    }}
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
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
