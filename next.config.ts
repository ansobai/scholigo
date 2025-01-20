import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    experimental: {
        ppr: "incremental", //export const experimental_ppr = true;
        dynamicIO: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "supa.scholigo.net",
                port: '',
            }
        ]
    }
};

export default nextConfig;
