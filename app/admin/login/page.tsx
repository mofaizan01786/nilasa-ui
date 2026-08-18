"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { loginBackend } from "@/lib/api";
import { ShieldCheck, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("admin@nilasa.com");
  const [password, setPassword] = useState("Admin@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginBackend(email.trim(), password);

      if (res.success && res.data?.accessToken) {
        window.localStorage.setItem("nilasa-auth-token", res.data.accessToken);
        document.cookie = `nilasa_session=${res.data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
        window.location.href = from;
      } else {
        setError(res.error || "Invalid email or password.");
      }
    } catch {
      setError("Network error. Please check server connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="admin-card"
      style={{
        maxWidth: 420,
        width: "100%",
        padding: "36px 28px",
        boxShadow: "0 12px 32px rgba(28, 35, 51, 0.08)",
        borderRadius: "12px",
        background: "#FFFFFF"
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <Image
            src="/nilasa-black-logo.PNG"
            alt="Nilasa"
            width={160}
            height={52}
            priority
            style={{
              height: "48px",
              width: "auto",
              objectFit: "contain"
            }}
          />
        </div>
        <h1 style={{ fontSize: "17px", fontWeight: 600, color: "var(--admin-ink)", margin: "4px 0" }}>
          Nilasa Control Portal
        </h1>
        <p style={{ color: "var(--admin-slate-600)", fontSize: "12px", margin: 0 }}>
          Staff credentials required to access inventory & orders
        </p>
      </div>

      {error && (
        <div
          style={{
            background: "#FDF0EE",
            color: "var(--status-danger)",
            border: "1px solid #F8C8C3",
            padding: "10px 12px",
            borderRadius: 6,
            fontSize: "12px",
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <AlertCircle size={14} strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label className="field">
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: 4 }}>
            Staff Email <strong className="req-star">*</strong>
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@nilasa.com"
            autoComplete="username"
            style={{ height: "42px", borderRadius: "6px", fontSize: "14px" }}
          />
        </label>

        <label className="field">
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--admin-ink)", marginBottom: 4 }}>
            Password <strong className="req-star">*</strong>
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            style={{ height: "42px", borderRadius: "6px", fontSize: "14px" }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="admin-btn-primary"
          style={{ width: "100%", height: "44px", marginTop: 6, fontSize: "14px", fontWeight: 600 }}
        >
          {loading ? "Authenticating..." : "Sign in to Control Portal"}
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 22, color: "var(--admin-slate-600)", fontSize: "11px" }}>
        <ShieldCheck size={14} color="var(--status-published)" />
        <span>Enterprise Session Encrypted</span>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="admin-card" style={{ padding: 24 }}>Loading Portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
