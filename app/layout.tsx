import type { Metadata, Viewport } from "next";
import { Playfair_Display, Open_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { GoogleOAuthWrapper } from "@/components/GoogleOAuthWrapper";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: true
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
  preload: true
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: true
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#151D30"
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://nilasa.geecera.com"),
  title: { default: "Nilasa | Grace In Every Thread", template: "%s | Nilasa" },
  description: "Handcrafted Indian ethnic womenswear, suits, kurtis, co-ord sets, and zari dupattas.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nilasa"
  },
  icons: {
    icon: "/nilasa-black-logo.PNG",
    apple: "/nilasa-black-logo.PNG"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const googleClientId = (
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID ||
    ""
  ).trim();

  return (
    <html lang="en" className={`${playfairDisplay.variable} ${openSans.variable} ${jetbrainsMono.variable}`}>
      <body>
        <GoogleOAuthWrapper clientId={googleClientId}>
          <WishlistProvider>
            <CartProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </CartProvider>
          </WishlistProvider>
        </GoogleOAuthWrapper>
      </body>
    </html>
  );
}
