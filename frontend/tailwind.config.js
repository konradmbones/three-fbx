/** @type {import('tailwindcss').Config} */
export default {
  content: ["./public/*.html", './public/src/**/*.js', './public/src/**/*.ts'],
  theme: {
    extend: {
      colors: {
        bones: {
          900: '#eafd4b'
        }
      },
    },

  },
  plugins: [],
}

