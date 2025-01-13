import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['duckdb', 'duckdb-async'],
  /* config options here */
};

export default nextConfig;
