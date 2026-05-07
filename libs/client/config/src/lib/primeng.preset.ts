import { definePreset } from "@primeng/themes";
import Aura from "@primeng/themes/aura";

// source: https://primeng.org/theming#primary
export const PrimeCustomPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "#F8F7FC",
      100: "#F8F7FC",
      200: "#F8F7FC", // Obligé de mettre du 200 car potentiellement utilsié par prime
      300: "#E2EBFF",
      400: "#A3C0FF",
      500: "#165BFF",
      600: "#1246C1",
      700: "#10009D",
      800: "#10009D", // Obligé de mettre du 800 car utilisé notamment par --p-highlight-focus-color
      900: "#031122", // Obligé de mettre du 900 car potentiellement utilsié par prime
      950: "#031122",
    },
  },
});
