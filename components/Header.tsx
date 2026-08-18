"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { useAuth } from "@/components/AuthProvider";
import { NilasaSearchDrawer } from "@/components/NilasaSearchDrawer";
import { fetchNavigationConfig, fetchBannersConfig } from "@/lib/api";
import { NavigationMenuItem, AnnouncementBarConfig } from "@/lib/types";
import {
  Menu,
  X,
  ShoppingBag,
  Heart,
  User as UserIcon,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Search
} from "lucide-react";

export function Header() {
  const { items } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<NavigationMenuItem[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const isHomePage = pathname === "/";

  const [announcement, setAnnouncement] = useState<AnnouncementBarConfig>({
    isActive: true,
    messages: [
      "Free returns within 30 days",
      "Complimentary Shipping Across India",
      "Free returns within 30 days",
      "Use Code NILASA10 for 10% Off"
    ],
    couponCode: "NILASA10",
    couponDiscount: "10% OFF"
  });

  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const firstName = user?.name ? user.name.split(" ")[0] : "Account";

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch navigation & banners config
  useEffect(() => {
    let isMounted = true;
    fetchNavigationConfig()
      .then((cfg) => {
        if (isMounted && cfg && Array.isArray(cfg.items) && cfg.items.length > 0) {
          const active = cfg.items
            .filter((item) => item.isActive)
            .sort((a, b) => a.order - b.order);
          setMenuItems(active);
        }
      })
      .catch(() => {});

    fetchBannersConfig()
      .then((bcfg) => {
        if (isMounted && bcfg && bcfg.announcementBar) {
          setAnnouncement(bcfg.announcementBar);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-close on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setSearchOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMouseEnter = (id: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const defaultNavItems = [
    {
      id: "clothing",
      label: "Clothing",
      href: "/shop",
      subLinks: [
        { id: "suits", label: "Suits & Anarkalis", href: "/category/suits" },
        { id: "kurtis", label: "Kurtis & Tunics", href: "/category/kurtis" },
        { id: "coords", label: "Co-Ord Sets", href: "/category/co-ord-sets" },
        { id: "dupattas", label: "Pure Silk Dupattas", href: "/category/dupattas" },
        { id: "unstitched", label: "Unstitched Suits", href: "/category/unstitched-suits" },
        { id: "lehengas", label: "Festive Lehengas", href: "/category/lehengas" }
      ]
    },
    { id: "suits", label: "Suits", href: "/category/suits" },
    { id: "kurtis", label: "Kurtis", href: "/category/kurtis" },
    { id: "coords", label: "Co-Ords", href: "/category/co-ord-sets" },
    { id: "bestsellers", label: "Bestsellers", href: "/shop" },
    { id: "sale", label: "Sale", href: "/shop" }
  ];

  const activeMenu = menuItems.length > 0 ? menuItems : defaultNavItems;

  return (
    <>
      {/* 1. Top Repeating Announcement Ticker Strip */}
      {announcement.isActive && (
        <div className="nilasa-top-announcement" aria-label="Store announcement">
          <div className="nilasa-top-announcement__track">
            {[...Array(12)].map((_, i) => (
              <span key={i} className="nilasa-announcement-item">
                Free returns within 30 days
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 2. Nilasa Navigation Header */}
      <header
        className={`nilasa-header ${isHomePage ? "nilasa-header--home" : "nilasa-header--solid"} ${
          isScrolled ? "nilasa-header--scrolled" : ""
        }`}
      >
        <div className="nilasa-header__inner shell">
          {/* Mobile Left: [Hamburger Menu] + [Search Icon] (Exact Screenshot Match) */}
          <div className="nilasa-header__mobile-left">
            <button
              type="button"
              className="nilasa-icon-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              className="nilasa-icon-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search collections"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Desktop Left: Category Navigation Links */}
          <nav className="nilasa-nav" onMouseLeave={handleMouseLeave}>
            {activeMenu.map((item) => {
              const hasDropdown = item.subLinks && item.subLinks.length > 0;
              const isOpen = activeDropdown === item.id;

              return (
                <div
                  key={item.id}
                  className="nilasa-nav__item-wrap"
                  onMouseEnter={() => (hasDropdown ? handleMouseEnter(item.id) : undefined)}
                >
                  <Link
                    href={item.href}
                    className={`nilasa-nav__link ${isOpen ? "active" : ""}`}
                  >
                    <span>{item.label}</span>
                    {hasDropdown && (
                      <ChevronDown
                        size={13}
                        className={`nilasa-nav__chevron ${isOpen ? "rotated" : ""}`}
                      />
                    )}
                  </Link>

                  {/* Mega Dropdown Menu */}
                  {hasDropdown && isOpen && (
                    <div
                      className="nilasa-dropdown-menu"
                      onMouseEnter={() => handleMouseEnter(item.id)}
                    >
                      <div className="nilasa-dropdown-inner">
                        <div className="nilasa-dropdown-col">
                          <span className="nilasa-dropdown-heading">COLLECTIONS</span>
                          <div className="nilasa-dropdown-links">
                            {item.subLinks?.map((sub) => (
                              <Link
                                key={sub.id}
                                href={sub.href}
                                className="nilasa-dropdown-link"
                              >
                                <span>{sub.label}</span>
                                <ChevronRight size={13} className="arrow" />
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div className="nilasa-dropdown-card">
                          <span className="card-badge">ARTISANAL</span>
                          <h4 className="card-title">Festive Edit 2026</h4>
                          <p className="card-desc">Handcrafted Chanderi Silk & Zari silhouettes.</p>
                          <Link href="/shop" className="card-cta">
                            <span>Explore Edit</span>
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Center Brand Identity */}
          <div className="nilasa-header__brand-center">
            <Link
              href="/"
              className={`nilasa-brand-wordmark ${
                isHomePage
                  ? isScrolled
                    ? "is-docked-state"
                    : "is-hero-state"
                  : "is-subpage-state"
              }`}
              aria-label="Nilasa Home"
            >
              NILASA
            </Link>
          </div>

          {/* Right Header Actions: Desktop has Currency/Search/Wishlist/User/Cart; Mobile has [User] + [ShoppingBag] */}
          <div className="nilasa-header__actions">
            {/* Currency Selector (Desktop Only) */}
            <div className="nilasa-currency-wrap hide-mobile">
              <button
                type="button"
                className="nilasa-currency-btn"
                onClick={() => setCurrencyOpen((p) => !p)}
                aria-label="Currency"
              >
                <span>INR ₹</span>
                <ChevronDown size={12} />
              </button>
            </div>

            {/* Search Icon Trigger (Desktop Only) */}
            <button
              type="button"
              className="nilasa-icon-btn hide-mobile"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              title="Search"
            >
              <Search size={19} strokeWidth={1.5} />
            </button>

            {/* Wishlist Icon (Desktop Only) */}
            <Link
              href="/wishlist"
              className="nilasa-icon-btn nilasa-wishlist-btn hide-mobile"
              aria-label={`Wishlist (${wishlistCount} items)`}
              title="Wishlist"
            >
              <Heart size={19} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="nilasa-badge-count">{wishlistCount}</span>
              )}
            </Link>

            {/* User Account Icon (Both Desktop & Mobile) */}
            <Link
              href={isAuthenticated ? "/account" : "/login"}
              className="nilasa-icon-btn"
              aria-label={isAuthenticated ? `Account (${firstName})` : "Sign In"}
              title={isAuthenticated ? `Account (${firstName})` : "Sign In"}
            >
              <UserIcon size={20} strokeWidth={1.5} />
            </Link>

            {/* Shopping Bag Icon (Both Desktop & Mobile) */}
            <Link
              href="/cart"
              className="nilasa-icon-btn nilasa-cart-btn"
              aria-label={`Shopping Bag (${cartCount} items)`}
              title="Shopping Bag"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="nilasa-badge-count">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Nilasa Predictive Search Drawer Overlay */}
      <NilasaSearchDrawer isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* 3. Mobile Navigation Backdrop */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 4. Luxury Mobile Navigation Drawer */}
      <aside className={`nilasa-mobile-drawer ${mobileMenuOpen ? "open" : ""}`} aria-label="Mobile Navigation">
        <div className="nilasa-drawer__header">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="nilasa-drawer__brand">
            NILASA
          </Link>
          <button
            type="button"
            className="nilasa-drawer__close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="nilasa-drawer__nav">
          {activeMenu.map((item) => {
            const hasSub = item.subLinks && item.subLinks.length > 0;
            const isExpanded = expandedMobileCategory === item.id;

            return (
              <div key={item.id} className="nilasa-drawer__item">
                {hasSub ? (
                  <>
                    <button
                      type="button"
                      className="nilasa-drawer__link"
                      onClick={() =>
                        setExpandedMobileCategory((prev) => (prev === item.id ? null : item.id))
                      }
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        size={16}
                        className={`nilasa-drawer__chevron ${isExpanded ? "rotated" : ""}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="nilasa-drawer__sublinks">
                        {item.subLinks?.map((sub) => (
                          <Link
                            key={sub.id}
                            href={sub.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="nilasa-drawer__sublink"
                          >
                            <span>{sub.label}</span>
                            <ChevronRight size={14} color="#94A3B8" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="nilasa-drawer__link"
                  >
                    <span>{item.label}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        <div className="nilasa-drawer__footer">
          <Link
            href={isAuthenticated ? "/account" : "/login"}
            onClick={() => setMobileMenuOpen(false)}
            className="nilasa-drawer__util-link"
          >
            <UserIcon size={18} />
            <span>{isAuthenticated ? `My Account (${firstName})` : "Sign In / Register"}</span>
          </Link>
          <Link
            href="/wishlist"
            onClick={() => setMobileMenuOpen(false)}
            className="nilasa-drawer__util-link"
          >
            <Heart size={18} />
            <span>Wishlist ({wishlistCount})</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
