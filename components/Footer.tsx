import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, Camera, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="footer" style={{ background: "#151D30", color: "#F7F3ED" }}>
      <div className="shell footer-grid">
        {/* Col 1: Brand Info */}
        <div className="footer-col">
          <Link href="/" style={{ display: "inline-block", marginBottom: 14 }}>
            <Image
              src="/nilasa-logo.PNG"
              alt="Nilasa - Grace In Every Thread"
              width={180}
              height={60}
              style={{
                height: "52px",
                width: "auto",
                objectFit: "contain",
                borderRadius: "4px"
              }}
            />
          </Link>
          <p className="footer-desc">
            Modern Indian ethnic wear crafted for timeless elegance. Deep royal indigoes, chanderi silks, unstitched suit sets, and hand-loomed dupattas.
          </p>
          <div className="footer-contact-info">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><MapPin size={14} color="var(--nilasa-gold)" /> Kanpur, Uttar Pradesh, India</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Phone size={14} color="var(--nilasa-gold)" /> +91 9336114583</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Mail size={14} color="var(--nilasa-gold)" /> nilasawear@gmail.com</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Camera size={14} color="var(--nilasa-gold)" /> @nilasa.wear • nilasawear.com</span>
          </div>
        </div>

        {/* Col 2: Collections */}
        <div className="footer-col">
          <h4 className="footer-heading">Collections</h4>
          <ul className="footer-links">
            <li><Link href="/shop">Shop All Collection</Link></li>
            <li><Link href="/category/suits">Suits & Anarkalis</Link></li>
            <li><Link href="/category/kurtis">Chanderi Kurtis</Link></li>
            <li><Link href="/category/co-ord-sets">Linen Co-Ord Sets</Link></li>
            <li><Link href="/category/unstitched-suits">Unstitched Dress Material</Link></li>
            <li><Link href="/category/dupattas">Zari Dupattas</Link></li>
          </ul>
        </div>

        {/* Col 3: Customer Care */}
        <div className="footer-col">
          <h4 className="footer-heading">Customer Care</h4>
          <ul className="footer-links">
            <li><Link href="/account">My Account & Orders</Link></li>
            <li><Link href="/cart">Shopping Bag</Link></li>
            <li><Link href="/checkout">Express Checkout</Link></li>
            <li><Link href="/shipping-returns">7-Day Return & Exchange</Link></li>
            <li><Link href="/shipping-returns">Complimentary Shipping</Link></li>
          </ul>
        </div>

        {/* Col 4: Newsletter */}
        <div className="footer-col">
          <h4 className="footer-heading">Nilasa Club</h4>
          <p className="footer-desc">
            Subscribe for private access to new collection drops and festive offers.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="newsletter-form">
            <input type="email" placeholder="Your email address" className="newsletter-input" required />
            <button type="submit" className="newsletter-btn">Join</button>
          </form>
        </div>
      </div>

      <div className="shell footer-bottom">
        <p>© {new Date().getFullYear()} NILASA WEAR. All Rights Reserved.</p>
        <div className="footer-bottom-links">
          <Link href="/terms-of-service">Terms of Service</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/shipping-returns">Shipping & Returns</Link>
        </div>
      </div>
    </footer>
  );
}
