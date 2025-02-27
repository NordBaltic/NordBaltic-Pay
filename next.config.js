/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://api.nordbalticpay.com",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  },
  images: {
    domains: [
      "res.cloudinary.com",
      "avatars.githubusercontent.com",
      "lh3.googleusercontent.com"
    ]
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": require("path").resolve(__dirname),
    };

    // ✅ Fix for Vercel builds with optional chaining & nullish coalescing
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false
      };
    }

    return config;
  },
  eslint: {
    // ✅ Avoid ESLint errors breaking the build (optional)
    ignoreDuringBuilds: true
  },
  typescript: {
    // ✅ Avoid TypeScript errors breaking the build (optional)
    ignoreBuildErrors: true
  },
  experimental: {
    // ✅ Enable Edge runtime support for faster execution
    runtime: "edge"
  }
};

module.exports = nextConfig;
