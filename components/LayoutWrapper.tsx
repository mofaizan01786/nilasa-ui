"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import { CookieConsent } from "@/components/CookieConsent";
import { NilasaGuaranteesBanner } from "@/components/NilasaGuaranteesBanner";
import { NilasaNewsletter } from "@/components/NilasaNewsletter";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isCheckoutRoute = pathname?.startsWith("/checkout") || pathname?.startsWith("/order-confirmation");

  if (isAdminRoute) {
    // Admin routes use dedicated Admin Layout without Storefront Header/Footer/CookieConsent
    return <AuthProvider>{children}</AuthProvider>;
  }

  // Public Storefront Layout with Header, Global Guarantees & Newsletter, Footer, AuthProvider, and Cookie Consent Banner
  return (
    <AuthProvider>
      <Header />
      <div className="nilasa-page-sliding-container">
        {children}
        {!isCheckoutRoute && (
          <div className="nilasa-mandatory-bottom-wrap">
            {/* Mandatory Section 1: Features & Guarantees Strip */}
            <NilasaGuaranteesBanner />

            {/* Mandatory Section 2: The Nilasa Privé Newsletter Section */}
            <NilasaNewsletter />
          </div>
        )}
      </div>
      <Footer />
      <CookieConsent />
    </AuthProvider>
  );
}
