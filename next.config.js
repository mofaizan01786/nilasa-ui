/** @type {import('next').NextConfig} */
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
