/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/auth"],
  output: "standalone",
};

export default nextConfig;
