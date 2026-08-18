import Link from "next/link";
import { FileText, CheckCircle2, Shield } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Nilasa Wear",
  description: "Terms and conditions governing orders, deliveries, and catalog purchases on Nilasa Wear."
};

export default function TermsOfServicePage() {
  return (
    <div style={{ minHeight: "80vh", padding: "48px 0 96px" }}>
      <div className="shell" style={{ maxWidth: 840 }}>
        {/* Page Header */}
        <div style={{ marginBottom: 40, borderBottom: "1px solid var(--nilasa-border)", paddingBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--nilasa-gold)", marginBottom: 8 }}>
            <FileText size={18} />
            <span className="eyebrow eyebrow--gold">Customer Agreement</span>
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
            Terms of Service
          </h1>
          <p style={{ fontSize: "14px", color: "var(--ink-muted)", margin: 0 }}>
            Last Updated: August 2026 • Welcome to Nilasa Wear. Please read these terms carefully before placing an order.
          </p>
        </div>

        {/* Terms Body */}
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
              1. Acceptance of Terms
            </h2>
            <p style={{ margin: 0, color: "var(--ink-muted)" }}>
              By accessing our website (<strong>nilasawear.com</strong>), browsing our catalog, or purchasing any garments, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--nilasa-indigo)", margin: "0 0 12px 0" }}>
              2. Artisanal Handloom Characteristics
            </h2>
            <p style={{ margin: 0, color: "var(--ink-muted)" }}>
              Our garments are handcrafted using natural textiles, including Chanderi silks, modal satins, pure linens, and hand-block prints. Minor irregularities in weave, texture, or hand-block motifs are characteristic of artisanal craftsmanship and are not considered defects. While we strive to photograph products accurately, screen color settings may introduce slight variations.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--nilasa-indigo)", margin: "0 0 12px 0" }}>
              3. Pricing and Payment
            </h2>
            <p style={{ margin: 0, color: "var(--ink-muted)" }}>
              All product prices are quoted in Indian Rupees (INR) and include applicable taxes unless specified otherwise. We reserve the right to modify prices without prior notice. Payments are secured via authorized gateways (UPI, Cards, Net Banking). In the event of a pricing error on our storefront, we reserve the right to cancel the order and provide a full refund.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--nilasa-indigo)", margin: "0 0 12px 0" }}>
              4. Shipping and Delivery
            </h2>
            <p style={{ margin: 0, color: "var(--ink-muted)" }}>
              We ship across all pin codes in India via express logistics partners. Orders are typically processed within 24–48 hours and delivered within 3 to 6 business days. Delivery timelines may vary during festive peak seasons or force majeure events. Refer to our <Link href="/shipping-returns" style={{ color: "var(--nilasa-indigo)", textDecoration: "underline", fontWeight: 500 }}>Shipping & Returns Policy</Link> for details.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--nilasa-indigo)", margin: "0 0 12px 0" }}>
              5. Intellectual Property
            </h2>
            <p style={{ margin: 0, color: "var(--ink-muted)" }}>
              All brand assets, photography, garment designs, text, graphics, logos, and digital software on this website are the intellectual property of Nilasa Wear and protected under Indian Copyright and Trademark laws. Unauthorized reproduction or commercial use is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--nilasa-indigo)", margin: "0 0 12px 0" }}>
              6. Governing Law & Jurisdiction
            </h2>
            <p style={{ margin: 0, color: "var(--ink-muted)" }}>
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or related to the use of this website or orders shall be subject to the exclusive jurisdiction of the competent courts in <strong>Kanpur, Uttar Pradesh, India</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
