"use client";

import Image from "next/image";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate sending recovery link or communicating with backend
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div
      style={{
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          backgroundColor: "#ffffff",
          border: "1px solid var(--nilasa-border)",
          borderRadius: 12,
          padding: "36px 32px",
          boxShadow: "0 12px 32px -8px rgba(32, 43, 69, 0.08)"
        }}
      >
        {/* Crest */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Link href="/" style={{ display: "inline-block", marginBottom: 12 }}>
            <Image
              src="/nilasa-logo.PNG"
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
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "22px",
              fontWeight: 600,
              color: "var(--nilasa-indigo)",
              margin: "0 0 6px 0"
            }}
          >
            Reset Your Password
          </h1>
          <p style={{ fontSize: "13px", color: "var(--ink-muted)", margin: 0, lineHeight: 1.5 }}>
            Enter your registered email address below and we&apos;ll send you instructions to reset your account password.
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                backgroundColor: "#EDF7F2",
                color: "#156E45",
                border: "1px solid #BEE3D1",
                padding: "16px",
                borderRadius: 8,
                fontSize: "13px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                marginBottom: 24
              }}
            >
              <CheckCircle2 size={24} />
              <strong style={{ fontSize: "14px" }}>Password Reset Email Sent</strong>
              <span style={{ color: "#2B5E43", lineHeight: 1.4 }}>
                If an account exists for <strong>{email}</strong>, we have dispatched password reset instructions to your inbox.
              </span>
            </div>

            <Link
              href="/login"
              style={{
                backgroundColor: "var(--nilasa-indigo)",
                color: "#FFFFFF",
                borderRadius: 6,
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "inline-flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <ArrowLeft size={14} />
              <span>Return to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {error && (
              <div
                style={{
                  backgroundColor: "#FDF0EE",
                  color: "var(--status-danger)",
                  border: "1px solid #F8C8C3",
                  padding: "10px 14px",
                  borderRadius: 6,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                <AlertCircle size={16} strokeWidth={2} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="reset-email"
                style={{ display: "block", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-primary)", marginBottom: 6 }}
              >
                Registered Email
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Mail size={16} color="var(--ink-muted)" style={{ position: "absolute", left: 12, pointerEvents: "none" }} />
                <input
                  id="reset-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    height: 42,
                    paddingLeft: 38,
                    paddingRight: 12,
                    borderRadius: 6,
                    border: "1px solid var(--nilasa-border)",
                    fontSize: "14px",
                    backgroundColor: "var(--nilasa-ivory)",
                    outline: "none"
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: "var(--nilasa-indigo)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 6,
                height: 44,
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "opacity 0.15s ease",
                opacity: loading ? 0.7 : 1
              }}
            >
              <span>{loading ? "Sending link..." : "Send Reset Instructions"}</span>
            </button>

            <div style={{ textAlign: "center", marginTop: 6 }}>
              <Link
                href="/login"
                style={{
                  fontSize: "13px",
                  color: "var(--ink-muted)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <ArrowLeft size={13} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
