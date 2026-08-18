/** @type {import('next').NextConfig} */
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "nilasabackend.geecera.com" },
      { protocol: "http", hostname: "nilasabackend.geecera.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "localhost" }
    ],
  },
};

module.exports = nextConfig;
