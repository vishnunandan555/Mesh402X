/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Manrope', 'ui-sans-serif', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Single cool-green-tinted gray family — no warm/cool mixing
        base: {
          50: '#f4f8f6',
          100: '#e4ebe8',
          200: '#c7d3ce',
          300: '#9fb0aa',
          400: '#758781',
          500: '#56665f',
          600: '#3d4a45',
          700: '#2b3531',
          800: '#1a211e',
          900: '#101514',
          950: '#0a0c0b',
          ink: '#060807',
        },
        accent: {
          DEFAULT: '#34b98a', // desaturated emerald — hsl(160 55% 47%)
          bright: '#52caa0',
          dim: '#27936c',
          soft: 'rgba(52, 185, 138, 0.12)',
        },
      },
      boxShadow: {
        node: 'inset 0 1px 0 0 rgba(255,255,255,0.04), 0 14px 34px -18px rgba(4,8,7,0.9)',
        pop: 'inset 0 1px 0 0 rgba(255,255,255,0.06), 0 22px 48px -20px rgba(4,10,8,0.95)',
        glow: '0 8px 28px -10px rgba(52,185,138,0.38)',
      },
      maxWidth: {
        shell: '72rem',
      },
    },
  },
  daisyui: {
    themes: ['lofi'],
    logs: false,
  },
  plugins: [require('daisyui')],
}
