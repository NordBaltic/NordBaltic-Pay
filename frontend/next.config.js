/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['your-supabase-bucket-url', 'walletconnect.com', 'trustwallet.com'],
  },
  env: {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    INFURA_PROJECT_ID: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
    ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    ADMIN_WALLET: process.env.NEXT_PUBLIC_ADMIN_WALLET,
    MARINADE_STAKING_CONTRACT: process.env.NEXT_PUBLIC_MARINADE_STAKING_CONTRACT,
    DONATION_WALLET_1: process.env.NEXT_PUBLIC_DONATION_WALLET_1,
    DONATION_WALLET_2: process.env.NEXT_PUBLIC_DONATION_WALLET_2,
    DONATION_WALLET_3: process.env.NEXT_PUBLIC_DONATION_WALLET_3
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/admin',
        permanent: false,
      },
    ];
  }
};

module.exports = nextConfig;
