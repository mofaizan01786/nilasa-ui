"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import {
  Home,
  LayoutGrid,
  Sparkles,
  Heart,
  User as UserIcon,
  ShoppingBag
} from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { items } = useCart();
  const { isAuthenticated } = useAuth();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const isHome = pathname === "/";
  const isShop = pathname === "/shop" || pathname.startsWith("/product") || pathname.startsWith("/category");
  const isCategories = pathname === "/category/suits" || pathname.startsWith("/category");
  const isWishlist = pathname === "/wishlist" || pathname === "/account?tab=wishlist";
  const isAccount = pathname === "/account" || pathname === "/login" || pathname === "/register";

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Mobile Navigation"
    >
      <div className="mobile-bottom-nav-inner">
        {/* 1. Home */}
        <Link
          href="/"
          className={`mobile-bottom-nav-item ${isHome ? "active" : ""}`}
        >
          <Home size={20} strokeWidth={isHome ? 2.4 : 1.8} />
          <span>Home</span>
        </Link>

        {/* 2. Shop */}
        <Link
          href="/shop"
          className={`mobile-bottom-nav-item ${isShop && !isCategories ? "active" : ""}`}
        >
          <LayoutGrid size={20} strokeWidth={isShop && !isCategories ? 2.4 : 1.8} />
          <span>Shop</span>
        </Link>

        {/* 3. Categories */}
        <Link
          href="/category/suits"
          className={`mobile-bottom-nav-item ${isCategories ? "active" : ""}`}
        >
          <Sparkles size={20} strokeWidth={isCategories ? 2.4 : 1.8} />
          <span>Categories</span>
        </Link>

        {/* 4. Wishlist */}
        <Link
          href="/account"
          className={`mobile-bottom-nav-item ${isWishlist ? "active" : ""}`}
        >
          <Heart size={20} strokeWidth={isWishlist ? 2.4 : 1.8} />
          <span>Wishlist</span>
        </Link>

        {/* 5. Account */}
        <Link
          href={isAuthenticated ? "/account" : "/login"}
          className={`mobile-bottom-nav-item ${isAccount ? "active" : ""}`}
        >
          <UserIcon size={20} strokeWidth={isAccount ? 2.4 : 1.8} />
          <span>Account</span>
        </Link>
      </div>
    </nav>
  );
}
