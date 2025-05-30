/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'qadiyatuk-green': '#2E7D32',
        'qadiyatuk-gray': '#E0E0E0',
        'qadiyatuk-bg': '#F5F5F5',
        'qadiyatuk-text-gray': '#666666',
      },
    },
  },
  plugins: [],
}

