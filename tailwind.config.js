/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'quantum-teal':   '#00D4FF',
        'quantum-purple': '#7C3AED',
        'quantum-cyan':   '#06B6D4',
      },
    },
  },
  plugins: [],
}
