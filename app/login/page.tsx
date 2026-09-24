"use client";

import Image from "next/image";
import { useState, useEffect, useRef, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { fetchAuthMethods } from "@/lib/dotnet-backend";
import { AuthMethodsResponse } from "@/lib/types";
import {
  AlertCircle,
  Lock,
  Mail,
  Smartphone,
  ArrowRight,
  Eye,
  EyeOff,
  RotateCcw,
  ShieldCheck,
  Sparkles
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const { login, loginWithGoogle, sendOtp, loginWithOtp, isAuthenticated } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  // Auth Methods Config from Backend (GET /api/v1/auth/methods)
  const [authMethods, setAuthMethods] = useState<AuthMethodsResponse>({
    google: false,
    mobileOtp: true,
    otp: {
      length: 6,
      resendCooldownSeconds: 30,
      defaultCountryCode: "+91",
      allowedCountries: ["IN"]
    }
  });

  // Active Tab: "phone" | "email"
  const [activeTab, setActiveTab] = useState<"phone" | "email">("phone");

  // Phone OTP Flow State
  const [otpStep, setOtpStep] = useState<1 | 2>(1); // 1 = Phone input, 2 = 6-digit OTP
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Email/Password Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, redirectUrl, router]);

  // Fetch available auth methods on mount
  useEffect(() => {
    let isMounted = true;
    fetchAuthMethods().then((res) => {
      if (isMounted && res) {
        setAuthMethods(res);
        if (!res.mobileOtp) {
          setActiveTab("email");
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Countdown timer for OTP Resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto focus first OTP input when moving to Step 2
  useEffect(() => {
    if (otpStep === 2) {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [otpStep]);

  // ── Handlers for Phone OTP Flow ─────────────────────────

  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 10);
    setPhone(cleaned);
    if (error) setError("");
  };

  const handleSendOtp = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    setError("");
    setInfoMessage("");

    try {
      const result = await sendOtp(cleanPhone);
      if (result.success) {
        setOtpStep(2);
        const cooldown = result.resendAfterSeconds || authMethods.otp?.resendCooldownSeconds || 30;
        setResendCooldown(cooldown);
        setOtpDigits(["", "", "", "", "", ""]);
        setInfoMessage(`Verification code sent to +91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`);
      } else {
        setError(result.error || "Unable to send verification code. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    if (error) setError("");

    // Support pasting multi-digit code (e.g. "123456")
    if (val.length > 1) {
      const pastedDigits = val.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otpDigits];
      pastedDigits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtpDigits(newOtp);

      const nextFocus = Math.min(pastedDigits.length, 5);
      otpInputsRef.current[nextFocus]?.focus();

      if (pastedDigits.length === 6) {
        verifyOtpCode(newOtp.join(""));
      }
      return;
    }

    const singleDigit = val.replace(/\D/g, "").slice(0, 1);
    const newOtp = [...otpDigits];
    newOtp[index] = singleDigit;
    setOtpDigits(newOtp);

    // Auto move to next input
    if (singleDigit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto submit on 6th digit
    if (singleDigit && index === 5) {
      const fullCode = newOtp.join("");
      if (fullCode.length === 6) {
        verifyOtpCode(fullCode);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        otpInputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || "";
    }
    setOtpDigits(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    otpInputsRef.current[nextIndex]?.focus();

    if (pastedData.length === 6) {
      verifyOtpCode(pastedData);
    }
  };

  const verifyOtpCode = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await loginWithOtp(phone, code);
      if (result.success) {
        router.push(redirectUrl);
      } else {
        setError(result.error || "Incorrect or expired OTP. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify OTP.");
      setLoading(false);
    }
  };

  const handleOtpSubmit = (e: FormEvent) => {
    e.preventDefault();
    verifyOtpCode();
  };

  // ── Handlers for Email/Password Flow ────────────────────

  const handleEmailSubmit = async (e: FormEvent) => {
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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    setInfoMessage("");

    try {
      // In production, can use google.accounts.id or OAuth popup
      const result = await loginWithGoogle({
        email: "customer@nilasa.com",
        name: "Nilasa Patron"
      });

      if (result.success) {
        router.push(redirectUrl);
      } else {
        setError(result.error || "Google sign-in failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Google sign-in unavailable.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        background: "radial-gradient(ellipse at top, #FAF6F0 0%, #F5EFEB 100%)"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(198, 146, 68, 0.22)",
          borderRadius: 18,
          padding: "36px 30px",
          boxShadow: "0 20px 48px -12px rgba(32, 43, 69, 0.10)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Luxury Gold Top Accent Line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, #7A2832 0%, #C69244 50%, #7A2832 100%)"
          }}
        />

        {/* ─── MINIMALIST BRAND HEADER ─── */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              display: "inline-block",
              marginBottom: 10
            }}
          >
            <Image
              src="/nilasa-crest-logo.png"
              alt="Nilasa - Grace In Every Thread"
              width={180}
              height={180}
              priority
              style={{
                width: 76,
                height: "auto",
                objectFit: "contain",
                margin: "0 auto",
                display: "block",
                filter: "brightness(0)",
                opacity: 0.92
              }}
            />
          </Link>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "21px",
              fontWeight: 600,
              color: "var(--nilasa-indigo)",
              margin: "0 0 4px 0",
              letterSpacing: "-0.01em"
            }}
          >
            Welcome to Nilasa
          </h1>

          <p
            style={{
              fontSize: "12.5px",
              color: "var(--ink-muted)",
              margin: 0,
              lineHeight: 1.4
            }}
          >
            Sign in to access your account & orders
          </p>
        </div>

        {/* ─── LOGIN METHOD TABS ─── */}
        {authMethods.mobileOtp && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              background: "#F1EBE4",
              padding: "4px",
              borderRadius: 12,
              marginBottom: 22,
              border: "1px solid rgba(198, 146, 68, 0.2)"
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab("phone");
                setError("");
                setInfoMessage("");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                padding: "10px 14px",
                borderRadius: 9,
                border: "none",
                fontSize: "12.5px",
                fontWeight: activeTab === "phone" ? 700 : 600,
                color: activeTab === "phone" ? "#FFFFFF" : "#64748B",
                backgroundColor: activeTab === "phone" ? "var(--nilasa-indigo)" : "transparent",
                boxShadow: activeTab === "phone" ? "0 4px 12px rgba(32, 43, 69, 0.22)" : "none",
                cursor: "pointer",
                transition: "all 0.18s ease"
              }}
            >
              <Smartphone size={15} color={activeTab === "phone" ? "#E2B874" : "#94A3B8"} />
              <span>Mobile OTP</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("email");
                setError("");
                setInfoMessage("");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                padding: "10px 14px",
                borderRadius: 9,
                border: "none",
                fontSize: "12.5px",
                fontWeight: activeTab === "email" ? 700 : 600,
                color: activeTab === "email" ? "#FFFFFF" : "#64748B",
                backgroundColor: activeTab === "email" ? "var(--nilasa-indigo)" : "transparent",
                boxShadow: activeTab === "email" ? "0 4px 12px rgba(32, 43, 69, 0.22)" : "none",
                cursor: "pointer",
                transition: "all 0.18s ease"
              }}
            >
              <Mail size={15} color={activeTab === "email" ? "#E2B874" : "#94A3B8"} />
              <span>Email & Password</span>
            </button>
          </div>
        )}

        {/* ─── ERROR ALERT ─── */}
        {error && (
          <div
            style={{
              backgroundColor: "#FDF0EE",
              color: "var(--status-danger)",
              border: "1px solid #F8C8C3",
              padding: "11px 14px",
              borderRadius: 10,
              fontSize: "12.5px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 18
            }}
          >
            <AlertCircle size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* ─── INFO / SUCCESS ALERT ─── */}
        {infoMessage && !error && (
          <div
            style={{
              backgroundColor: "#F0F9F3",
              color: "#1E6B24",
              border: "1px solid #C8E6C9",
              padding: "11px 14px",
              borderRadius: 10,
              fontSize: "12.5px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 18
            }}
          >
            <ShieldCheck size={16} style={{ flexShrink: 0 }} />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* ─── TAB 1: PHONE OTP FLOW ─── */}
        {activeTab === "phone" && (
          <div>
            {otpStep === 1 ? (
              // Step 1: Phone Number Input
              <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
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
                      marginBottom: 7
                    }}
                  >
                    Mobile Phone Number *
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {/* Country Code Pill */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        height: 46,
                        padding: "0 13px",
                        borderRadius: 10,
                        border: "1px solid var(--nilasa-border)",
                        backgroundColor: "#FAF6F0",
                        fontSize: "13.5px",
                        fontWeight: 700,
                        color: "var(--nilasa-indigo)",
                        flexShrink: 0
                      }}
                    >
                      <span style={{ fontSize: "15px" }}>🇮🇳</span>
                      <span>+91</span>
                    </div>

                    <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
                      <Smartphone
                        size={16}
                        color="var(--ink-muted)"
                        style={{ position: "absolute", left: 14, pointerEvents: "none" }}
                      />
                      <input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        required
                        placeholder="Enter 10-digit number"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        style={{
                          width: "100%",
                          height: 46,
                          paddingLeft: 40,
                          paddingRight: 14,
                          borderRadius: 10,
                          border: "1px solid var(--nilasa-border)",
                          fontSize: "15px",
                          fontFamily: "var(--font-mono)",
                          letterSpacing: "0.04em",
                          backgroundColor: "#FAF6F0",
                          outline: "none",
                          transition: "border-color 0.18s ease"
                        }}
                      />
                    </div>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: "11.5px", color: "var(--ink-muted)" }}>
                    We will send an SMS with a 6-digit verification code.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || phone.length !== 10}
                  style={{
                    backgroundColor: "var(--nilasa-indigo)",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 10,
                    height: 48,
                    fontSize: "13.5px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    cursor: loading || phone.length !== 10 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginTop: 4,
                    transition: "all 0.18s ease",
                    boxShadow: "0 4px 14px rgba(32, 43, 69, 0.18)",
                    opacity: loading || phone.length !== 10 ? 0.65 : 1
                  }}
                >
                  <span>{loading ? "Sending OTP..." : "Get Verification Code"}</span>
                  {!loading && <ArrowRight size={15} />}
                </button>
              </form>
            ) : (
              // Step 2: 6-Digit OTP Verification
              <form onSubmit={handleOtpSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Phone number change pill */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: 10,
                    backgroundColor: "#FAF6F0",
                    border: "1px solid var(--nilasa-border)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "13px", color: "var(--ink-primary)" }}>
                    <Smartphone size={15} color="var(--nilasa-gold)" />
                    <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                      +91 {phone.slice(0, 5)} {phone.slice(5)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep(1);
                      setError("");
                      setInfoMessage("");
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--nilasa-indigo)",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      textDecoration: "underline"
                    }}
                  >
                    Change Number
                  </button>
                </div>

                {/* 6 Individual Digit Inputs */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11.5px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--ink-primary)",
                      marginBottom: 10,
                      textAlign: "center"
                    }}
                  >
                    Enter 6-Digit Security Code
                  </label>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(6, 1fr)",
                      gap: 8,
                      maxWidth: 340,
                      margin: "0 auto"
                    }}
                    onPaste={handleOtpPaste}
                  >
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpInputsRef.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        style={{
                          width: "100%",
                          height: 50,
                          textAlign: "center",
                          fontSize: "20px",
                          fontWeight: 700,
                          fontFamily: "var(--font-mono)",
                          borderRadius: 10,
                          border: digit ? "2px solid var(--nilasa-indigo)" : "1px solid var(--nilasa-border)",
                          backgroundColor: digit ? "#FFFFFF" : "#FAF6F0",
                          color: "var(--nilasa-indigo)",
                          outline: "none",
                          transition: "all 0.15s ease",
                          boxShadow: digit ? "0 2px 8px rgba(32, 43, 69, 0.1)" : "none"
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Resend OTP countdown */}
                <div style={{ textAlign: "center", fontSize: "12.5px", color: "var(--ink-muted)" }}>
                  {resendCooldown > 0 ? (
                    <span>
                      Resend code in <strong style={{ color: "var(--nilasa-indigo)" }}>{resendCooldown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={loading}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--nilasa-indigo)",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        textDecoration: "underline"
                      }}
                    >
                      <RotateCcw size={13} />
                      <span>Resend Verification Code</span>
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || otpDigits.join("").length !== 6}
                  style={{
                    backgroundColor: "var(--nilasa-indigo)",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 10,
                    height: 48,
                    fontSize: "13.5px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    cursor: loading || otpDigits.join("").length !== 6 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.18s ease",
                    boxShadow: "0 4px 14px rgba(32, 43, 69, 0.18)",
                    opacity: loading || otpDigits.join("").length !== 6 ? 0.65 : 1
                  }}
                >
                  <span>{loading ? "Verifying..." : "Verify & Sign In"}</span>
                  {!loading && <ArrowRight size={15} />}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ─── TAB 2: EMAIL & PASSWORD FLOW ─── */}
        {activeTab === "email" && (
          <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
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
                    height: 46,
                    paddingLeft: 40,
                    paddingRight: 14,
                    borderRadius: 10,
                    border: "1px solid var(--nilasa-border)",
                    fontSize: "14px",
                    backgroundColor: "#FAF6F0",
                    outline: "none",
                    transition: "border-color 0.18s ease"
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
                  style={{ fontSize: "12px", color: "var(--nilasa-indigo)", textDecoration: "underline", fontWeight: 600 }}
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
                    height: 46,
                    paddingLeft: 40,
                    paddingRight: 42,
                    borderRadius: 10,
                    border: "1px solid var(--nilasa-border)",
                    fontSize: "14px",
                    backgroundColor: "#FAF6F0",
                    outline: "none",
                    transition: "border-color 0.18s ease"
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
                borderRadius: 10,
                height: 48,
                fontSize: "13.5px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 4,
                transition: "all 0.18s ease",
                boxShadow: "0 4px 14px rgba(32, 43, 69, 0.18)",
                opacity: loading ? 0.65 : 1
              }}
            >
              <span>{loading ? "Signing in..." : "Sign In with Email"}</span>
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>
        )}

        {/* ─── SOCIAL SIGN-IN / GOOGLE OAUTH ─── */}
        <div style={{ marginTop: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, backgroundColor: "rgba(198, 146, 68, 0.2)" }} />
            <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-muted)", fontWeight: 600 }}>
              Or Continue With
            </span>
            <div style={{ flex: 1, height: 1, backgroundColor: "rgba(198, 146, 68, 0.2)" }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            style={{
              width: "100%",
              height: 46,
              borderRadius: 10,
              border: "1px solid rgba(198, 146, 68, 0.3)",
              backgroundColor: "#FFFFFF",
              color: "#1E293B",
              fontSize: "13.5px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              cursor: loading || googleLoading ? "not-allowed" : "pointer",
              transition: "all 0.18s ease",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)"
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{googleLoading ? "Signing in with Google..." : "Sign In with Google"}</span>
          </button>
        </div>

        {/* ─── BOTTOM SIGNUP LINK ─── */}
        <div
          style={{
            marginTop: 26,
            paddingTop: 18,
            borderTop: "1px solid rgba(198, 146, 68, 0.16)",
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
            Create an Account →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
