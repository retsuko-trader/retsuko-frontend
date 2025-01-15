import type { NextConfig } from "next";

const nextConfig = (phase: string) => {
  const isProd = (
    process.env.NODE_ENV === 'production'
    || phase === 'phase-production-build'
    || phase === 'phase-production-server'
  );

  const result: NextConfig = {
    serverExternalPackages: ['duckdb', 'duckdb-async', 'tulind'],
    distDir: isProd ? '.next.prod' : '.next.dev',
  };

  return result;
}

export default nextConfig;