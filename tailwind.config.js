/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        diagramaxis: {
          bg: '#0f1013',           // Negro mate caja
          surface: '#17181d',      // Bandeja compartimentada
          surface2: '#1f2128',     // Compartimento interior
          surface3: '#2a2d36',     // Hover / Borde activo
          border: '#2e323c',       // Separador de bandeja
          borderLight: '#434855',
          gold: '#e5a93b',         // Oro Diagramaxis (punto y líneas)
          goldMuted: '#9e7529',
          orange: '#ea580c',       // Acento naranja tarjetas
          kraft: '#c8af88',        // Fichas redondas de madera grabada
          kraftDark: '#2c2419',    // Texto grabado en madera
          kraftBorder: '#a88f68',
          cork: '#966738',         // Tablero de corcho
          corkLight: '#b88350',
          blockWhite: '#f8fafc',   // Bloques modulares 3D
          text: '#f8fafc',
          textMuted: '#94a3b8',
          textDim: '#64748b',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        mono: ['"DM Mono"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
