import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:     '#060C08',
        bg1:    '#0A1410',
        bg2:    '#0E1A12',
        card:   '#111D14',
        card2:  '#162118',
        lime:   '#CAFF33',
        mint:   '#7DDFAA',
        sand:   '#EAE4D6',
        muted:  '#527A5F',
        dim:    '#2C4535',
        red:    '#FF4F4F',
        amber:  '#F5A523',
        blue:   '#5BA4FF',
        border: 'rgba(125,223,170,0.07)',
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        earthSpin: {
          from: { transform: 'rotateY(0deg)' },
          to:   { transform: 'rotateY(360deg)' },
        },
        particleDrift: {
          '0%':   { transform: 'translateY(0) translateX(0) scale(1)', opacity: '0' },
          '10%':  { opacity: '1' },
          '90%':  { opacity: '1' },
          '100%': { transform: 'translateY(-120vh) translateX(40px) scale(0.5)', opacity: '0' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(202, 255, 51, 0)' },
          '50%':      { boxShadow: '0 0 20px 4px rgba(202, 255, 51, 0.15)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'float':          'float 4s ease-in-out infinite',
        'earth-spin':     'earthSpin 25s linear infinite',
        'ping-slow':      'ping 3s ease infinite',
        'particle':       'particleDrift 8s ease-in infinite',
        'shimmer':        'shimmer 2s linear infinite',
        'pulse-glow':     'pulseGlow 2s ease-in-out infinite',
        'count-up':       'countUp 0.6s ease-out forwards',
        'slide-in-left':  'slideInLeft 0.5s ease-out forwards',
        'fade-in-up':     'fadeInUp 0.6s ease-out forwards',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh':   'radial-gradient(at 40% 20%, rgba(202,255,51,0.05) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(125,223,170,0.04) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(91,164,255,0.03) 0px, transparent 50%)',
      },
      boxShadow: {
        'lime':   '0 0 30px rgba(202,255,51,0.15)',
        'mint':   '0 0 20px rgba(125,223,170,0.1)',
        'card':   '0 4px 32px rgba(0,0,0,0.4)',
        'glow':   '0 0 60px rgba(202,255,51,0.08)',
      },
    },
  },
  plugins: [],
}
export default config
