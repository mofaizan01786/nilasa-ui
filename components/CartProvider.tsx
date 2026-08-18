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

const key = (item: Pick<CartItem, "productId" | "size">) => `${item.productId}-${item.size}`;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("nilasa-cart");
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // localStorage read error
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("nilasa-cart", JSON.stringify(items));
    } catch {
      // localStorage write error
    }
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((n, item) => n + item.quantity, 0),
      total: items.reduce((n, item) => n + item.basePrice * item.quantity, 0),
      add: (newItem: CartItem) =>
        setItems((current) => {
          const exists = current.find((item) => key(item) === key(newItem));
          return exists
            ? current.map((item) =>
                key(item) === key(newItem)
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              )
            : [...current, newItem];
        }),
      update: (itemKey: string, quantity: number) =>
        setItems((current) =>
          current.flatMap((item) =>
            key(item) === itemKey ? (quantity > 0 ? [{ ...item, quantity }] : []) : [item]
          )
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
