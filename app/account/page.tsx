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
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ChevronRight
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
      <div className="nilasa-account-page shell" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#64748B", fontSize: "14px" }}>Loading account details...</p>
      </div>
    );
  }

  return (
    <div className="nilasa-account-page">
      <div className="shell">
        {/* Account Header Banner */}
        <div className="nilasa-account-header">
          <div className="nilasa-account-user-meta">
            <div className="nilasa-account-avatar">
              <User size={24} />
            </div>
            <div>
              <h1 className="nilasa-account-name">
                Welcome back, {user?.name || "Customer"}
              </h1>
              <div className="nilasa-account-subinfo">
                <span>{user?.email}</span>
                <span>•</span>
                <span className="nilasa-account-tier-badge">
                  Nilasa Club Member
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="nilasa-account-logout-btn"
            aria-label="Sign Out"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Account Layout: Tabs Sidebar + Content Panel */}
        <div className="nilasa-account-layout">
          {/* Navigation Tabs (Sidebar on Desktop, Segmented 3-Column Bar on Mobile) */}
          <aside className="nilasa-account-sidebar" aria-label="Account Tabs">
            <nav className="nilasa-account-nav">
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={`nilasa-account-nav-btn ${activeTab === "orders" ? "is-active" : ""}`}
              >
                <ShoppingBag size={18} color={activeTab === "orders" ? "#7A539B" : "#64748B"} />
                <span className="tab-label-full">My Orders ({orders.length})</span>
                <span className="tab-label-mobile">Orders ({orders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`nilasa-account-nav-btn ${activeTab === "profile" ? "is-active" : ""}`}
              >
                <User size={18} color={activeTab === "profile" ? "#7A539B" : "#64748B"} />
                <span className="tab-label-full">Profile & Details</span>
                <span className="tab-label-mobile">Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`nilasa-account-nav-btn ${activeTab === "security" ? "is-active" : ""}`}
              >
                <Lock size={18} color={activeTab === "security" ? "#7A539B" : "#64748B"} />
                <span className="tab-label-full">Security & Password</span>
                <span className="tab-label-mobile">Security</span>
              </button>
            </nav>
          </aside>

          {/* Main Tab Content Panel */}
          <main className="nilasa-account-content-card">
            {/* Tab 1: Orders */}
            {activeTab === "orders" && (
              <div>
                <div className="nilasa-account-content-header">
                  <div>
                    <h2 className="nilasa-account-section-title">
                      My Purchase History
                    </h2>
                    <p className="nilasa-account-section-subtitle">
                      Track current shipments and view previous Nilasa orders.
                    </p>
                  </div>

                  <Link
                    href="/shop"
                    style={{
                      fontSize: "13px",
                      color: "#7A539B",
                      fontWeight: 600,
                      textDecoration: "underline",
                      textUnderlineOffset: "4px"
                    }}
                  >
                    Browse Collections →
                  </Link>
                </div>

                {ordersLoading ? (
                  <p style={{ color: "#64748B", fontSize: "14px" }}>Loading your orders...</p>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 20px" }}>
                    <ShoppingBag size={42} color="#8E6EA8" style={{ margin: "0 auto 14px" }} />
                    <h3 style={{ fontSize: "17px", color: "#212121", margin: "0 0 8px 0", fontWeight: 600 }}>
                      No orders placed yet
                    </h3>
                    <p style={{ fontSize: "13px", color: "#64748B", maxWidth: 360, margin: "0 auto 20px", lineHeight: 1.5 }}>
                      Discover our curated collection of handcrafted suits, chanderi kurtis, and silk dupattas.
                    </p>
                    <Link
                      href="/shop"
                      style={{
                        backgroundColor: "#212121",
                        color: "#FFFFFF",
                        borderRadius: 4,
                        padding: "12px 24px",
                        fontSize: "13px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        display: "inline-block",
                        textDecoration: "none"
                      }}
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="nilasa-account-orders-list">
                    {orders.map((ord) => {
                      const oid = ord.orderId || ord.id || 0;
                      const dateStr = ord.placedAt || ord.createdAt || "";
                      return (
                        <div key={oid} className="nilasa-account-order-card">
                          <div className="nilasa-account-order-card-head">
                            <div>
                              <div className="nilasa-account-order-id">
                                Order #{oid}
                              </div>
                              <div className="nilasa-account-order-date">
                                Placed on {dateStr ? new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                              </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
                              <span className="nilasa-account-order-total">
                                {formatPrice(ord.totalAmount)}
                              </span>
                              <OrderStatusBadge status={ord.status} showStepper />
                            </div>
                          </div>

                          {/* Line items summary */}
                          {ord.items && ord.items.length > 0 && (
                            <div className="nilasa-account-order-items">
                              <span className="nilasa-account-order-items-title">
                                Items ({ord.items.length}):
                              </span>
                              <ul className="nilasa-account-order-items-list">
                                {ord.items.map((it, idx) => (
                                  <li key={it.orderItemId || idx} className="nilasa-account-order-item-row">
                                    <span>
                                      <strong>{it.productName}</strong> {it.size ? `(${it.size})` : ""} × {it.quantity}
                                    </span>
                                    <span style={{ fontWeight: 600, color: "#212121" }}>
                                      {formatPrice(it.priceAtPurchase * it.quantity)}
                                    </span>
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
                <div className="nilasa-account-content-header">
                  <div>
                    <h2 className="nilasa-account-section-title">
                      Personal Profile
                    </h2>
                    <p className="nilasa-account-section-subtitle">
                      Your verified identity and contact information at Nilasa.
                    </p>
                  </div>
                </div>

                <div className="nilasa-account-profile-grid">
                  <div className="nilasa-account-profile-box">
                    <div className="nilasa-account-profile-label">Full Name</div>
                    <div className="nilasa-account-profile-val">{user?.name || "—"}</div>
                  </div>

                  <div className="nilasa-account-profile-box">
                    <div className="nilasa-account-profile-label">Email Address</div>
                    <div className="nilasa-account-profile-val">{user?.email || "—"}</div>
                  </div>

                  <div className="nilasa-account-profile-box">
                    <div className="nilasa-account-profile-label">Contact Phone</div>
                    <div className="nilasa-account-profile-val">{user?.phone || "Not provided"}</div>
                  </div>

                  <div className="nilasa-account-profile-box">
                    <div className="nilasa-account-profile-label">Account Role</div>
                    <div className="nilasa-account-profile-val">{user?.role || "Customer"}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Security */}
            {activeTab === "security" && (
              <div>
                <div className="nilasa-account-content-header">
                  <div>
                    <h2 className="nilasa-account-section-title">
                      Security & Password
                    </h2>
                    <p className="nilasa-account-section-subtitle">
                      Ensure your account is protected with a secure password.
                    </p>
                  </div>
                </div>

                {passwordSuccess && (
                  <div
                    style={{
                      backgroundColor: "#EDF7F2",
                      color: "#156E45",
                      border: "1px solid #BEE3D1",
                      padding: "12px 16px",
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
                      color: "#DC2626",
                      border: "1px solid #F8C8C3",
                      padding: "12px 16px",
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

                <form onSubmit={handlePasswordChange} className="nilasa-account-password-form">
                  <div className="nilasa-account-form-group">
                    <label className="nilasa-account-form-label">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="nilasa-account-form-input"
                    />
                  </div>

                  <div className="nilasa-account-form-group">
                    <label className="nilasa-account-form-label">
                      New Password (Min 8 Characters) *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter new password (8+ chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="nilasa-account-form-input"
                    />
                  </div>

                  <div className="nilasa-account-form-group">
                    <label className="nilasa-account-form-label">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Confirm new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="nilasa-account-form-input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="nilasa-account-submit-btn"
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
