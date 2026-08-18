import Link from "next/link";
import { Truck, RotateCcw, PackageCheck, ShieldAlert, Clock, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Shipping, Returns & Exchanges | Nilasa Wear",
  description: "Learn about Nilasa's express pan-India shipping, 7-day hassle-free return policy, and easy size exchange process."
};

export default function ShippingReturnsPage() {
  return (
    <div style={{ minHeight: "80vh", padding: "48px 0 96px" }}>
      <div className="shell" style={{ maxWidth: 840 }}>
        {/* Header */}
        <div style={{ marginBottom: 40, borderBottom: "1px solid var(--nilasa-border)", paddingBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--nilasa-gold)", marginBottom: 8 }}>
            <Truck size={18} />
            <span className="eyebrow eyebrow--gold">Customer Promise</span>
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
            Shipping & Returns Policy
          </h1>
          <p style={{ fontSize: "14px", color: "var(--ink-muted)", margin: 0 }}>
            Enjoy complimentary express shipping across India & transparent 7-day returns on all ethnic wear.
          </p>
        </div>

        {/* Highlights Strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--nilasa-border)", borderRadius: 8, padding: "18px 20px" }}>
            <Truck size={22} color="var(--nilasa-gold)" style={{ marginBottom: 8 }} />
            <strong style={{ display: "block", fontSize: "15px", color: "var(--nilasa-indigo)", marginBottom: 4 }}>
              Complimentary Shipping
            </strong>
            <span style={{ fontSize: "13px", color: "var(--ink-muted)", lineHeight: 1.4 }}>
              Free express delivery on all orders across India.
            </span>
          </div>

          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--nilasa-border)", borderRadius: 8, padding: "18px 20px" }}>
            <Clock size={22} color="var(--nilasa-gold)" style={{ marginBottom: 8 }} />
            <strong style={{ display: "block", fontSize: "15px", color: "var(--nilasa-indigo)", marginBottom: 4 }}>
              3–6 Business Days
            </strong>
            <span style={{ fontSize: "13px", color: "var(--ink-muted)", lineHeight: 1.4 }}>
              Dispatch in 24–48 hours from our central atelier in Kanpur.
            </span>
          </div>

          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid var(--nilasa-border)", borderRadius: 8, padding: "18px 20px" }}>
            <RotateCcw size={22} color="var(--nilasa-gold)" style={{ marginBottom: 8 }} />
            <strong style={{ display: "block", fontSize: "15px", color: "var(--nilasa-indigo)", marginBottom: 4 }}>
              7-Day Returns
            </strong>
            <span style={{ fontSize: "13px", color: "var(--ink-muted)", lineHeight: 1.4 }}>
              Hassle-free reverse pickups & quick refunds to original payment source.
            </span>
          </div>
        </div>

        {/* Main Content */}
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
              1. Domestic Shipping Policy
            </h2>
            <p style={{ margin: "0 0 10px 0", color: "var(--ink-muted)" }}>
              We partner with India&apos;s leading logistics networks (including BlueDart, Delhivery, and DTDC) to ensure your artisanal garments arrive safely and on time:
            </p>
            <ul style={{ margin: 0, paddingLeft: 20, color: "var(--ink-muted)", display: "flex", flexDirection: "column", gap: 6 }}>
              <li><strong>Processing Time:</strong> Ready-to-ship garments are packaged and dispatched within 24 to 48 business hours.</li>
              <li><strong>Transit Timelines:</strong> Metro cities receive orders within 2–4 business days; rest of India within 4–6 business days.</li>
              <li><strong>Tracking:</strong> You will receive real-time SMS and email updates with your consignment number as soon as the courier scans your package.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--nilasa-indigo)", margin: "0 0 12px 0" }}>
              2. 7-Day Return & Exchange Policy
            </h2>
            <p style={{ margin: "0 0 10px 0", color: "var(--ink-muted)" }}>
              We want you to love your Nilasa garments. If a size does not fit or the piece is not what you expected, you can initiate a return or exchange within <strong>7 calendar days</strong> of parcel delivery.
            </p>
            <div style={{ backgroundColor: "var(--nilasa-ivory)", padding: "16px 20px", borderRadius: 8, border: "1px solid var(--nilasa-border)", marginTop: 10 }}>
              <strong style={{ fontSize: "14px", color: "var(--nilasa-indigo)" }}>Return Conditions:</strong>
              <ul style={{ margin: "8px 0 0 0", paddingLeft: 18, color: "var(--ink-muted)", fontSize: "13px", display: "flex", flexDirection: "column", gap: 4 }}>
                <li>Items must be unworn, unwashed, and undamaged.</li>
                <li>Original brand tags, barcode labels, and Nilasa luxury garment pouches must be intact.</li>
                <li>Custom-altered sizes or fabrics cut from unstitched dress materials are not eligible for return.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--nilasa-indigo)", margin: "0 0 12px 0" }}>
              3. How to Request a Return or Size Exchange
            </h2>
            <p style={{ margin: "0 0 12px 0", color: "var(--ink-muted)" }}>
              Initiating a return is simple and frictionless:
            </p>
            <ol style={{ margin: 0, paddingLeft: 20, color: "var(--ink-muted)", display: "flex", flexDirection: "column", gap: 8 }}>
              <li>
                <strong>Contact Customer Care:</strong> Email us at <strong>nilasawear@gmail.com</strong> or WhatsApp us at <strong>+91 9336114583</strong> with your Order ID and photos of the item.
              </li>
              <li>
                <strong>Doorstep Reverse Pickup:</strong> Our courier representative will collect the packaged parcel from your delivery address within 24–48 hours.
              </li>
              <li>
                <strong>Quality Check & Refund:</strong> Once the garment reaches our atelier and completes standard inspection, your refund is credited back to your original payment method (Bank Account / UPI / Card) within <strong>3 to 5 banking days</strong>.
              </li>
            </ol>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--nilasa-indigo)", margin: "0 0 12px 0" }}>
              4. Damaged or Defective Items
            </h2>
            <p style={{ margin: 0, color: "var(--ink-muted)" }}>
              Every Nilasa piece undergoes rigorous multi-point quality inspections prior to packing. In the unlikely event you receive a damaged piece, notify us within 48 hours of delivery with an unboxing photo/video, and we will dispatch an immediate replacement or issue a 100% full refund including reverse logistics charges.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
