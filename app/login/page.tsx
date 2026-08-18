"use client";

import Image from "next/image";
import { useState, useEffect, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { AlertCircle, Lock, Mail, ArrowRight, Eye, EyeOff, Check, Sparkles } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, redirectUrl, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    const result = await login(email, password);
    if (result.success) {
      router.push(redirectUrl);
    } else {
      setError(result.error || "Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "78vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--nilasa-border)",
          borderRadius: 16,
          padding: "38px 34px",
          boxShadow: "0 18px 42px -12px rgba(21, 29, 48, 0.12)"
        }}
      >
        {/* Monogram Crest Header */}
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <Link href="/" style={{ display: "inline-block", marginBottom: 14 }}>
            <Image
              src="/nilasa-black-logo.PNG"
              alt="Nilasa"
              width={160}
              height={52}
              style={{
                height: "46px",
                width: "auto",
                objectFit: "contain",
                borderRadius: "4px"
              }}
            />
          </Link>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                color: "var(--nilasa-gold)",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase"
              }}
            >
              CUSTOMER PORTAL
            </span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px",
              fontWeight: 600,
              color: "var(--nilasa-indigo)",
              margin: "0 0 6px 0"
            }}
          >
            Sign In to Nilasa
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--ink-muted)", margin: 0, lineHeight: 1.5 }}>
            Access your orders, track shipments in real-time, and enjoy express checkout.
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#FDF0EE",
              color: "var(--status-danger)",
              border: "1px solid #F8C8C3",
              padding: "12px 14px",
              borderRadius: 8,
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20
            }}
          >
            <AlertCircle size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "11.5px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--ink-primary)",
                marginBottom: 6
              }}
            >
              Email Address *
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Mail size={16} color="var(--ink-muted)" style={{ position: "absolute", left: 14, pointerEvents: "none" }} />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  height: 44,
                  paddingLeft: 40,
                  paddingRight: 14,
                  borderRadius: 8,
                  border: "1px solid var(--nilasa-border)",
                  fontSize: "14px",
                  backgroundColor: "var(--nilasa-ivory)",
                  outline: "none",
                  transition: "border-color 0.15s ease"
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label
                htmlFor="password"
                style={{
                  fontSize: "11.5px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--ink-primary)"
                }}
              >
                Password *
              </label>
              <Link
                href="/forgot-password"
                style={{ fontSize: "12px", color: "var(--nilasa-indigo)", textDecoration: "underline", fontWeight: 500 }}
              >
                Forgot password?
              </Link>
            </div>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Lock size={16} color="var(--ink-muted)" style={{ position: "absolute", left: 14, pointerEvents: "none" }} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  height: 44,
                  paddingLeft: 40,
                  paddingRight: 42,
                  borderRadius: 8,
                  border: "1px solid var(--nilasa-border)",
                  fontSize: "14px",
                  backgroundColor: "var(--nilasa-ivory)",
                  outline: "none",
                  transition: "border-color 0.15s ease"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: 12,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--ink-muted)",
                  padding: 4,
                  display: "flex",
                  alignItems: "center"
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "12.5px",
                color: "var(--ink-muted)",
                cursor: "pointer"
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: "var(--nilasa-indigo)" }}
              />
              <span>Remember this device</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "var(--nilasa-indigo)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              height: 46,
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 4,
              transition: "all 0.15s ease",
              boxShadow: "0 4px 14px rgba(32, 43, 69, 0.18)",
              opacity: loading ? 0.7 : 1
            }}
          >
            <span>{loading ? "Signing in..." : "Sign In to Account"}</span>
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: "1px solid var(--nilasa-border)",
            textAlign: "center",
            fontSize: "13px",
            color: "var(--ink-muted)"
          }}
        >
          <span>New to Nilasa? </span>
          <Link
            href={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
            style={{ color: "var(--nilasa-indigo)", fontWeight: 700, textDecoration: "underline" }}
          >
            Create & Verify Account →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
