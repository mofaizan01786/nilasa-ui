"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import { CookieConsent } from "@/components/CookieConsent";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    // Admin routes use dedicated Admin Layout without Storefront Header/Footer/CookieConsent
    return <AuthProvider>{children}</AuthProvider>;
  }

  // Public Storefront Layout with Header, Footer, AuthProvider, and Cookie Consent Banner
  return (
    <AuthProvider>
      <Header />
      {children}
      <Footer />
      <CookieConsent />
    </AuthProvider>
  );
}
