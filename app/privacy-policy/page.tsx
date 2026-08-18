import Link from "next/link";
import { ShieldCheck, Lock, Cookie, Eye, Mail, FileText } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Nilasa Wear",
  description: "Learn how Nilasa protects your personal information, handles payment encryption, and manages cookies."
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: "80vh", padding: "48px 0 96px" }}>
      <div className="shell" style={{ maxWidth: 840 }}>
        {/* Page Header */}
        <div style={{ marginBottom: 40, borderBottom: "1px solid var(--nilasa-border)", paddingBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--nilasa-gold)", marginBottom: 8 }}>
            <ShieldCheck size={18} />
            <span className="eyebrow eyebrow--gold">Legal & Data Protection</span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "36px",
              fontWeight: 600,
              color: "var(--nilasa-indigo)",
              margin: "0 0 10px 0"
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ fontSize: "14px", color: "var(--ink-muted)", margin: 0 }}>
            Last Updated: August 2026 • Governed by the Information Technology Act, 2000 & DPDP Act, 2023.
          </p>
        </div>

        {/* Policy Body */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--nilasa-border)",
            borderRadius: 12,
            padding: "36px 40px",
            lineHeight: 1.7,
            color: "var(--ink-primary)",
            fontSize: "15px",
            display: "flex",
            flexDirection: "column",
            gap: 28
          }}
        >
          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--nilasa-indigo)", margin: "0 0 12px 0" }}>
              1. Introduction
            </h2>
            <p style={{ margin: 0, color: "var(--ink-muted)" }}>
              Nilasa Wear (&quot;Nilasa&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the online luxury ethnic wear store at <strong>nilasawear.com</strong>. We are committed to safeguarding your personal data and respecting your privacy. This Privacy Policy details how we collect, store, process, and protect your information when you browse our storefront, create an account, purchase handcrafted ethnic garments, or interact with our services.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--nilasa-indigo)", margin: "0 0 12px 0" }}>
              2. Information We Collect
            </h2>
            <p style={{ margin: "0 0 10px 0", color: "var(--ink-muted)" }}>
              We collect information you directly provide to us and data gathered automatically during your browsing sessions:
            </p>
            <ul style={{ margin: 0, paddingLeft: 20, color: "var(--ink-muted)", display: "flex", flexDirection: "column", gap: 6 }}>
              <li><strong>Personal Identification:</strong> Full name, email address, contact phone number when you register an account or place an order.</li>
              <li><strong>Shipping & Delivery Details:</strong> Physical postal address, landmark, city, state, and pin code for order fulfillment across India.</li>
              <li><strong>Transaction Records:</strong> Products purchased, size selections, order timestamps, and invoice amounts.</li>
              <li><strong>Device & Usage Data:</strong> IP address, browser type, referral URLs, and interactions with our catalog.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--nilasa-indigo)", margin: "0 0 12px 0" }}>
              3. Payment Security & Encryption
            </h2>
            <p style={{ margin: 0, color: "var(--ink-muted)" }}>
              Nilasa does <strong>not</strong> store your credit card numbers, debit card details, CVVs, or UPI PINs on our servers. All transactions are securely processed through RBI-authorized payment aggregators (including Razorpay) using 256-bit SSL encryption and Level 1 PCI-DSS certified tokenization protocols.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--nilasa-indigo)", margin: "0 0 12px 0" }}>
              4. Cookies and Tracking Technologies
            </h2>
            <p style={{ margin: "0 0 10px 0", color: "var(--ink-muted)" }}>
              We use cookies to maintain your shopping bag items, remember authentication sessions, and analyze site performance:
            </p>
            <ul style={{ margin: 0, paddingLeft: 20, color: "var(--ink-muted)", display: "flex", flexDirection: "column", gap: 6 }}>
              <li><strong>Essential Cookies:</strong> Required to keep products in your cart and process secure checkout.</li>
              <li><strong>Preference Cookies:</strong> Remember your size filters and user settings.</li>
              <li><strong>Analytics Cookies:</strong> Help us improve site speed and understand popular collection categories.</li>
            </ul>
            <p style={{ margin: "10px 0 0 0", color: "var(--ink-muted)" }}>
              You may manage or withdraw your cookie preferences anytime using our on-site cookie banner or through your browser settings.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--nilasa-indigo)", margin: "0 0 12px 0" }}>
              5. How We Share Your Information
            </h2>
            <p style={{ margin: 0, color: "var(--ink-muted)" }}>
              We never sell, rent, or trade your personal information to third-party marketers. We share minimal data exclusively with trusted logistics partners (such as Delhivery, BlueDart, or India Post) strictly to deliver your parcels, and with cloud infrastructure partners to ensure site uptime and security.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--nilasa-indigo)", margin: "0 0 12px 0" }}>
              6. Your Rights & Data Retention
            </h2>
            <p style={{ margin: 0, color: "var(--ink-muted)" }}>
              Under applicable Indian laws, you have the right to review the personal information we hold about you, request corrections, or ask for the deletion of your account. You can manage your details directly from your <Link href="/account" style={{ color: "var(--nilasa-indigo)", textDecoration: "underline", fontWeight: 500 }}>Customer Account</Link> or by contacting our support team.
            </p>
          </section>

          <section style={{ backgroundColor: "var(--nilasa-ivory)", padding: "20px", borderRadius: 8, border: "1px solid var(--nilasa-border)" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "var(--nilasa-indigo)", margin: "0 0 8px 0" }}>
              7. Grievance Redressal & Contact Officer
            </h2>
            <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "var(--ink-muted)" }}>
              In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the contact details for privacy grievances are:
            </p>
            <div style={{ fontSize: "13px", color: "var(--ink-primary)", display: "flex", flexDirection: "column", gap: 4 }}>
              <strong>NILASA WEAR — Customer Privacy Department</strong>
              <span>📍 Kanpur, Uttar Pradesh, India</span>
              <span>✉️ Email: nilasawear@gmail.com</span>
              <span>📞 Phone: +91 9336114583</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
