const { createGlobPatternsForDependencies } = require("@nx/angular/tailwind");
const { join } = require("path");
const sharedConfig = require("../config/src/lib/tailwind.config");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, "src/**/!(*.stories|*.spec).{ts,html}"),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  presets: [sharedConfig],
  plugins: [],
};
