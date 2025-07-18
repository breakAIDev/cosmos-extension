/* global module */
// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const defaultColors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/**/*.{html,js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    fontFamily: {
      Satoshi: ['Satoshi', 'Helvetica', 'Arial', 'sans-serif'],
      DMMono: ['DMMono', 'Helvetica', 'Arial', 'sans-serif'],
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      mdl: '18px',
      lg: '20px',
      xl: '24px',
      xxl: '32px',
      jumbo: '48px',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    colors: {
      ...defaultColors,
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      warning: 'hsl(var(--warning))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        hover: 'hsl(var(--primary-hover))',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
        50: 'hsl(var(--secondary-50))',
        100: 'hsl(var(--secondary-100))',
        200: 'hsl(var(--secondary-200))',
        250: 'hsl(var(--secondary-250))',
        300: 'hsl(var(--secondary-300))',
        350: 'hsl(var(--secondary-350))',
        400: 'hsl(var(--secondary-400))',
        500: 'hsl(var(--secondary-500))',
        600: 'hsl(var(--secondary-600))',
        700: 'hsl(var(--secondary-700))',
        800: 'hsl(var(--secondary-800))',
      },
      border: {
        DEFAULT: 'hsl(var(--border))',
        bottom: 'hsl(var(--border-bottom))',
      },
      monochrome: {
        DEFAULT: 'hsl(var(--monochrome))',
        foreground: 'hsl(var(--monochrome-foreground))',
        hover: 'hsl(var(--monochrome-hover))',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
        100: 'hsl(var(--destructive-100))',
        200: 'hsl(var(--destructive-200))',
        400: 'hsl(var(--destructive-400))',
        700: 'hsl(var(--destructive-700))',
      },
      ghost: {
        hover: 'hsl(var(--ghost-hover))',
      },
      muted: {
        foreground: 'hsl(var(--muted-foreground))',
      },
      accent: {
        foreground: 'hsl(var(--accent-foreground))',
        success: 'hsl(var(--accent-success))',
        'success-200': 'hsl(var(--accent-success-200))',
        warning: {
          DEFAULT: 'hsl(var(--accent-warning))',
          700: 'hsl(var(--accent-warning-700))',
          800: 'hsl(var(--accent-warning-800))',
          foreground: 'hsl(var(--accent-warning-foreground))',
        },
        green: {
          DEFAULT: 'hsl(var(--accent-green))',
          200: 'hsl(var(--accent-green-200))',
          600: 'hsl(var(--accent-green-600))',
          700: 'hsl(var(--accent-green-700))',
          900: 'hsl(var(--accent-green-900))',
        },
        yellow: {
          DEFAULT: 'hsl(var(--accent-yellow))',
        },
        blue: {
          DEFAULT: 'hsl(var(--accent-blue))',
        },
      },
      mainChainTheme: {
        100: '#754f9c66',
        200: '#1B45F5',
        400: '#754f9c',
      },
      compassChainTheme: {
        400: '#224874',
      },
      green: {
        50: '#EFFBF6',
        300: '#8CE3BF',
        400: '#22D292',
        500: '#3ACF92',
        600: '#29A874',
        700: '#1F7F58',
        800: '#165A3E',
        900: '#0D3525',
      },
      red: {
        100: '#FFD1D6',
        200: '#FFADB5',
        300: '#FF707E',
        400: '#FF3D50',
        600: '#D10014',
        700: '#DF505E',
        800: '#70000B',
        900: '#420006',
      },
      gray: {
        50: '#F4F4F4',
        100: '#E8E8E8',
        200: '#D6D6D6',
        300: '#B8B8B8',
        400: '#9E9E9E',
        500: '#858585',
        600: '#696969',
        700: '#696969',
        800: '#383838',
        850: '#2C2C2C',
        900: '#212121',
        950: '#141414',
      },
      black: {
        50: '#0000000F',
        80: '#000000CC',
        100: '#000000',
      },
      white: {
        0: '#00000000',
        30: '#FFFFFF1E',
        100: '#FFFFFF',
      },
      indigo: {
        300: '#8583EC',
      },
      yellow: {
        500: '#FFCE0A',
        600: '#D1A700',
      },
      orange: {
        100: '#FFEDD1',
        200: '#FFDFAD',
        300: '#FFC770',
        500: '#FF9F0A',
        600: '#D17F00',
        700: '#312F1B',
        800: '#704400',
        900: '#422800',
      },
      blue: {
        50: '#ebf5ff',
        100: '#D1E8FF',
        200: '#ADD6FF',
        400: '#3D9EFF',
        600: '#0A84FF',
        800: '#003870',
        900: '#002142',
      },
      teal: {
        500: '#0AB8FF',
      },
      transparent: 'transparent',
      current: 'currentColor',
      osmosisPrimary: '#726FDC',
    },
    extend: {
      animation: {
        fadeIn: 'fadeIn 2s ease-in-out',
        translate: 'translateY 1s ease-in-out',
        scaleUpDown: 'scaleUpDown 1s ease-in-out infinite',
      },
      keyframes: () => ({
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        translateY: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50px)' },
        },
        scaleUpDown: {
          '0%': { transform: 'scale(var(--scale-up-down-start, 1.05))' },
          '50%': { transform: 'scale(var(--scale-up-down-end, 1))' },
          '100%': { transform: 'scale(var(--scale-up-down-start, 1.05))' },
        },
      }),
      backgroundImage: {
        'gradient-linear':
          'linear-gradient(var(--bg-linear-gradient-rotation), hsl(var(--bg-linear-gradient-start)) 0%, hsl(var(--bg-linear-gradient-end)) 100%)',
        'gradient-radial-mono':
          'radial-gradient(50% 50% at 50% 50%, hsl(var(--gradient-radial-mono-start)) 0%, hsl(var(--gradient-radial-mono-end)) 100%)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('tailwindcss-animate')],
}
