import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    "@optee/constants",
    "@optee/models",
    "@optee/utils",
    "@optee/trpc-client",
    "@optee/trpc-server",
    "@optee/env",
  ],
  webpack(config) {
    const root = path.resolve(__dirname, "../..");
    config.resolve.alias = {
      ...config.resolve.alias,
      "@optee/constants": path.join(root, "libs/shared/constants/src/index.ts"),
      "@optee/constants/": path.join(root, "libs/shared/constants/src/lib/"),
      "@optee/models": path.join(root, "libs/shared/models/src/index.ts"),
      "@optee/utils": path.join(root, "libs/shared/utils/src/index.ts"),
      "@optee/trpc-client": path.join(root, "libs/client/trpc/src/index.ts"),
      "@optee/trpc-server": path.join(root, "libs/server/trpc-server/src/index.ts"),
      "@optee/env": path.join(root, "libs/shared/environments/index.ts"),
    };
    return config;
  },
};

export default nextConfig;
