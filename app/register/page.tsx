"use client";

import Image from "next/image";
import { useState, useEffect, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  AlertCircle,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  CheckCircle2
} from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const { register, sendVerificationCode, verifyCode, isAuthenticated } = useAuth();

  // Wizard Step: 1 = Details, 2 = Verify OTP, 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);

  // Verification State
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  useEffect(() => {
    if (isAuthenticated && step !== 3) {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, redirectUrl, router, step]);

  // Resend Timer Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: "", color: "#E2E8F0" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, text: "Weak", color: "#EF4444" };
    if (score <= 3) return { score: 2, text: "Good", color: "#F59E0B" };
    return { score: 3, text: "Strong", color: "#10B981" };
  };

  const strength = getPasswordStrength(password);

  // Step 1: Validate Details & Request OTP Code from Backend
  const handleRequestVerification = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMsg("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }
    if (!agreed) {
      setError("Please accept the Terms of Service & Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      const res = await sendVerificationCode(email, "Register");
      if (res.success) {
        setStep(2);
        setCountdown(60);
        setCanResend(false);
        setInfoMsg(`Verification code sent to ${email}.`);
      } else {
        setError(res.message || "Failed to send verification code.");
      }
    } catch {
      setError("Unable to connect to verification service.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendCode = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await sendVerificationCode(email, "Register");
      if (res.success) {
        setCountdown(60);
        setCanResend(false);
        setInfoMsg(`A new verification code has been dispatched to ${email}.`);
      } else {
        setError(res.message || "Failed to resend code.");
      }
    } catch {
      setError("Failed to resend verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Code & Complete Registration in Backend
  const handleVerifyAndCreateAccount = async (e: FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Verify code
      const verifyRes = await verifyCode(email, otpCode.trim());
      if (!verifyRes.success) {
        setError(verifyRes.message || "Invalid or expired verification code.");
        setLoading(false);
        return;
      }

      // 2. Register customer account in backend
      const regRes = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        verificationCode: otpCode.trim()
      });

      if (regRes.success) {
        setStep(3);
        setTimeout(() => {
          router.push(redirectUrl);
        }, 2200);
      } else {
        setError(regRes.error || "Account registration failed.");
      }
    } catch {
      setError("Registration error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "82vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 500,
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--nilasa-border)",
          borderRadius: 16,
          padding: "38px 34px",
          boxShadow: "0 18px 42px -12px rgba(21, 29, 48, 0.12)"
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Link href="/" style={{ display: "inline-block", marginBottom: 14 }}>
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

          {/* Stepper Dots */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
            <div
              style={{
                width: 28,
                height: 6,
                borderRadius: 4,
                backgroundColor: step >= 1 ? "var(--nilasa-gold)" : "#E2E8F0",
                transition: "background-color 0.2s"
              }}
            />
            <div
              style={{
                width: 28,
                height: 6,
                borderRadius: 4,
                backgroundColor: step >= 2 ? "var(--nilasa-gold)" : "#E2E8F0",
                transition: "background-color 0.2s"
              }}
            />
            <div
              style={{
                width: 28,
                height: 6,
                borderRadius: 4,
                backgroundColor: step === 3 ? "var(--nilasa-gold)" : "#E2E8F0",
                transition: "background-color 0.2s"
              }}
            />
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
            {step === 1 && "Create Customer Account"}
            {step === 2 && "Verify Your Email"}
            {step === 3 && "Welcome to Nilasa"}
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--ink-muted)", margin: 0, lineHeight: 1.5 }}>
            {step === 1 && "Join the Nilasa Club for express order tracking, festive edits & member perks."}
            {step === 2 && `Enter the 6-digit security code sent to ${email}`}
            {step === 3 && "Your customer account is verified & active. Redirecting to your account..."}
          </p>
        </div>

        {/* Error Feedback */}
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

        {/* Info / Success Feedback */}
        {infoMsg && !error && (
          <div
            style={{
              backgroundColor: "#EDF7F2",
              color: "#156E45",
              border: "1px solid #BEE3D1",
              padding: "12px 14px",
              borderRadius: 8,
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20
            }}
          >
            <ShieldCheck size={16} style={{ flexShrink: 0 }} />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* ── STEP 1: Customer Details ── */}
        {step === 1 && (
          <form onSubmit={handleRequestVerification} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label
                htmlFor="name"
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
                Full Name *
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <User size={16} color="var(--ink-muted)" style={{ position: "absolute", left: 14, pointerEvents: "none" }} />
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="e.g. Ayesha Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    height: 44,
                    paddingLeft: 40,
                    paddingRight: 14,
                    borderRadius: 8,
                    border: "1px solid var(--nilasa-border)",
                    fontSize: "14px",
                    backgroundColor: "var(--nilasa-ivory)",
                    outline: "none"
                  }}
                />
              </div>
            </div>

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
                  placeholder="ayesha@example.com"
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
                    outline: "none"
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
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
                Mobile Number (For Courier Tracking)
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Phone size={16} color="var(--ink-muted)" style={{ position: "absolute", left: 14, pointerEvents: "none" }} />
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: "100%",
                    height: 44,
                    paddingLeft: 40,
                    paddingRight: 14,
                    borderRadius: 8,
                    border: "1px solid var(--nilasa-border)",
                    fontSize: "14px",
                    backgroundColor: "var(--nilasa-ivory)",
                    outline: "none"
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label
                  htmlFor="password"
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
                  Password *
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Lock size={16} color="var(--ink-muted)" style={{ position: "absolute", left: 14, pointerEvents: "none" }} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="8+ chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      height: 44,
                      paddingLeft: 40,
                      paddingRight: 34,
                      borderRadius: 8,
                      border: "1px solid var(--nilasa-border)",
                      fontSize: "14px",
                      backgroundColor: "var(--nilasa-ivory)",
                      outline: "none"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{
                      position: "absolute",
                      right: 8,
                      background: "none",
                      border: "none",
                      color: "var(--ink-muted)",
                      cursor: "pointer",
                      padding: 2
                    }}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
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
                  Confirm *
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Lock size={16} color="var(--ink-muted)" style={{ position: "absolute", left: 14, pointerEvents: "none" }} />
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Repeat"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: "100%",
                      height: 44,
                      paddingLeft: 40,
                      paddingRight: 14,
                      borderRadius: 8,
                      border: "1px solid var(--nilasa-border)",
                      fontSize: "14px",
                      backgroundColor: "var(--nilasa-ivory)",
                      outline: "none"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div style={{ marginTop: -6 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: "11px", color: "var(--ink-muted)" }}>Password Strength:</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: strength.color }}>{strength.text}</span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <div style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: strength.score >= 1 ? strength.color : "#E2E8F0" }} />
                  <div style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: strength.score >= 2 ? strength.color : "#E2E8F0" }} />
                  <div style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: strength.score >= 3 ? strength.color : "#E2E8F0" }} />
                </div>
              </div>
            )}

            {/* Terms and Policies */}
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                fontSize: "12px",
                color: "var(--ink-muted)",
                cursor: "pointer",
                marginTop: 2
              }}
            >
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ marginTop: 2, accentColor: "var(--nilasa-indigo)" }}
              />
              <span>
                I agree to Nilasa&apos;s{" "}
                <Link href="/terms-of-service" target="_blank" style={{ color: "var(--nilasa-indigo)", textDecoration: "underline" }}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" target="_blank" style={{ color: "var(--nilasa-indigo)", textDecoration: "underline" }}>
                  Privacy Policy
                </Link>.
              </span>
            </label>

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
              <span>{loading ? "Sending Code..." : "Verify & Continue →"}</span>
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>
        )}

        {/* ── STEP 2: Enter Verification Code ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyAndCreateAccount} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label
                htmlFor="otpCode"
                style={{
                  display: "block",
                  fontSize: "11.5px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--ink-primary)",
                  marginBottom: 8,
                  textAlign: "center"
                }}
              >
                6-Digit Verification Code
              </label>

              <input
                id="otpCode"
                type="text"
                maxLength={6}
                autoFocus
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                style={{
                  width: "100%",
                  height: 52,
                  textAlign: "center",
                  fontSize: "24px",
                  fontWeight: 700,
                  letterSpacing: "0.35em",
                  fontFamily: "var(--font-mono)",
                  borderRadius: 8,
                  border: "2px solid var(--nilasa-indigo)",
                  backgroundColor: "var(--nilasa-ivory)",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12.5px" }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--ink-muted)",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0
                }}
              >
                ← Edit details
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={!canResend || loading}
                style={{
                  background: "none",
                  border: "none",
                  color: canResend ? "var(--nilasa-indigo)" : "var(--ink-muted)",
                  cursor: canResend ? "pointer" : "not-allowed",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <RotateCcw size={13} />
                <span>{canResend ? "Resend Code" : `Resend in ${countdown}s`}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
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
                cursor: loading || otpCode.length < 6 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 14px rgba(32, 43, 69, 0.18)",
                opacity: loading || otpCode.length < 6 ? 0.6 : 1
              }}
            >
              <span>{loading ? "Verifying..." : "Complete & Activate Account"}</span>
              {!loading && <CheckCircle2 size={16} />}
            </button>
          </form>
        )}

        {/* ── STEP 3: Celebratory Welcome ── */}
        {step === 3 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                color: "#10B981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--nilasa-indigo)", margin: "0 0 8px" }}>
              Account Verified Successfully!
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--ink-muted)", margin: "0 0 20px" }}>
              Welcome to Nilasa Club, <strong>{name}</strong>. Enjoy 10% off your first handcrafted silhouette.
            </p>
            <div
              style={{
                background: "var(--nilasa-card)",
                border: "1px dashed var(--nilasa-gold)",
                borderRadius: 8,
                padding: "10px 16px",
                display: "inline-flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <Sparkles size={14} color="var(--nilasa-gold)" />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700, color: "var(--nilasa-indigo)" }}>
                WELCOME COUPON: NILASA10
              </span>
            </div>
          </div>
        )}

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
          <span>Already have an account? </span>
          <Link
            href={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
            style={{ color: "var(--nilasa-indigo)", fontWeight: 700, textDecoration: "underline" }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
