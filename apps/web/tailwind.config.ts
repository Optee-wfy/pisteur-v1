import type { Config } from "tailwindcss";
import sharedConfig from "../../libs/client/config/src/lib/tailwind.config.js";

const config: Config = {
  ...sharedConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
