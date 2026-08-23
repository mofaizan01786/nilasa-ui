"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { useAuth } from "@/components/AuthProvider";
import { SearchBar } from "@/components/SearchBar";
import { fetchNavigationConfig, fetchBannersConfig } from "@/lib/dotnet-backend";
import { NavigationMenuItem, AnnouncementBarConfig } from "@/lib/types";
import { Menu, X, ShoppingBag, Heart, User as UserIcon, ChevronDown, ChevronRight, ArrowRight, Search } from "lucide-react";

export function Header() {
  const { items } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<NavigationMenuItem[]>([]);
  const [announcement, setAnnouncement] = useState<AnnouncementBarConfig>({
    isActive: true,
    messages: ["✨ NILASA FESTIVE EDIT 2026", "COMPLIMENTARY SHIPPING ACROSS INDIA"],
    couponCode: "NILASA10",
    couponDiscount: "10% OFF"
  });
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const firstName = user?.name ? user.name.split(" ")[0] : "Account";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch dynamic navigation & banner config
  useEffect(() => {
    let isMounted = true;
    fetchNavigationConfig()
      .then((cfg) => {
        if (isMounted && cfg && Array.isArray(cfg.items)) {
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

    const handleBannerUpdate = (e: any) => {
      if (e.detail && e.detail.announcementBar) {
        setAnnouncement(e.detail.announcementBar);
      }
    };
    window.addEventListener("nilasa-banners-updated", handleBannerUpdate);

    const handleNavUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail.items)) {
        const active = e.detail.items
          .filter((item: NavigationMenuItem) => item.isActive)
          .sort((a: NavigationMenuItem, b: NavigationMenuItem) => a.order - b.order);
        setMenuItems(active);
      }
    };
    window.addEventListener("nilasa-navigation-updated", handleNavUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("nilasa-banners-updated", handleBannerUpdate);
      window.removeEventListener("nilasa-navigation-updated", handleNavUpdate);
    };
  }, []);

  // Auto-close dropdown & mobile navigation menu whenever user navigates
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Close mobile navigation on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Dropdown hover helpers with buffer timeout
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

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent("open-nilasa-search"));
  };

  return (
    <>
      {/* Sticky Navbar Container (Locks to Viewport Top) */}
      <div className="sticky-navbar-container">
        {/* 1. Dynamic Top Announcement Bar */}
        {announcement.isActive && (
          <div className="top-announcement-bar">
            <div className="announcement-content">
              {announcement.messages && announcement.messages.length > 0 ? (
                announcement.messages.map((msg, idx) => (
                  <span key={idx} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span>{msg}</span>
                    {idx < announcement.messages.length - 1 && (
                      <span className="announcement-dot">•</span>
                    )}
                  </span>
                ))
              ) : (
                <span>COMPLIMENTARY SHIPPING ACROSS INDIA</span>
              )}
              {announcement.couponCode && (
                <>
                  <span className="announcement-dot">•</span>
                  <span>
                    USE CODE{" "}
                    <strong style={{ color: "#FFFFFF", fontWeight: 700 }}>
                      {announcement.couponCode}
                    </strong>{" "}
                    {announcement.couponDiscount && `FOR ${announcement.couponDiscount}`}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* 2. Main Minimalist Navbar */}
        <header className="site-header">
          <div className="header-inner">
            {/* ── LEFT ZONE ── */}
            <div className="header-left-zone">
              {/* Mobile Left Actions: Hamburger Menu + Search Button */}
              <div className="mobile-left-nav">
                <button
                  type="button"
                  className="mobile-nav-icon-btn mobile-menu-btn"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? (
                    <X size={22} strokeWidth={2} />
                  ) : (
                    <Menu size={22} strokeWidth={2} />
                  )}
                </button>

                <button
                  type="button"
                  className="mobile-nav-icon-btn mobile-search-btn"
                  onClick={handleOpenSearch}
                  aria-label="Open search dialog"
                >
                  <Search size={21} strokeWidth={1.9} />
                </button>
              </div>

              {/* Desktop Dynamic Navigation Links from Admin API */}
              <nav className="desktop-nav" onMouseLeave={handleMouseLeave}>
                {menuItems.map((group) => {
                  const hasDropdown =
                    (group.subLinks && group.subLinks.length > 0) ||
                    (group.fabricLinks && group.fabricLinks.length > 0) ||
                    !!group.promoCard;
                  const isOpen = activeDropdown === group.id;

                  return (
                    <div
                      key={group.id}
                      className="nav-dropdown-anchor"
                      onMouseEnter={() => (hasDropdown ? handleMouseEnter(group.id) : undefined)}
                    >
                      <Link
                        href={group.href}
                        className={`nav-link ${isOpen ? "nav-link--active" : ""}`}
                      >
                        <span>{group.label}</span>
                        {hasDropdown && (
                          <ChevronDown
                            size={12}
                            className={`nav-chevron ${isOpen ? "nav-chevron--rotated" : ""}`}
                          />
                        )}
                      </Link>

                      {/* Luxury Mega Dropdown Panel */}
                      {hasDropdown && isOpen && (
                        <div
                          className="nav-dropdown-menu"
                          onMouseEnter={() => handleMouseEnter(group.id)}
                        >
                          <div
                            className="nav-dropdown-inner"
                            style={{
                              gridTemplateColumns:
                                group.fabricLinks && group.fabricLinks.length > 0
                                  ? "1fr 1fr 220px"
                                  : "1.2fr 220px"
                            }}
                          >
                            {/* Col 1: Sub-category Links */}
                            {group.subLinks && group.subLinks.length > 0 && (
                              <div className="dropdown-col">
                                <span className="dropdown-col-heading">EXPLORE CATEGORIES</span>
                                <div className="dropdown-links-list">
                                  {group.subLinks.map((sub) => (
                                    <Link
                                      key={sub.id}
                                      href={sub.href}
                                      className="dropdown-link-item"
                                    >
                                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span>{sub.label}</span>
                                        {sub.badge && (
                                          <span className="dropdown-nav-badge">{sub.badge}</span>
                                        )}
                                      </div>
                                      <ChevronRight size={13} className="dropdown-item-arrow" />
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Col 2: Fabrics & Weaves (if configured) */}
                            {group.fabricLinks && group.fabricLinks.length > 0 && (
                              <div className="dropdown-col">
                                <span className="dropdown-col-heading">FABRICS & WEAVES</span>
                                <div className="dropdown-links-list">
                                  {group.fabricLinks.map((fab) => (
                                    <Link
                                      key={fab.id}
                                      href={fab.href}
                                      className="dropdown-link-item"
                                    >
                                      <span>{fab.label}</span>
                                      <ChevronRight size={13} className="dropdown-item-arrow" />
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Col 3: Visual Featured Highlight Card */}
                            {group.promoCard && (
                              <div className="dropdown-featured-card">
                                {group.promoCard.badge && (
                                  <span className="dropdown-featured-badge">
                                    {group.promoCard.badge}
                                  </span>
                                )}
                                <h4 className="dropdown-featured-title">
                                  {group.promoCard.title}
                                </h4>
                                <p className="dropdown-featured-desc">
                                  {group.promoCard.description}
                                </p>
                                <Link
                                  href={group.promoCard.href}
                                  className="dropdown-featured-cta"
                                >
                                  <span>Explore Collection</span>
                                  <ArrowRight size={13} />
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* ── CENTER ZONE: BRAND IDENTITY (ALWAYS VISIBLE & CENTERED) ── */}
            <div className="header-center-zone">
              <Link href="/" className="brand-minimal" aria-label="Nilasa - Grace In Every Thread">
                <div className="brand-logo-frame">
                  <span className="brand-wordmark">N I L A S A</span>
                </div>
              </Link>
            </div>

            {/* ── RIGHT ZONE: ACTIONS ── */}
            <div className="header-actions">
              {/* Desktop Search Bar (Hidden on Mobile) */}
              <div className="desktop-search-container">
                <SearchBar />
              </div>

              {/* Customer Account / Sign In */}
              {isAuthenticated ? (
                <Link
                  href="/account"
                  className="customer-account-btn"
                  aria-label={`My Account (${firstName})`}
                  title={`Logged in as ${firstName}`}
                >
                  <UserIcon size={20} strokeWidth={1.9} />
                  <span className="customer-btn-label">{firstName}</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="customer-signin-btn"
                  aria-label="Sign In"
                  title="Customer Sign In"
                >
                  <UserIcon size={20} strokeWidth={1.9} />
                  <span className="customer-btn-label">Sign In</span>
                </Link>
              )}

              {/* Wishlist Button with Counter Badge (Desktop Only) */}
              <Link href="/wishlist" className="wishlist-link desktop-only-link" aria-label={`Wishlist (${wishlistCount} items)`} title="My Wishlist">
                <Heart size={20} strokeWidth={1.9} />
                <span className="wishlist-link-text">Wishlist</span>
                {mounted && wishlistCount > 0 && <span className="wishlist-count">{wishlistCount}</span>}
              </Link>

              {/* Shopping Bag Button with Counter Badge */}
              <Link href="/cart" className="cart-link" aria-label={`Shopping Bag (${cartCount} items)`}>
                <ShoppingBag size={20} strokeWidth={1.9} />
                <span className="cart-link-text">Bag</span>
                {mounted && cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </Link>
            </div>
          </div>
        </header>
      </div>

      {/* 3. Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 4. Slideover Mobile Navigation Drawer with Dynamic Accordions */}
      <aside className={`mobile-nav-drawer ${mobileMenuOpen ? "open" : ""}`} aria-label="Mobile Navigation">
        <div className="mobile-drawer-header">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="brand-minimal">
            <span className="brand-wordmark" style={{ fontSize: "1.1rem", letterSpacing: "0.18em" }}>
              N I L A S A
            </span>
          </Link>
          <button
            type="button"
            className="mobile-drawer-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mobile-drawer-body">
          <div className="mobile-drawer-section-title">EXPLORE COLLECTIONS</div>

          <div className="mobile-accordion-list">
            {menuItems.map((group) => {
              const hasSub = group.subLinks && group.subLinks.length > 0;
              const isExpanded = expandedMobileCategory === group.id;

              return (
                <div key={group.id} className="mobile-accordion-item">
                  <div className="mobile-accordion-header">
                    <Link
                      href={group.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="mobile-accordion-main-link"
                    >
                      {group.label}
                    </Link>
                    {hasSub && (
                      <button
                        type="button"
                        className="mobile-accordion-toggle-btn"
                        onClick={() =>
                          setExpandedMobileCategory(isExpanded ? null : group.id)
                        }
                        aria-label={`Toggle ${group.label} submenu`}
                        aria-expanded={isExpanded}
                      >
                        <ChevronDown
                          size={16}
                          className={`mobile-chevron ${isExpanded ? "mobile-chevron--rotated" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  {hasSub && isExpanded && (
                    <div className="mobile-accordion-submenu">
                      {group.subLinks.map((sub) => (
                        <Link
                          key={sub.id}
                          href={sub.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="mobile-submenu-link"
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span>{sub.label}</span>
                            {sub.badge && (
                              <span className="dropdown-nav-badge" style={{ fontSize: "9px" }}>
                                {sub.badge}
                              </span>
                            )}
                          </div>
                          <ChevronRight size={13} opacity={0.4} />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mobile-drawer-section-title" style={{ marginTop: 24 }}>MY ACCOUNT</div>
          <div className="mobile-drawer-links">
            {isAuthenticated ? (
              <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="mobile-account-link">
                <UserIcon size={16} color="var(--nilasa-gold)" />
                <span>My Profile & Orders ({firstName})</span>
              </Link>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="mobile-account-link">
                <UserIcon size={16} />
                <span>Customer Sign In / Register</span>
              </Link>
            )}
            <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="mobile-account-link">
              <Heart size={16} />
              <span>Wishlist ({wishlistCount})</span>
            </Link>
            <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="mobile-account-link">
              <ShoppingBag size={16} />
              <span>Shopping Bag ({cartCount})</span>
            </Link>
          </div>
        </div>

        <div className="mobile-drawer-footer">
          <p className="mobile-drawer-contact">
            Kanpur, Uttar Pradesh • nilasawear@gmail.com
          </p>
          <p className="mobile-drawer-motto">
            Grace In Every Thread
          </p>
        </div>
      </aside>
    </>
  );
}
