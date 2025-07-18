/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // This path tells Tailwind to look in all subdirectories of `src`
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0D6EFD',
        'secondary': '#6C757D',
        'light': '#F8F9FA',
        'dark': '#212529',
      }
    },
  },
  plugins: [],
}