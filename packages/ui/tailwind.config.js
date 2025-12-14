/** @type {import(tailwindcss).Config} */

const Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../apps/*/src/**/*.{js, jsx, ts, tsx}",
    "../../packages/*/src/**/*.{js, jsx, ts, tsx}",
  ],
  theme: {
    extends: {},
  },
  plugins: [],
}

export default Config;