/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#FAF9F6',
        ink: '#1C1B1A',
        wine: '#7A2E2E',
        wineDark: '#5A2020',
        brass: '#B8935F',
        line: '#E3DFD8',
        muted: '#8A8578',
      },
      fontFamily: {
        display: ['"Times New Roman"', 'Times', 'serif'],
        body: ['"Times New Roman"', 'Times', 'serif'],
      },
    },
  },
  plugins: [],
};
