"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ArrowRight
} from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <footer className="footer">
      {/* 1. Value Props Strip */}
      <div className="footer-props-strip">
        <div className="shell footer-props-grid">
          <div className="footer-prop-item">
            <div className="footer-prop-icon">
              <Truck size={20} />
            </div>
            <div>
              <strong>Complimentary Shipping</strong>
              <span>Pan-India express air delivery</span>
            </div>
          </div>

          <div className="footer-prop-item">
            <div className="footer-prop-icon">
              <RotateCcw size={20} />
            </div>
            <div>
              <strong>7-Day Easy Returns</strong>
              <span>Hassle-free exchange guarantee</span>
            </div>
          </div>

          <div className="footer-prop-item">
            <div className="footer-prop-icon">
              <ShieldCheck size={20} />
            </div>
            <div>
              <strong>100% Authentic Handcrafted</strong>
              <span>Inspected master artisan craft</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Grid */}
      <div className="shell footer-grid">
        {/* Col 1: Brand & Contact Identity */}
        <div className="footer-col footer-col-brand">
          <Link href="/" className="footer-brand-anchor" aria-label="Nilasa Home">
            <Image
              src="/nilasa-crest-logo.png"
              alt="Nilasa - Grace In Every Thread"
              width={200}
              height={70}
              className="footer-brand-logo-img"
              unoptimized
            />
          </Link>
          <p className="footer-desc">
            Modern Indian ethnic wear designed with quiet confidence. Handcrafted Chanderi silks, zari woven suit sets, and timeless separates.
          </p>

          <div className="footer-contact-list">
            <div className="footer-contact-row">
              <MapPin size={15} className="footer-icon-gold" />
              <span>Civil Lines, Kanpur, Uttar Pradesh, India</span>
            </div>
            <a href="tel:+919336114583" className="footer-contact-row footer-contact-link">
              <Phone size={15} className="footer-icon-gold" />
              <span>+91 93361 14583</span>
            </a>
            <a href="mailto:nilasawear@gmail.com" className="footer-contact-row footer-contact-link">
              <Mail size={15} className="footer-icon-gold" />
              <span>nilasawear@gmail.com</span>
            </a>
            <a
              href="https://instagram.com/nilasa.wear"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-row footer-contact-link"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="footer-icon-gold">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <span>@nilasa.wear</span>
            </a>
          </div>
        </div>

        {/* Col 2: Collections */}
        <div className="footer-col">
          <h4 className="footer-heading">Collections</h4>
          <ul className="footer-links">
            <li><Link href="/shop">Shop All Pieces</Link></li>
            <li><Link href="/category/suits">Suits & Anarkalis</Link></li>
            <li><Link href="/category/kurtis">Chanderi Kurtis</Link></li>
            <li><Link href="/category/co-ord-sets">Linen Co-Ord Sets</Link></li>
            <li><Link href="/category/unstitched-suits">Unstitched Dress Material</Link></li>
            <li><Link href="/category/dupattas">Handloom Zari Dupattas</Link></li>
          </ul>
        </div>

        {/* Col 3: Customer Care & Services */}
        <div className="footer-col">
          <h4 className="footer-heading">Customer Care</h4>
          <ul className="footer-links">
            <li><Link href="/account">My Account & Orders</Link></li>
            <li><Link href="/cart">Shopping Bag</Link></li>
            <li><Link href="/checkout">Express Checkout</Link></li>
            <li><Link href="/shipping-returns">Shipping & Returns</Link></li>
            <li><Link href="/terms-of-service">Terms of Sale</Link></li>
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Col 4: Nilasa Club & Newsletter */}
        <div className="footer-col footer-col-club">
          <h4 className="footer-heading">Nilasa Club</h4>
          <p className="footer-desc">
            Subscribe for private access to new collection drops, festive previews, and exclusive codes.
          </p>

          {subscribed ? (
            <div className="footer-subscribe-success">
              <Check size={16} color="#10B981" />
              <span>Welcome to Nilasa Club. Check your inbox for your 10% welcome code.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="newsletter-input"
                required
                aria-label="Email address for Nilasa Club newsletter"
              />
              <button type="submit" className="newsletter-btn" aria-label="Subscribe to newsletter">
                <span>Join</span>
                <ArrowRight size={13} />
              </button>
            </form>
          )}

          <div className="footer-payment-safe">
            <span className="footer-safe-tag">256-Bit SSL Encrypted Checkout</span>
            <span className="footer-safe-methods">UPI • Visa • Mastercard • RuPay • NetBanking • COD</span>
          </div>
        </div>
      </div>

      {/* 3. Footer Bottom Bar */}
      <div className="footer-bottom-container">
        <div className="shell footer-bottom">
          <p>© {new Date().getFullYear()} NILASA WEAR. All Rights Reserved. Crafted with grace in India.</p>
          <div className="footer-bottom-links">
            <Link href="/terms-of-service">Terms of Sale</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/shipping-returns">Shipping & Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
