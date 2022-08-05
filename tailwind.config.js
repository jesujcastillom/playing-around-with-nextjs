module.exports = {
  mode: "jit",
  purge: ["./src/pages/**/*.tsx", "./src/components/**/*.tsx"],
  darkMode: false,
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      gridTemplateRows: {
        ["product-item"]: "minmax(0, 1fr) repeat(3, auto)",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
