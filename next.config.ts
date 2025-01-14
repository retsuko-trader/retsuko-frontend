import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['duckdb', 'duckdb-async', 'tulind'],
  /* config options here */
};

export default nextConfig;
