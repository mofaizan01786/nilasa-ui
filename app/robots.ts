import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nilasawear.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/*", "/admin", "/cart", "/checkout", "/order-confirmation", "/api/*"]
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
