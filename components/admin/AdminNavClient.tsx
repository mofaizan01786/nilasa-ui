"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Hammer,
  BarChart3,
  Tag,
  Puzzle,
  HelpCircle,
  Settings,
  Sparkles,
  Compass,
  FolderTree
} from "lucide-react";

interface AdminNavClientProps {
  onItemClick?: () => void;
}

export function AdminNavClient({ onItemClick }: AdminNavClientProps) {
  const pathname = usePathname();

  const primaryLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/orders", label: "Orders & Shipments", icon: ShoppingBag },
    { href: "/admin/products", label: "Products & Collections", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/users", label: "Patrons & VIPs", icon: Users },
    { href: "/admin/banners", label: "Artisan & Banners", icon: Sparkles },
    { href: "/admin/navigation", label: "Reports & Nav", icon: BarChart3 },
    { href: "/admin/coupons", label: "Discounts & Offers", icon: Tag }
  ];

  const secondaryLinks = [
    { href: "/admin/integrations", label: "Integrations", icon: Puzzle },
    { href: "/admin/help", label: "Help Center", icon: HelpCircle },
    { href: "/admin/settings", label: "Settings", icon: Settings }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <ul className="admin-sidebar-menu">
        {primaryLinks.map((link) => {
          const Icon = link.icon;
          const isActive = link.exact ? pathname === link.href : pathname?.startsWith(link.href);
          return (
            <li key={link.href} className={`admin-menu-item ${isActive ? "active" : ""}`}>
              <Link href={link.href} onClick={onItemClick}>
                <Icon
                  size={17}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  style={{ flexShrink: 0 }}
                />
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="admin-menu-section-divider">WORKSPACE</div>

      <ul className="admin-sidebar-menu" style={{ paddingTop: 4 }}>
        {secondaryLinks.map((link, idx) => {
          const Icon = link.icon;
          const isActive = pathname === link.href && link.label === "Settings";
          return (
            <li key={`${link.href}-${idx}`} className={`admin-menu-item ${isActive ? "active" : ""}`}>
              <Link href={link.href} onClick={onItemClick}>
                <Icon
                  size={17}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  style={{ flexShrink: 0 }}
                />
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
