/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
      extend: {
        colors: {
          base: '#0a0a0f',
          surface: '#13131a',
          surface2: '#1e1e2e',
          accent: '#6c63ff',
          accent2: '#ff6584',
          muted: '#6b6b80',
        },
        fontFamily: {
          syne: ['Syne', 'sans-serif'],
          dm: ['DM Sans', 'sans-serif'],
        },
        keyframes: {
          'pulse-ring': {
            '0%': { transform: 'scale(0.9)', opacity: '0.4' },
            '50%': { transform: 'scale(1.1)', opacity: '0.15' },
            '100%': { transform: 'scale(1.2)', opacity: '0' },
          },
          'panel-open': {
            from: { opacity: '0', transform: 'scale(0.8) translateY(20px)' },
            to: { opacity: '1', transform: 'scale(1) translateY(0)' },
          },
          'panel-close': {
            from: { opacity: '1', transform: 'scale(1) translateY(0)' },
            to: { opacity: '0', transform: 'scale(0.85) translateY(10px)' },
          },
          'bubble-in': {
            from: { opacity: '0', transform: 'translateY(8px)' },
            to: { opacity: '1', transform: 'translateY(0)' },
          },
          'bar-listen': {
            '0%, 100%': { height: '6px' },
            '50%': { height: '24px' },
          },
          'bar-speak': {
            '0%, 100%': { height: '8px' },
            '50%': { height: '36px' },
          },
          'dot-blink': {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0.3' },
          },
          'typing-bounce': {
            '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
            '30%': { transform: 'translateY(-6px)', opacity: '1' },
          },
          'avatar-pulse': {
            '0%, 100%': { boxShadow: '0 0 0 0 rgba(108,99,255,0.4)' },
            '50%': { boxShadow: '0 0 0 8px rgba(108,99,255,0)' },
          },
        },
        animation: {
          'pulse-ring': 'pulse-ring 2s ease-out infinite',
          'pulse-ring-2': 'pulse-ring 2s ease-out 0.5s infinite',
          'panel-open': 'panel-open 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
          'panel-close': 'panel-close 0.25s ease-in forwards',
          'bubble-in': 'bubble-in 0.25s ease forwards',
          'bar-listen': 'bar-listen 1.2s ease-in-out infinite',
          'bar-speak': 'bar-speak 0.6s ease-in-out infinite',
          'dot-blink': 'dot-blink 1.5s ease-in-out infinite',
          'typing-1': 'typing-bounce 1.2s ease-in-out 0s infinite',
          'typing-2': 'typing-bounce 1.2s ease-in-out 0.2s infinite',
          'typing-3': 'typing-bounce 1.2s ease-in-out 0.4s infinite',
          'avatar-pulse': 'avatar-pulse 1.2s ease-in-out infinite',
        },
      },
    },
    plugins: [],
  };