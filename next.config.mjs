/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    // Existing SVG configuration
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });

    return config;
  },
  images: {
    disableStaticImages: false,
    remotePatterns: [
      // your existing patterns...
    ],
  },
};

export default nextConfig;
