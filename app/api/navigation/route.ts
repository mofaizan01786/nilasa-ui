import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { NavigationConfig, NavigationMenuItem } from "@/lib/types";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "navigation.json");

const DEFAULT_NAVIGATION: NavigationConfig = {
  updatedAt: new Date().toISOString(),
  items: [
    {
      id: "nav-collections",
      label: "COLLECTIONS",
      href: "/shop",
      isActive: true,
      order: 1,
      subLinks: [
        { id: "sub-1", label: "✨ View All Collections", href: "/shop" },
        { id: "sub-2", label: "Festive Edit 2026", href: "/shop?q=festive", badge: "NEW" },
        { id: "sub-3", label: "The Lavender Bloom", href: "/shop?q=lavender" },
        { id: "sub-4", label: "Royal Indigo Edit", href: "/shop?q=indigo" },
        { id: "sub-5", label: "Zari Silk Dupattas", href: "/category/dupattas" },
        { id: "sub-6", label: "Festive Lehengas", href: "/category/lehengas" }
      ],
      fabricLinks: [
        { id: "fab-1", label: "Pure Chanderi Silk", href: "/shop?fabric=chanderi" },
        { id: "fab-2", label: "Handloom Linen", href: "/shop?fabric=linen" },
        { id: "fab-3", label: "Mulmul & Organza", href: "/shop?fabric=organza" }
      ],
      promoCard: {
        badge: "NEW ARRIVAL",
        title: "Festive Silk Edit",
        description: "Handcrafted Chanderi suits woven with pure zari threads.",
        href: "/shop?q=festive"
      }
    },
    {
      id: "nav-suits",
      label: "SUITS",
      href: "/category/suits",
      isActive: true,
      order: 2,
      subLinks: [
        { id: "suit-1", label: "All Suits & Sets", href: "/category/suits" },
        { id: "suit-2", label: "Anarkali Suit Sets", href: "/category/suits?type=anarkali", badge: "HOT" },
        { id: "suit-3", label: "Straight Cut Suits", href: "/category/suits?type=straight" },
        { id: "suit-4", label: "A-Line Festive Suits", href: "/category/suits?type=aline" },
        { id: "suit-5", label: "Unstitched Suit Sets", href: "/category/unstitched-suits" }
      ],
      fabricLinks: [
        { id: "sfab-1", label: "Pure Chanderi Silk", href: "/category/suits?fabric=chanderi" },
        { id: "sfab-2", label: "Handloom Linen", href: "/category/suits?fabric=linen" },
        { id: "sfab-3", "label": "Zari & Brocade", href: "/category/suits?fabric=zari" }
      ],
      promoCard: {
        badge: "BESTSELLER",
        title: "Indigo Pleat Anarkali",
        description: "Pure Chanderi silk with artisan pleats and gold hand-block details.",
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
        { id: "kur-1", label: "All Kurtis & Tunics", href: "/category/kurtis" },
        { id: "kur-2", label: "Everyday Kurtas", href: "/category/kurtis?type=everyday" },
        { id: "kur-3", label: "Festive Silk Kurtis", href: "/category/kurtis?type=festive", badge: "POPULAR" },
        { id: "kur-4", label: "Long Flowing Tunics", href: "/category/kurtis?type=long" }
      ],
      fabricLinks: [
        { id: "kfab-1", label: "Chanderi Weaves", href: "/category/kurtis?fabric=chanderi" },
        { id: "kfab-2", label: "Linen & Cotton", href: "/category/kurtis?fabric=linen" },
        { id: "kfab-3", label: "Silk Blends", href: "/category/kurtis?fabric=silk" }
      ],
      promoCard: {
        badge: "SIGNATURE",
        title: "Everyday Luxury",
        description: "Breathable silhouettes designed for quiet elegance and poise.",
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
        { id: "co-1", label: "All Two-Piece Sets", href: "/category/co-ord-sets" },
        { id: "co-2", label: "Linen Co-Ord Sets", href: "/category/co-ord-sets?fabric=linen" },
        { id: "co-3", label: "Silk Festive Sets", href: "/category/co-ord-sets?fabric=silk" },
        { id: "co-4", label: "Printed Modern Sets", href: "/category/co-ord-sets?style=printed" }
      ],
      promoCard: {
        badge: "MODERN ETHNIC",
        title: "Fluid Co-Ord Sets",
        description: "Contemporary two-piece silhouettes with delicate artisan touches.",
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
        { id: "un-1", label: "All Dress Materials", href: "/category/unstitched-suits" },
        { id: "un-2", label: "Chanderi Silk Fabric", href: "/category/unstitched-suits?fabric=chanderi" },
        { id: "un-3", label: "Cotton Suit Materials", href: "/category/unstitched-suits?fabric=cotton" },
        { id: "un-4", label: "Zari Dupatta Sets", href: "/category/dupattas" }
      ],
      promoCard: {
        badge: "CUSTOM TAILORING",
        title: "Unstitched Material",
        description: "Custom cut fabrics crafted for your bespoke measurements.",
        href: "/category/unstitched-suits"
      }
    }
  ]
};

function ensureDataFile(): NavigationConfig {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE_PATH)) {
      const content = fs.readFileSync(DATA_FILE_PATH, "utf8");
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.items)) {
        return parsed;
      }
    }
    // Write default seed file if not present
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(DEFAULT_NAVIGATION, null, 2), "utf8");
    return DEFAULT_NAVIGATION;
  } catch (err) {
    console.error("Error reading navigation file, falling back to default:", err);
    return DEFAULT_NAVIGATION;
  }
}

// GET /api/navigation - Load current navigation configuration
export async function GET() {
  const config = ensureDataFile();
  return NextResponse.json({ success: true, data: config });
}

// POST /api/navigation - Save navigation configuration updates
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !Array.isArray(body.items)) {
      return NextResponse.json(
        { success: false, message: "Invalid payload: 'items' array is required." },
        { status: 400 }
      );
    }

    const items: NavigationMenuItem[] = body.items.map((item: any, idx: number) => ({
      id: String(item.id || `nav-${Date.now()}-${idx}`),
      label: String(item.label || "COLLECTION").trim().toUpperCase(),
      href: String(item.href || "/shop").trim(),
      isActive: item.isActive !== false,
      order: typeof item.order === "number" ? item.order : idx + 1,
      subLinks: Array.isArray(item.subLinks)
        ? item.subLinks.map((s: any, sIdx: number) => ({
            id: String(s.id || `sub-${Date.now()}-${sIdx}`),
            label: String(s.label || "").trim(),
            href: String(s.href || "/shop").trim(),
            badge: s.badge ? String(s.badge).trim().toUpperCase() : undefined
          }))
        : [],
      fabricLinks: Array.isArray(item.fabricLinks)
        ? item.fabricLinks.map((f: any, fIdx: number) => ({
            id: String(f.id || `fab-${Date.now()}-${fIdx}`),
            label: String(f.label || "").trim(),
            href: String(f.href || "/shop").trim()
          }))
        : undefined,
      promoCard: item.promoCard && item.promoCard.title
        ? {
            badge: item.promoCard.badge ? String(item.promoCard.badge).trim().toUpperCase() : undefined,
            title: String(item.promoCard.title).trim(),
            description: String(item.promoCard.description || "").trim(),
            href: String(item.promoCard.href || "/shop").trim(),
            imageUrl: item.promoCard.imageUrl ? String(item.promoCard.imageUrl).trim() : undefined
          }
        : undefined
    }));

    const newConfig: NavigationConfig = {
      updatedAt: new Date().toISOString(),
      items
    };

    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(newConfig, null, 2), "utf8");

    return NextResponse.json({ success: true, data: newConfig });
  } catch (err: any) {
    console.error("Failed to save navigation:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to save navigation config." },
      { status: 500 }
    );
  }
}
