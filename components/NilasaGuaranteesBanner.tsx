"use client";

import { CreditCard, Truck, Sparkles, ShieldCheck } from "lucide-react";

const GUARANTEES = [
  {
    icon: CreditCard,
    title: "Secure Payment",
    desc: "Credit card, UPI, Netbanking & COD"
  },
  {
    icon: Truck,
    title: "24h Dispatch",
    desc: "Swift courier delivery across India"
  },
  {
    icon: Sparkles,
    title: "Handcrafted Zari",
    desc: "100% Pure Chanderi & Organza Silks"
  },
  {
    icon: ShieldCheck,
    title: "Complimentary Shipping",
    desc: "Free express shipping on all prepaid orders"
  }
];

export function NilasaGuaranteesBanner() {
  return (
    <section className="nilasa-features-section shell" aria-label="Brand Guarantees">
      <div className="nilasa-features-grid">
        {GUARANTEES.map((f, idx) => {
          const Icon = f.icon;
          return (
            <div key={idx} className="nilasa-feature-card">
              <div className="nilasa-feature-card__icon">
                <Icon size={20} strokeWidth={1.75} color="#8E6EA8" />
              </div>
              <div className="nilasa-feature-card__text">
                <h4 className="nilasa-feature-card__title">{f.title}</h4>
                <p className="nilasa-feature-card__desc">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
