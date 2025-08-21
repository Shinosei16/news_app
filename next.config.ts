import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ビルド時にESLintで落とさない（本番公開を優先）
  eslint: { ignoreDuringBuilds: true },
  // 型エラーでも止めたくなったら↓を外して使う
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;