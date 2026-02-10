/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mtynrvnfrreyntbofatm.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    minimumCacheTTL: 3153600000,
  },
};

export default nextConfig;
