const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'refresh': 'refreshtimer 30s linear infinite',
        'refreshspin': 'refreshspin 2s linear infinite',
      },
      keyframes: {
        refreshtimer: {
          from: {width: '0%'},
          to: {width: '100%'}
        },
        refreshspin: {
          from: {transform: 'rotate(0deg)'},
          to: {transform: 'rotate(360deg)'}
        }
      }
    },
    // color: {
    //   transparent: 'transparent',
    //   current: 'currentColor',

    //   'error': '#f43f5e',
    // }

  },
  plugins: [require('daisyui')],
}
