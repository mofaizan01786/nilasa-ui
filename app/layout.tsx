import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { LayoutWrapper } from "@/components/LayoutWrapper";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap"
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
    icon: "/nilasa-logo.PNG",
    apple: "/nilasa-logo.PNG"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <CartProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
