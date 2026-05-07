const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      hXs: {
        raw: "(min-height: 480px)",
      },
      hSm: {
        raw: "(min-height: 640px)",
      },
      hMd: {
        raw: "(min-height: 768px)",
      },
      hLg: {
        raw: "(min-height: 1024px)",
      },
      hXl: {
        raw: "(min-height: 1280px)",
      },
    },
    extend: {
      backgroundImage: {
        "gradient-227": "linear-gradient(227deg, var(--tw-gradient-stops))",
        "gradient-card":
          "linear-gradient(0deg, #031122 0%, rgba(3, 17, 34, 0.00) 100%)",
      },
      boxShadow: {
        o: "0px 5px 15px 0px rgba(27, 95, 255, 0.08)",
        "o-highlight": "0px 5px 15px 0px rgba(27, 95, 255, 0.2)",
        o2: "0px 5px 15px rgba(22, 91, 255, 0.16)",
        "o2-reverse": "0px -10px 15px rgba(22, 91, 255, 0.1)",
        "inner-bottom": "-1px -8px 25px -4px rgba(0,0,0,0.07) inset",
      },
      screens: {
        print: { row: "print" },
      },
      animation: {
        fadeIn: "fadeIn 0.3s forwards",
        "bounce-x": "bounce-x 1s ease-in-out infinite",
      },
      keyframes: {
        "bounce-x": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(4px)" },
        },
        fadeIn: {
          "0%": { opacity: "0", display: "none" },
          "100%": { opacity: "1", display: "block" },
        },
        modal: {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      maxWidth: {
        app: "1480px",
        showcase: "1250px",
      },
    },
    fontFamily: {
      sans: [
        "system-ui",
        "Segoe UI",
        "Roboto",
        "Helvetica",
        "Arial",
        "sans-serif",
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol",
      ],
      display: ["Poppins", "sans-serif"],
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      amber: colors.amber,
      cyan: colors.cyan,
      orange: colors.orange,
      slate: colors.slate,
      gray: {
        100: "#F6F6FA",
        300: "#D0D4E5",
        600: "#646FA7",
      },
      purple: {
        50: "#FBF5FF",
        100: "#F6E5FF",
        200: "#EECCFF",
        300: "#DD99FF",
        400: "#CC66FF",
        500: "#AA00FF",
        600: "#8800CC",
        700: "#660099",
        800: "#440066",
        900: "#33004D",
      },
      granite: {
        50: "#F9FAFA",
        100: "#EEEFF1",
        200: "#D2D3DA",
        300: "#B6B8C3",
        400: "#7E8295",
        500: "#4E515F",
        700: "#202127",
        900: "#101114",
      },
      red: {
        ...colors.red,
        300: "#FFE8E7",
        500: "#B01B2F",
      },
      green: {
        50: "#F5FFF8",
        100: "#E5FFEE",
        200: "#CCFFDD",
        300: "#99FFBB",
        400: "#66FF99",
        500: "#00FF55",
        600: "#00CC44",
        700: "#009933",
        800: "#006622",
        900: "#004D1A",
      },
      yellow: {
        ...colors.yellow,
        300: "#FFF5CB",
        500: "#715E0F",
      },
      blue: {
        ...colors.blue,
        300: "#E6F3FC",
      },
      primary: {
        50: "#F5F7FF",
        100: "#E5EAFF",
        200: "#CCD4FF",
        300: "#99AAFF",
        400: "#6680FF",
        500: "#002BFF",
        700: "#001A99",
        800: "#001166",
        900: "#000D4D",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),

    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-stable": {
          "scrollbar-gutter": "stable",
        },
      });
    },

    function ({ addBase, theme }) {
      addBase({
        ":root": {
          "--color-primary": theme("colors.primary.700"),
        },
      });
    },
  ],
};
