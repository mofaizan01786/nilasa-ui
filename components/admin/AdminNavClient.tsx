"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Tag,
  Users,
  Compass,
  Sparkles
} from "lucide-react";

export function AdminNavClient() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: FolderTree },
    { href: "/admin/navigation", label: "Navigation", icon: Compass },
    { href: "/admin/banners", label: "Banners & Offers", icon: Sparkles },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/coupons", label: "Coupons", icon: Tag },
    { href: "/admin/users", label: "Staff & Users", icon: Users }
  ];

  return (
    <ul className="admin-sidebar-menu">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = link.exact ? pathname === link.href : pathname?.startsWith(link.href);
        return (
          <li key={link.href} className={`admin-menu-item ${isActive ? "active" : ""}`}>
            <Link href={link.href}>
              <Icon
                size={15}
                strokeWidth={isActive ? 2.2 : 1.75}
                color={isActive ? "#3B4C7A" : "#4B5468"}
                style={{ flexShrink: 0, transition: "color 0.12s ease" }}
              />
              <span>{link.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
