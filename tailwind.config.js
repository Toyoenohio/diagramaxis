/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        diagramaxis: {
          // Estructura (papel / atelier)
          bg: 'rgb(var(--da-bg) / <alpha-value>)',
          surface: 'rgb(var(--da-surface) / <alpha-value>)',
          surface2: 'rgb(var(--da-surface2) / <alpha-value>)',
          surface3: 'rgb(var(--da-surface3) / <alpha-value>)',
          border: 'rgb(var(--da-border) / <alpha-value>)',
          borderLight: 'rgb(var(--da-border-light) / <alpha-value>)',
          brandChip: 'rgb(var(--da-brand-chip) / <alpha-value>)',
          // Acentos
          gold: 'rgb(var(--da-gold) / <alpha-value>)',
          goldMuted: 'rgb(var(--da-gold-muted) / <alpha-value>)',
          goldHover: 'rgb(var(--da-gold-hover) / <alpha-value>)',
          goldEngraved: 'rgb(var(--da-gold-engraved) / <alpha-value>)',
          orange: 'rgb(var(--da-orange) / <alpha-value>)',
          orangeInk: 'rgb(var(--da-orange-ink) / <alpha-value>)',
          cyan: 'rgb(var(--da-cyan) / <alpha-value>)',
          cyanBright: 'rgb(var(--da-cyan-bright) / <alpha-value>)',
          cyanInk: 'rgb(var(--da-cyan-ink) / <alpha-value>)',
          success: 'rgb(var(--da-success) / <alpha-value>)',
          successHover: 'rgb(var(--da-success-hover) / <alpha-value>)',
          successInk: 'rgb(var(--da-success-ink) / <alpha-value>)',
          warn: 'rgb(var(--da-warn) / <alpha-value>)',
          danger: 'rgb(var(--da-danger) / <alpha-value>)',
          white: 'rgb(var(--da-white) / <alpha-value>)',
          // Materiales (madera / corcho)
          kraft: 'rgb(var(--da-kraft) / <alpha-value>)',
          kraftDark: 'rgb(var(--da-kraft-dark) / <alpha-value>)',
          kraftBorder: 'rgb(var(--da-kraft-border) / <alpha-value>)',
          kraftFg: 'rgb(var(--da-kraft-fg) / <alpha-value>)',
          cork: 'rgb(var(--da-cork) / <alpha-value>)',
          corkLight: 'rgb(var(--da-cork-light) / <alpha-value>)',
          blockWhite: 'rgb(var(--da-block-white) / <alpha-value>)',
          // Texto
          text: 'rgb(var(--da-text) / <alpha-value>)',
          textBright: 'rgb(var(--da-text-bright) / <alpha-value>)',
          textMuted: 'rgb(var(--da-text-muted) / <alpha-value>)',
          textDim: 'rgb(var(--da-text-dim) / <alpha-value>)',
          // Paneles de evaluación
          evalBg: 'rgb(var(--da-eval-bg) / <alpha-value>)',
          evalDeep: 'rgb(var(--da-eval-deep) / <alpha-value>)',
          evalBorder: 'rgb(var(--da-eval-border) / <alpha-value>)',
          evalHover: 'rgb(var(--da-eval-hover) / <alpha-value>)',
          overlay: 'rgb(var(--da-overlay) / <alpha-value>)',
          // Fichas de madera grabada
          nodeHead: 'rgb(var(--da-node-head) / <alpha-value>)',
          nodeHeadBorder: 'rgb(var(--da-node-head-border) / <alpha-value>)',
          chipBg: 'rgb(var(--da-chip-bg) / <alpha-value>)',
          chipBorder: 'rgb(var(--da-chip-border) / <alpha-value>)',
          woodMuted: 'rgb(var(--da-wood-muted) / <alpha-value>)',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        mono: ['"DM Mono"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
