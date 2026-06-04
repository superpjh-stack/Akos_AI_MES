import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Navy palette — primary brand
        navy: {
          50:  '#e8eef5',
          100: '#c6d4e6',
          200: '#9fb7d4',
          300: '#7899c2',
          400: '#5c82b5',
          500: '#406ba8',
          600: '#345a93',
          700: '#264778',
          800: '#1e3a5f', // primary
          900: '#142847',
        },
        // Corporate / action palette
        corporate: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // action
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Semantic tokens
        success: {
          light: '#d1fae5',
          DEFAULT: '#10b981',
          dark:  '#065f46',
        },
        warning: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark:  '#92400e',
        },
        danger: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
          dark:  '#991b1b',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        pretendard: ['Pretendard', 'sans-serif'],
      },
      boxShadow: {
        'card':    '0 2px 8px 0 rgba(30, 58, 95, 0.08)',
        'card-md': '0 4px 16px 0 rgba(30, 58, 95, 0.12)',
        'card-lg': '0 8px 32px 0 rgba(30, 58, 95, 0.16)',
        'action':  '0 2px 6px 0 rgba(37, 99, 235, 0.30)',
      },
      screens: {
        xs:   '480px',
        sm:   '640px',
        md:   '768px',
        lg:   '1024px',
        xl:   '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
}

export default config
