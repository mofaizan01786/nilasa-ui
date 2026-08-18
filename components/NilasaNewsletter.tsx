"use client";

import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";

export function NilasaNewsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
  };

  return (
    <section className="nilasa-newsletter-section" aria-label="Newsletter Subscription">
      <div className="nilasa-newsletter-inner shell">
        <span className="nilasa-newsletter__subtitle">THE NILASA PRIVÉ</span>
        <h2 className="nilasa-newsletter__title">Subscribe to our emails</h2>
        <p className="nilasa-newsletter__desc">
          Be the first to know about new festive collections, private sales, and exclusive artisanal drops.
        </p>

        {subscribed ? (
          <div className="nilasa-newsletter__success">
            <Check size={18} color="#15803D" />
            <span>Thank you for subscribing to Nilasa Privé.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="nilasa-newsletter__form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="nilasa-newsletter__input"
            />
            <button type="submit" className="nilasa-newsletter__submit" aria-label="Subscribe">
              <span>Subscribe</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
