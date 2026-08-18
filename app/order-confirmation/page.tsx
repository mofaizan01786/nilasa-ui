import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmationClient } from "./ConfirmationClient";
import { SITE_URL } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Order Confirmed | Nilasa",
  description: "Thank you for choosing Nilasa. Your order details and receipt.",
  alternates: { canonical: `${SITE_URL}/order-confirmation` }
};

export default function OrderConfirmationPage() {
  return (
    <main className="shell confirmation-page-container">
      <Suspense
        fallback={
          <div className="no-products-state">
            <span className="no-products-icon">✨</span>
            <h2>Generating Order Receipt...</h2>
          </div>
        }
      >
        <ConfirmationClient />
      </Suspense>
    </main>
  );
}
