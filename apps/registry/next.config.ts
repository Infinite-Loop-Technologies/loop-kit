import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@loop-kit/common",
    "@loop-kit/common-react",
    "@loop-kit/interaction-core",
    "@loop-kit/interaction-react",
    "@loop-kit/dock",
    "@loop-kit/dock-react",
    "@loop-kit/registry-source"
  ],
}

export default nextConfig
