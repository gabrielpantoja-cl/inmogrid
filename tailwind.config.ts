import animate from 'tailwindcss-animate';

const config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // Colores de marca (alias semánticos directos)
        'brand-primary':          '#EFB810',
        'brand-secondary':        '#FFCB2B',
        'brand-accent':           '#FFE5AD',
        'brand-background-light': '#F8F2E8',
        'brand-text':             '#424242',
        'brand-black':            '#000000',
        // Escala de primary para utilitarios
        primary: {
          DEFAULT: '#EFB810',
          foreground: '#000000',
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#EFB810',
          600: '#d99e0d',
          700: '#b4820b',
          800: '#926809',
          900: '#785207',
          950: '#452f04',
        },
        secondary: {
          DEFAULT: '#FFCB2B',
          foreground: '#000000',
        },
        background: '#F8F2E8',
        foreground: '#424242',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#424242',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#424242',
        },
        muted: {
          DEFAULT: '#FFE5AD',
          foreground: '#737373',
        },
        accent: {
          DEFAULT: '#FFE5AD',
          foreground: '#424242',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#fef2f2',
        },
        border: '#FFE5AD',
        input:  '#FFE5AD',
        ring:   '#EFB810',
      },
      fontFamily: {
        sans:    ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
        heading: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs':   '0.75rem',
        'sm':   '0.875rem',
        'base': '1rem',
        'lg':   '1.125rem',
        'xl':   '1.25rem',
        '2xl':  '1.5rem',
        '3xl':  '1.875rem',
        '4xl':  '2.25rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        'navbar-height': 'var(--navbar-height)',
      },
      padding: {
        'safe': 'env(safe-area-inset-bottom)',
      },
      borderRadius: {
        'sm': 'calc(var(--radius) - 4px)',
        'md': 'calc(var(--radius) - 2px)',
        'lg': 'var(--radius)',
        'xl': '0.75rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' }
        },
        'slide-up': {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' }
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slide-in': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'slide-up':       'slide-up 0.3s ease-out',
        'fade-in':        'fade-in 0.3s ease-in-out',
        'slide-in':       'slide-in 0.3s ease-out'
      },
      maxWidth: {
        'screen-2xl': '1536px',
      },
      zIndex: {
        '1': '1', '2': '2', '3': '3',
        '60': '60', '70': '70', '80': '80', '90': '90', '100': '100',
        'navbar':   'var(--z-index-navbar)',
        'dropdown': 'var(--z-index-dropdown)',
        'modal':    'var(--z-index-modal)',
        'drawer':   'var(--z-index-drawer)',
        'toast':    'var(--z-index-toast)',
        'content':  'var(--z-index-content)',
      },
    }
  },
  plugins: [animate],
  // Configuración adicional para purgar estilos no utilizados
  safelist: [
    'text-xs',
    'text-sm', 
    'text-base',
    'text-lg',
    'text-xl',
    'text-2xl',
    'text-3xl',
    'w-4',
    'w-5',
    'w-6',
    'w-8',
    'w-10',
    'w-12',
    'h-4',
    'h-5',
    'h-6',
    'h-8',
    'h-10',
    'h-12',
  ]
};

export default config;