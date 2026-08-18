import fs from "fs";
import path from "path";
import { BannersConfig, NavigationConfig } from "./types";

export const DEFAULT_BANNERS: BannersConfig = {
  updatedAt: "2026-08-18T00:00:00.000Z",
  announcementBar: {
    isActive: true,
    messages: [
      "✨ NILASA FESTIVE EDIT 2026",
      "COMPLIMENTARY SHIPPING ACROSS INDIA",
      "USE CODE NILASA10 FOR 10% OFF"
    ],
    couponCode: "NILASA10",
    couponDiscount: "10% OFF",
    link: "/shop"
  },
  heroBanner: {
    isActive: true,
    eyebrow: "FESTIVE EDIT 2026",
    tagPill: "✨ Signature Indigo & Rose",
    headline: "Grace In Every Thread",
    description: "Thoughtfully cut Indian ethnic wear designed for quiet confidence. Handcrafted Chanderi silks, zari woven suit sets, and versatile separates.",
    primaryCta: {
      label: "Explore Collection →",
      href: "/shop"
    },
    secondaryCta: {
      label: "View Suit Sets",
      href: "/category/suits"
    },
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2560&q=90",
    featuredPiece: {
      title: "SIGNATURE PIECE",
      subtitle: "Indigo Pleat Anarkali Suit • ₹6,490",
      href: "/product/indigo-pleat-anarkali-suit"
    }
  },
  promotionalOfferBanner: {
    isActive: true,
    badge: "LIMITED TIME OFFER",
    title: "Festive Elegance: Enjoy 10% Off Your First Order",
    description: "Experience our artisanal handloom silhouettes. Use code NILASA10 at checkout for complimentary luxury packaging and insured nationwide express delivery.",
    code: "NILASA10",
    ctaLabel: "Claim Offer →",
    ctaHref: "/shop",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=90"
  }
};

export const DEFAULT_NAVIGATION: NavigationConfig = {
  updatedAt: "2026-08-18T00:00:00.000Z",
  items: [
    {
      id: "nav-collections",
      label: "COLLECTIONS",
      href: "/shop",
      isActive: true,
      order: 1,
      subLinks: [
        { id: "col-all", label: "All Garments", href: "/shop", badge: "EXPLORE" },
        { id: "col-festive", label: "Festive Edit 2026", href: "/shop?collection=festive", badge: "NEW" },
        { id: "col-wedding", label: "Artisan Wedding Edit", href: "/shop?collection=wedding", badge: "HOT" }
      ],
      promoCard: {
        badge: "NEW ARRIVALS",
        title: "Festive Twilight Edit 2026",
        description: "Handcrafted zari weaves and lightweight silks tailored for evening celebrations.",
        href: "/shop"
      }
    },
    {
      id: "nav-suits",
      label: "SUITS",
      href: "/category/suits",
      isActive: true,
      order: 2,
      subLinks: [
        { id: "sub-suits-all", label: "All Suit Sets", href: "/category/suits" },
        { id: "sub-suits-anarkali", label: "Anarkali Sets", href: "/category/suits?type=anarkali", badge: "HOT" },
        { id: "sub-suits-straight", label: "Straight Cut Suits", href: "/category/suits?type=straight" },
        { id: "sub-suits-angrakha", label: "Angrakha Suits", href: "/category/suits?type=angrakha" },
        { id: "sub-suits-sharara", label: "Sharara & Gharara Sets", href: "/category/suits?type=sharara", badge: "POPULAR" }
      ],
      fabricLinks: [
        { id: "fab-chanderi", label: "Pure Chanderi Silk", href: "/category/suits?fabric=chanderi" },
        { id: "fab-organza", label: "Tissue & Organza Zari", href: "/category/suits?fabric=organza" },
        { id: "fab-cotton", label: "Mulmul Cotton Handloom", href: "/category/suits?fabric=cotton" }
      ],
      promoCard: {
        badge: "BESTSELLER",
        title: "Indigo Pleat Anarkali",
        description: "Pure Chanderi silk with artisan pleats & antique zari hem.",
        href: "/product/indigo-pleat-anarkali-suit"
      }
    },
    {
      id: "nav-kurtis",
      label: "KURTIS",
      href: "/category/kurtis",
      isActive: true,
      order: 3,
      subLinks: [
        { id: "sub-kurtis-all", label: "All Kurtis", href: "/category/kurtis" },
        { id: "sub-kurtis-chanderi", label: "Festive Chanderi Kurtis", href: "/category/kurtis?fabric=chanderi", badge: "NEW" },
        { id: "sub-kurtis-short", label: "Short Tunics & Tops", href: "/category/kurtis?type=short" },
        { id: "sub-kurtis-flared", label: "A-Line & Flared Kurtis", href: "/category/kurtis?type=flared" }
      ],
      promoCard: {
        badge: "DAILY LUXE",
        title: "Rose Handloom Kurti",
        description: "Breathable hand-woven linen accented with subtle golden resham.",
        href: "/category/kurtis"
      }
    },
    {
      id: "nav-coords",
      label: "CO-ORDS",
      href: "/category/co-ord-sets",
      isActive: true,
      order: 4,
      subLinks: [
        { id: "sub-coords-all", label: "All Co-Ord Sets", href: "/category/co-ord-sets" },
        { id: "sub-coords-linen", label: "Linen Lounge Sets", href: "/category/co-ord-sets?fabric=linen", badge: "HOT" },
        { id: "sub-coords-silk", label: "Silk Party Co-Ords", href: "/category/co-ord-sets?fabric=silk" }
      ],
      promoCard: {
        badge: "TRENDING",
        title: "Modern Ethnic Sets",
        description: "Effortless 2-piece coordinates with contemporary Indian cuts.",
        href: "/category/co-ord-sets"
      }
    },
    {
      id: "nav-unstitched",
      label: "UNSTITCHED",
      href: "/category/unstitched-suits",
      isActive: true,
      order: 5,
      subLinks: [
        { id: "sub-unstitched-all", label: "All Unstitched Sets", href: "/category/unstitched-suits" },
        { id: "sub-unstitched-silk", label: "Pure Silk Dress Materials", href: "/category/unstitched-suits?fabric=silk", badge: "PREMIUM" },
        { id: "sub-unstitched-cotton", label: "Handblock Cotton Sets", href: "/category/unstitched-suits?fabric=cotton" }
      ],
      promoCard: {
        badge: "ARTISANAL",
        title: "Custom Tailoring Cuts",
        description: "Unstitched 3-piece fabrics with woven zari dupattas.",
        href: "/category/unstitched-suits"
      }
    }
  ]
};

// ─── Server-side Safe File Readers ──────────────────────

export function getBannersDirect(): BannersConfig {
  try {
    const filePath = path.join(process.cwd(), "data", "banners.json");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(content);
      if (parsed && parsed.announcementBar && parsed.heroBanner) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading data/banners.json directly on server:", err);
  }
  return DEFAULT_BANNERS;
}

export function getNavigationDirect(): NavigationConfig {
  try {
    const filePath = path.join(process.cwd(), "data", "navigation.json");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading data/navigation.json directly on server:", err);
  }
  return DEFAULT_NAVIGATION;
}
