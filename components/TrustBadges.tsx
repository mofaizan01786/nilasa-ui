import { Award, Feather, Sparkles, Heart } from "lucide-react";

export function TrustBadges() {
  const BADGES = [
    {
      title: "PREMIUM QUALITY",
      desc: "Hand-selected fabrics & pure zari",
      icon: <Award size={24} color="var(--nilasa-gold)" strokeWidth={1.8} />
    },
    {
      title: "COMFORT & STYLE",
      desc: "Breathable weaves for all-day ease",
      icon: <Feather size={24} color="var(--nilasa-gold)" strokeWidth={1.8} />
    },
    {
      title: "PERFECT FINISH",
      desc: "Flawless seams & artisan tailoring",
      icon: <Sparkles size={24} color="var(--nilasa-gold)" strokeWidth={1.8} />
    },
    {
      title: "MADE WITH PASSION",
      desc: "Grace & luxury in every thread",
      icon: <Heart size={24} color="var(--nilasa-gold)" strokeWidth={1.8} />
    }
  ];

  return (
    <section className="trust-badges-bar">
      <div className="shell trust-badges-grid">
        {BADGES.map((badge, idx) => (
          <div key={idx} className="trust-badge-item">
            <div className="trust-badge-icon">{badge.icon}</div>
            <div className="trust-badge-content">
              <span className="trust-badge-title">{badge.title}</span>
              <span className="trust-badge-desc">{badge.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
