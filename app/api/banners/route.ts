import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { BannersConfig } from "@/lib/types";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "banners.json");

const DEFAULT_BANNERS: BannersConfig = {
  updatedAt: new Date().toISOString(),
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
    imageUrl: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=85",
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
    imageUrl: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85"
  }
};

function ensureDataFile(): BannersConfig {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE_PATH)) {
      const content = fs.readFileSync(DATA_FILE_PATH, "utf8");
      const parsed = JSON.parse(content);
      if (parsed && parsed.announcementBar && parsed.heroBanner) {
        return parsed;
      }
    }
    // Write default seed file if not present
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(DEFAULT_BANNERS, null, 2), "utf8");
    return DEFAULT_BANNERS;
  } catch (err) {
    console.error("Error reading banners file, falling back to default:", err);
    return DEFAULT_BANNERS;
  }
}

// GET /api/banners - Load current banners & offers configuration
export async function GET() {
  const config = ensureDataFile();
  return NextResponse.json({ success: true, data: config });
}

// POST /api/banners - Save banners & offers updates
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = ensureDataFile();

    const updatedConfig: BannersConfig = {
      updatedAt: new Date().toISOString(),
      announcementBar: body.announcementBar
        ? {
            isActive: body.announcementBar.isActive !== false,
            messages: Array.isArray(body.announcementBar.messages)
              ? body.announcementBar.messages.filter((m: string) => m.trim().length > 0)
              : current.announcementBar.messages,
            couponCode: body.announcementBar.couponCode ? String(body.announcementBar.couponCode).trim() : undefined,
            couponDiscount: body.announcementBar.couponDiscount ? String(body.announcementBar.couponDiscount).trim() : undefined,
            link: body.announcementBar.link ? String(body.announcementBar.link).trim() : "/shop"
          }
        : current.announcementBar,
      heroBanner: body.heroBanner
        ? {
            isActive: body.heroBanner.isActive !== false,
            eyebrow: String(body.heroBanner.eyebrow || "FESTIVE EDIT").trim(),
            tagPill: String(body.heroBanner.tagPill || "").trim(),
            headline: String(body.heroBanner.headline || "Grace In Every Thread").trim(),
            description: String(body.heroBanner.description || "").trim(),
            primaryCta: body.heroBanner.primaryCta || { label: "Explore Collection →", href: "/shop" },
            secondaryCta: body.heroBanner.secondaryCta || { label: "View Suit Sets", href: "/category/suits" },
            imageUrl: String(body.heroBanner.imageUrl || current.heroBanner.imageUrl).trim(),
            featuredPiece: body.heroBanner.featuredPiece
          }
        : current.heroBanner,
      promotionalOfferBanner: body.promotionalOfferBanner
        ? {
            isActive: body.promotionalOfferBanner.isActive !== false,
            badge: String(body.promotionalOfferBanner.badge || "SPECIAL OFFER").trim(),
            title: String(body.promotionalOfferBanner.title || "").trim(),
            description: String(body.promotionalOfferBanner.description || "").trim(),
            code: String(body.promotionalOfferBanner.code || "NILASA10").trim(),
            ctaLabel: String(body.promotionalOfferBanner.ctaLabel || "Claim Offer →").trim(),
            ctaHref: String(body.promotionalOfferBanner.ctaHref || "/shop").trim(),
            imageUrl: String(body.promotionalOfferBanner.imageUrl || current.promotionalOfferBanner.imageUrl).trim()
          }
        : current.promotionalOfferBanner
    };

    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(updatedConfig, null, 2), "utf8");

    return NextResponse.json({ success: true, data: updatedConfig });
  } catch (err: any) {
    console.error("Failed to save banners config:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to save banners config." },
      { status: 500 }
    );
  }
}
