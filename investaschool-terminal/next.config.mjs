/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // @react-pdf/renderer ships ESM that must be transpiled for server bundles
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
