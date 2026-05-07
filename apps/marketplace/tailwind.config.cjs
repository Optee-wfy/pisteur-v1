const { join } = require("node:path");
const colors = require("tailwindcss/colors");
const sharedConfig = require("../../libs/client/config/src/lib/tailwind.config");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, "src/**/!(*.stories|*.spec).{ts,html}"),
    join(__dirname, "../../libs/client/**/!(*.stories|*.spec).{ts,html,scss}"),
  ],
  presets: [sharedConfig],
  plugins: [],
};
