"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { WishlistItem } from "@/lib/types";

export type { WishlistItem };

type WishlistContextValue = {
  items: WishlistItem[];
  count: number;
  isWishlisted: (productId: number) => boolean;
  add: (item: WishlistItem) => void;
  remove: (productId: number) => void;
  toggle: (item: WishlistItem) => boolean;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("nilasa-wishlist");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // localStorage read error fallback
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem("nilasa-wishlist", JSON.stringify(items));
    } catch {
      // localStorage write error fallback
    }
  }, [items, mounted]);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      isWishlisted: (productId: number) => items.some((item) => item.productId === productId),
      add: (newItem: WishlistItem) =>
        setItems((current) => {
          if (current.some((item) => item.productId === newItem.productId)) return current;
          return [newItem, ...current];
        }),
      remove: (productId: number) =>
        setItems((current) => current.filter((item) => item.productId !== productId)),
      toggle: (targetItem: WishlistItem) => {
        let added = false;
        setItems((current) => {
          const exists = current.some((item) => item.productId === targetItem.productId);
          if (exists) {
            added = false;
            return current.filter((item) => item.productId !== targetItem.productId);
          } else {
            added = true;
            return [targetItem, ...current];
          }
        });
        return added;
      },
      clear: () => setItems([])
    }),
    [items]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
