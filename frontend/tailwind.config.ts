/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate";
import { default as flattenColorPalette } from "tailwindcss/lib/util/flattenColorPalette";
import tailwindTypography from '@tailwindcss/typography'
 
import theme from './src/components/theme'
import { Config } from "tailwindcss";
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: { extend: theme},
  
  plugins: [tailwindcssAnimate, tailwindTypography,addVariablesForColors], // 
} as Config

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addVariablesForColors({ addBase, theme } : any) {
  const pal = theme("colors")
  const allColors = flattenColorPalette(pal);
  const newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );
 
  addBase({
    ":root": newVars,
  });
}
