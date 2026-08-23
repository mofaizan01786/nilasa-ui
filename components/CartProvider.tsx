"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/types";

export type { CartItem };

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: CartItem) => void;
  update: (key: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const normalizeSize = (size?: string) => {
  if (!size || size.trim() === "" || size.toUpperCase() === "FREE SIZE" || size.toUpperCase() === "DEFAULT" || size.toUpperCase() === "ONESIZE") {
    return "FREE SIZE";
  }
  return size.trim().toUpperCase();
};

const isSameProduct = (a: CartItem, b: CartItem) => {
  if (a.productId !== b.productId) return false;
  // If variantId is explicitly provided on both, match by variant
  if (a.variantId && b.variantId && a.variantId === b.variantId) return true;
  // Compare normalized sizes
  const sizeA = normalizeSize(a.size);
  const sizeB = normalizeSize(b.size);
  // Match if sizes match or if either is general FREE SIZE (added from Wishlist / Quick Add)
  return sizeA === sizeB || sizeA === "FREE SIZE" || sizeB === "FREE SIZE";
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("nilasa-cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // De-duplicate existing items on load if any duplicates exist
          const merged: CartItem[] = [];
          for (const itm of parsed) {
            const idx = merged.findIndex((m) => isSameProduct(m, itm));
            if (idx !== -1) {
              merged[idx] = {
                ...merged[idx],
                size: normalizeSize(merged[idx].size) === "FREE SIZE" && normalizeSize(itm.size) !== "FREE SIZE" ? itm.size : merged[idx].size,
                quantity: merged[idx].quantity + itm.quantity
              };
            } else {
              merged.push({ ...itm, size: itm.size || "FREE SIZE" });
            }
          }
          setItems(merged);
        }
      }
    } catch {
      // localStorage read error fallback
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("nilasa-cart", JSON.stringify(items));
    } catch {
      // localStorage write error fallback
    }
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((n, item) => n + item.quantity, 0),
      total: items.reduce((n, item) => n + item.basePrice * item.quantity, 0),
      add: (newItem: CartItem) =>
        setItems((current) => {
          const existingIndex = current.findIndex((item) => isSameProduct(item, newItem));
          if (existingIndex !== -1) {
            const updated = [...current];
            const existing = updated[existingIndex];
            updated[existingIndex] = {
              ...existing,
              // If incoming has a specific size (e.g. "M") and existing was "FREE SIZE", preserve the specific size
              size: normalizeSize(existing.size) === "FREE SIZE" && normalizeSize(newItem.size) !== "FREE SIZE" ? newItem.size : existing.size,
              quantity: existing.quantity + newItem.quantity
            };
            return updated;
          }
          return [...current, { ...newItem, size: newItem.size || "FREE SIZE" }];
        }),
      update: (itemKey: string, quantity: number) =>
        setItems((current) =>
          current.flatMap((item) => {
            const match =
              `${item.productId}-${item.size}` === itemKey ||
              `${item.productId}-${normalizeSize(item.size)}` === itemKey ||
              `${item.productId}` === itemKey;
            return match ? (quantity > 0 ? [{ ...item, quantity }] : []) : [item];
          })
        ),
      clear: () => setItems([])
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
