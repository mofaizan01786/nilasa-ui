"use client";

import { useState, useEffect, FormEvent } from "react";
import { User, CreateUserPayload } from "@/lib/types";
import { AdminDrawer } from "./AdminDrawer";
import { createUserAdmin, updateUserRoleAdmin, resetUserPasswordAdmin } from "@/lib/api";
import { AlertCircle, KeyRound, Shield, CheckCircle2 } from "lucide-react";

interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSaved: (msg?: string) => void;
}

export function UserDrawer({
  isOpen,
  onClose,
  user,
  onSaved
}: UserDrawerProps) {
  const isEditing = !!user;

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Customer");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");

  // Reset Password Tab / Section
  const [newResetPassword, setNewResetPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
      setRole(user.role || "Customer");
      setIsActive(user.isActive ?? true);
      setPassword("");
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setRole("Customer");
      setIsActive(true);
      setPassword("");
    }
    setNewResetPassword("");
    setResetSuccess(false);
    setError("");
    setFieldErrors({});
  }, [user, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const newFieldErrors: { [k: string]: string } = {};

    if (!name.trim()) newFieldErrors.name = "Full name is required.";
    if (!email.trim()) newFieldErrors.email = "Email address is required.";

    if (!isEditing) {
      if (!password || password.length < 8) {
        newFieldErrors.password = "Initial password must contain at least 8 characters.";
      }
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setLoading(false);
      return;
    }

    try {
      if (isEditing && user) {
        const uid = user.userId || user.id || 0;
        const ok = await updateUserRoleAdmin(uid, {
          role: role.trim(),
          isActive: isActive
        });
        if (!ok) {
          setError("Failed to update user account settings.");
          setLoading(false);
          return;
        }
        onSaved("User account updated");
      } else {
        const payload: CreateUserPayload = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          password: password,
          role: role.trim()
        };
        const created = await createUserAdmin(payload);
        if (!created) {
          setError("Failed to create user. Email may already be in use.");
          setLoading(false);
          return;
        }
        onSaved("User account created");
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminResetPassword = async () => {
    if (!user) return;
    if (!newResetPassword || newResetPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    setResetLoading(true);
    setError("");
    setResetSuccess(false);

    try {
      const uid = user.userId || user.id || 0;
      const ok = await resetUserPasswordAdmin(uid, newResetPassword);
      if (ok) {
        setResetSuccess(true);
        setNewResetPassword("");
      } else {
        setError("Failed to reset password on backend.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error during password reset.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <AdminDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit User #${user?.userId || user?.id}` : "Create User Account"}
      subtitle={isEditing ? "Manage user permissions, security status and password resets" : "Register a staff member, admin, or customer profile"}
      width={540}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 24 }}>
          {error && (
            <div
              style={{
                backgroundColor: "#FDF0EE",
                color: "var(--status-danger)",
                border: "1px solid #F8C8C3",
                padding: "10px 14px",
                borderRadius: 6,
                fontSize: "13px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <AlertCircle size={16} strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-grid">
            <label className="field wide">
              <span>
                Full Name <strong className="req-star">*</strong>
              </span>
              <input
                type="text"
                required
                disabled={isEditing}
                placeholder="e.g. Ayesha Sharma"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
                }}
              />
              {fieldErrors.name && <span className="field-error-msg">{fieldErrors.name}</span>}
            </label>

            <label className="field wide">
              <span>
                Email Address <strong className="req-star">*</strong>
              </span>
              <input
                type="email"
                required
                disabled={isEditing}
                placeholder="ayesha@nilasawear.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
              />
              {fieldErrors.email && <span className="field-error-msg">{fieldErrors.email}</span>}
            </label>

            <label className="field">
              <span>Phone Number</span>
              <input
                type="tel"
                disabled={isEditing}
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>

            <label className="field">
              <span>
                Access Role <strong className="req-star">*</strong>
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="field-select"
              >
                <option value="Customer">Customer (Storefront Shopper)</option>
                <option value="Admin">Admin (Full Control Access)</option>
                <option value="Staff">Staff (Operations Only)</option>
              </select>
            </label>

            {!isEditing && (
              <label className="field wide">
                <span>
                  Initial Password <strong className="req-star">*</strong>
                </span>
                <input
                  type="password"
                  required
                  placeholder="At least 8 characters..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
                  }}
                />
                {fieldErrors.password && <span className="field-error-msg">{fieldErrors.password}</span>}
              </label>
            )}

            {isEditing && (
              <label
                className="field wide"
                style={{
                  flexDirection: "row !important" as "row",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  padding: "10px 12px",
                  background: "var(--admin-surface)",
                  borderRadius: 6,
                  border: "1px solid var(--admin-slate-200)",
                  marginTop: 6
                }}
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--admin-accent)" }}
                />
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--admin-ink)" }}>
                  Account is Active (Uncheck to suspend login permissions)
                </span>
              </label>
            )}
          </div>

          {/* Direct Admin Password Reset Section (Edit Mode Only) */}
          {isEditing && (
            <div
              style={{
                backgroundColor: "var(--admin-surface)",
                border: "1px solid var(--admin-slate-200)",
                borderRadius: 8,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginTop: 8
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <KeyRound size={15} color="var(--admin-accent)" />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--admin-ink)" }}>
                  Admin Direct Password Reset
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--admin-slate-600)" }}>
                Reset this user&apos;s password immediately without requiring their current password.
              </span>

              {resetSuccess && (
                <div
                  style={{
                    backgroundColor: "#EDF7F2",
                    color: "#156E45",
                    border: "1px solid #BEE3D1",
                    padding: "8px 12px",
                    borderRadius: 6,
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>Password successfully reset for {user?.email}.</span>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="password"
                  placeholder="Enter new 8+ character password"
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  style={{
                    flex: 1,
                    height: 34,
                    padding: "0 10px",
                    fontSize: "13px",
                    borderRadius: 6,
                    border: "1px solid var(--admin-slate-200)",
                    backgroundColor: "#FFFFFF"
                  }}
                />
                <button
                  type="button"
                  disabled={resetLoading || !newResetPassword}
                  onClick={handleAdminResetPassword}
                  className="admin-btn-secondary"
                  style={{ height: 34 }}
                >
                  {resetLoading ? "Resetting..." : "Apply Reset"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Save Bar */}
        <div className="admin-sticky-save-bar">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="admin-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="admin-btn-primary"
          >
            {loading
              ? (isEditing ? "Saving user..." : "Creating account...")
              : (isEditing ? "Save user changes" : "Create user account")}
          </button>
        </div>
      </form>
    </AdminDrawer>
  );
}
