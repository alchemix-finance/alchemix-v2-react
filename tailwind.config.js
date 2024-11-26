const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "selector",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    fontFamily: {
      sans: ["Montserrat", ...defaultTheme.fontFamily.sans],
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        alcxTitles: ["Neue Kabel", "Montserrat", "sans-serif"],
        alcxMono: ["monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "reduced-motion-accordion-down": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
            opacity: "1",
          },
          to: { height: "0", opacity: "0" },
        },
        "reduced-motion-accordion-up": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "loading-bar": {
          "0%": {
            left: "-35%",
            right: " 100%",
          },
          "60%": {
            left: "100%",
            right: "-90%",
          },
          "100%": {
            left: "100%",
            right: "-90%",
          },
        },
        scroll: {
          "0%": {
            transform: "translateX(0px)",
          },
          "100%": {
            transform: "translateX(-100%)",
          },
        },
        // cta button at landing page
        buttonMovingGradientBg: {
          "0%": { "background-position": "0%" },
          "100%": { "background-position": "200%" },
        },
        // shine border effect at els at landing page
        shine: {
          "0%": {
            "background-position": "0% 0%",
          },
          "50%": {
            "background-position": "100% 100%",
          },
          to: {
            "background-position": "0% 0%",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "reduced-motion-accordion-down":
          "reduced-motion-accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "reduced-motion-accordion-up":
          "reduced-motion-accordion-up 0.2s ease-out",
        "loading-bar":
          "loading-bar 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) 0s infinite normal none running",
        scroll: "scroll 30s linear infinite",
        buttonMovingGradientBg:
          "buttonMovingGradientBg var(--speed, 2s) infinite linear",
        shine: "shine 14s infinite linear",
      },
      colors: {
        black1: "#0E251D",
        black2: "#10141A",
        bronze1: "#F5C59F",
        bronze1inverse: "#0a3a60",
        bronze2: "#F7C19B",
        bronze2inverse: "#113D61",
        bronze3: "#ad937c",
        bronze4: "#353130",
        bronze4inverse: "#cacecf",
        blue1: "#0E8AD0",
        blue2: "#0557e8",
        blue3: "#6C93C7",
        blue4: "#0E8AD0",
        blue5: "#0557E8",
        green1: "#2ecc94",
        green2: "#3EB88E",
        green3: "#01FFD4",
        green4: "#42B792",
        green5: "#75FFD3",
        green6: "#01FFD4",
        green7: "#7eb79b",
        darkgreen1: "#1C2E31",
        darkgreen2: "#2B4246",
        darkgrey1: "#908486",
        grey1: "#282D3A",
        grey1inverse: "#D6D2C6",
        grey2: "#b2b4b6",
        grey3: "#232833",
        grey3inverse: "#dcd7cc",
        grey5: "#20242C",
        grey5inverse: "#DEDBD3",
        grey10: "#171B24",
        grey10inverse: "#E8E4DB",
        grey15: "#10151B",
        grey15inverse: "#efeae4",
        grey18: "#11161C",
        grey18inverse: "#eee9e3",
        grey20: "#10141A",
        grey20inverse: "#efebe5",
        grey30: "#0E1116",
        grey30inverse: "#F1EEE9",
        lightbronze1: "#FFDFC9",
        lightgrey1: "#b7b7b7",
        lightgrey1inverse: "#484848",
        lightgrey5: "#b0b0b0",
        lightgrey5inverse: "#4f4f4f",
        lightgrey10: "#979BA2",
        lightgrey10inverse: "#68645d",
        lightgrey20: "#4d5466",
        lightgrey20inverse: "#b2ab99",
        red1: "#fc4544",
        red2: "#220908",
        red3: "#DC1D1D",
        red4: "#471311",
        red5: "#931c18",
        orange1: "#ec8339",
        orange2: "#FE6A02",
        orange3: "#F4C19D",
        orange4: "#F5C09A",
        orange4inverse: "#103D61",
        white2: "#f5f5f5",
        white2inverse: "#0A0A0A",
        twitter: "#4CABFA",
        discord: "#7289DA",
        iconsInverse: "#003e63",
        fantom: "#1969ff",
        ethereum: "#647fe5",
        arbitrum: "#93b4d5",
        optimism: "#ed3a2a",
      },
      backgroundImage: {
        bodyGradient:
          "linear-gradient(171.08deg, #fefefe -11.16%, #ebe6de 6.1%, #f5f2ee 49.05%, #fff 93.22%)",
        bodyGradientInverse:
          "linear-gradient(171.08deg, #010101 -11.16%, #141921 6.1%, #0a0d11 49.05%, #000000 93.22%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
