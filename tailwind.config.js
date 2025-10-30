// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 프로젝트 커스텀 색상
        primary: {
          DEFAULT: '#0492f4',
          hover: '#0378d4',
        },
        state: {
          running: '#0492f4',
          healthy: '#14ba6d',
          warning: '#f0a100',
          error: '#ff6c5e',
          inactive: '#ebebf1',
        },
        background: {
          main: '#f7f7f7',
          card: '#ffffff',
          header: '#f0f0f0',
        },
        border: {
          DEFAULT: '#e5e5ec',
          light: '#ebebf1',
        },
        text: {
          primary: '#505050',
          secondary: '#767676',
          tertiary: '#999999',
          label: '#555555',
          muted: '#8899a6',
        }
      },
      fontFamily: {
        pretendard: ['Pretendard', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['Monaco', 'Courier New', 'monospace'],
      },
      fontSize: {
        '10': '10px',
        '11': '11px',
        '12': '12px',
        '14': '14px',
        '16': '16px',
        '18': '18px',
        '20': '20px',
      },
      boxShadow: {
        'card': '0px 1px 1px 0px rgba(0, 0, 0, 0.25)',
        'inset-search': 'inset 0px 1px 2px 0px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '20': '20px',
      },
      spacing: {
        '18': '72px',
        '25': '100px',
      },
      lineHeight: {
        tight140: '1.4',
      },
      letterSpacing: {
        tight025: '-0.025em',
      },
      fontFamily: {
        pretendard: ['Pretendard', 'sans-serif'], 
    },
  },
  plugins: [],
}

// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }
}