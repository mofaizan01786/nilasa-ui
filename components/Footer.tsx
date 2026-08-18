"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function Footer() {
  const [langOpen, setLangOpen] = useState(false);

  return (
    <footer className="nilasa-footer" aria-label="Site Footer">
      <div className="nilasa-footer__inner shell">
        {/* 1. 4-Column Links & Info Grid */}
        <div className="nilasa-footer__grid">
          {/* Col 1: PRODUCTS */}
          <div className="nilasa-footer__col">
            <h4 className="nilasa-footer__heading">PRODUCTS</h4>
            <ul className="nilasa-footer__links">
              <li><Link href="/category/suits">Suits & Anarkalis</Link></li>
              <li><Link href="/category/kurtis">Chanderi Kurtis</Link></li>
              <li><Link href="/category/co-ord-sets">Linen Co-Ord Sets</Link></li>
              <li><Link href="/category/dupattas">Pure Silk Dupattas</Link></li>
              <li><Link href="/category/unstitched-suits">Unstitched Fabrics</Link></li>
              <li><Link href="/category/lehengas">Festive Lehengas</Link></li>
            </ul>
          </div>

          {/* Col 2: SERVICE */}
          <div className="nilasa-footer__col">
            <h4 className="nilasa-footer__heading">SERVICE</h4>
            <ul className="nilasa-footer__links">
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/account">Track Your Order</Link></li>
              <li><Link href="/size-guide">Size Guide</Link></li>
              <li><Link href="/fabric-care">Fabric & Care</Link></li>
            </ul>
          </div>

          {/* Col 3: INFORMATION */}
          <div className="nilasa-footer__col">
            <h4 className="nilasa-footer__heading">INFORMATION</h4>
            <ul className="nilasa-footer__links">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/shipping-returns">Return and Refunds</Link></li>
              <li><Link href="/shipping-returns">Shipping Policy</Link></li>
              <li><Link href="/terms-of-service">Legal Area</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Col 4: ABOUT US */}
          <div className="nilasa-footer__col nilasa-footer__col-about">
            <h4 className="nilasa-footer__heading">ABOUT US</h4>
            <p className="nilasa-footer__about-text">
              Nilasa is an Indian ethnic couture atelier rooted in the textile heritage of Northern India. Every piece is handcrafted with pure Chanderi silk, master zari weaves, and designed for effortless quiet luxury.
            </p>
          </div>
        </div>

        {/* 2. Utility Row: Region/Socials on Left, Payment Icons on Right */}
        <div className="nilasa-footer__utility-row">
          <div className="nilasa-footer__left-utils">
            {/* Region / Language Dropdown */}
            <div className="nilasa-footer__lang">
              <button
                type="button"
                className="nilasa-footer__lang-btn"
                onClick={() => setLangOpen((p) => !p)}
                aria-label="Language selector"
              >
                <span>EN</span>
                <ChevronDown size={13} />
              </button>
            </div>

            {/* Social Icons */}
            <div className="nilasa-footer__socials">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="nilasa-social-icon"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X Twitter"
                className="nilasa-social-icon"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/nilasa.wear"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="nilasa-social-icon"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="nilasa-social-icon"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-3.66 19.31c-.05-.44-.09-1.12.02-1.6l.8-3.38s-.2-.41-.2-1.02c0-.96.56-1.68 1.25-1.68.59 0 .87.44.87.97 0 .59-.38 1.48-.57 2.3-.16.7.35 1.27 1.04 1.27 1.25 0 2.22-1.32 2.22-3.22 0-1.68-1.21-2.86-2.94-2.86-2.14 0-3.4 1.6-3.4 3.26 0 .65.25 1.34.56 1.72a.23.23 0 0 1 .05.22c-.06.26-.2.8-.23.91-.04.14-.13.17-.3.09-1.1-.51-1.78-2.12-1.78-3.41 0-2.77 2.01-5.32 5.8-5.32 3.05 0 5.41 2.17 5.41 5.07 0 3.03-1.91 5.46-4.56 5.46-.89 0-1.73-.46-2.02-1l-.55 2.1c-.2.77-.74 1.73-1.1 2.32A10 10 0 1 0 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Payment Method Badges */}
          <div className="nilasa-footer__payments" aria-label="Accepted payment methods">
            <span className="nilasa-payment-pill">VISA</span>
            <span className="nilasa-payment-pill">Mastercard</span>
            <span className="nilasa-payment-pill">AMEX</span>
            <span className="nilasa-payment-pill">UPI</span>
            <span className="nilasa-payment-pill">GPay</span>
            <span className="nilasa-payment-pill">RuPay</span>
          </div>
        </div>
      </div>

      {/* 3. Giant Nilasa Bottom Brand Wordmark */}
      <div className="nilasa-footer__wordmark-wrap" aria-hidden="true">
        <span className="nilasa-footer__wordmark">
          NILASA
        </span>
      </div>
    </footer>
  );
}
