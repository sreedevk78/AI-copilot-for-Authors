/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cx: {
          deep:      '#0F1117',
          surface:   '#161920',
          canvas:    '#FAFAF8',
          panel:     '#F4F3F0',
          elevated:  '#FFFFFF',
          wash:      '#F8F7F5',
        },
        ink: {
          primary:   '#1A1C23',
          secondary: '#5C5E69',
          muted:     '#9294A0',
          faint:     '#BFC1C9',
          inverse:   '#EDEEF2',
          dim:       '#6B6D79',
        },
        accent: {
          DEFAULT:   '#6366F1',
          soft:      '#EEF0FF',
          hover:     '#4F46E5',
          muted:     '#818CF8',
          dim:       '#3730A3',
        },
        sage: {
          DEFAULT:   '#34D399',
          soft:      '#D1FAE5',
          strong:    '#059669',
        },
        amber: {
          DEFAULT:   '#F59E0B',
          soft:      '#FEF3C7',
          strong:    '#B45309',
        },
        rose: {
          DEFAULT:   '#F43F5E',
          soft:      '#FFF1F2',
          strong:    '#BE123C',
        },
      },
      fontFamily: {
        serif: ['var(--font-source-serif)', 'Georgia', 'serif'],
        sans:  ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'cx-xs':   '4px',
        'cx-sm':   '6px',
        'cx-md':   '10px',
        'cx-lg':   '16px',
        'cx-xl':   '24px',
      },
      boxShadow: {
        'cx-xs':  '0 1px 2px rgba(15, 17, 23, 0.04)',
        'cx-sm':  '0 2px 6px rgba(15, 17, 23, 0.06)',
        'cx-md':  '0 4px 14px rgba(15, 17, 23, 0.08)',
        'cx-lg':  '0 12px 32px rgba(15, 17, 23, 0.10)',
        'cx-xl':  '0 20px 48px rgba(15, 17, 23, 0.14)',
        'cx-2xl': '0 32px 72px rgba(15, 17, 23, 0.20)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
