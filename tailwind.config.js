/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,css}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Cardo', 'Cormorant Garamond', 'serif'],
        'body': ['Inter', 'sans-serif'],
        'mystical': ['Eczar', 'Rosarivo', 'serif'],
        'sacred': ['Cardo', 'serif']
      },
      colors: {
        // Chakra colors with updated values
        chakra: {
          root: '#C62828',      // Red
          sacral: '#EF6C00',    // Orange
          solarPlexus: '#FDD835', // Yellow
          heart: '#66BB6A',     // Green
          throat: '#42A5F5',    // Blue
          thirdEye: '#7E57C2',  // Indigo
          crown: '#AB47BC',     // Violet
        },
        appDark: {
          100: '#1E1E1E',
          200: '#2A2A2A', 
          300: '#333333',
          400: '#444444',
          500: '#555555',
          900: '#121212',
        },
        // Mystical color palette
        mystical: {
          void: '#0a0a1a',
          shadow: '#1a1a2e',
          twilight: '#16213e',
          ethereal: '#9d4edd',
          cosmic: '#7209b7',
          celestial: '#560bad',
          aurora: '#480ca8',
          nebula: '#3c096c',
        },
        // Direct color definition for utility class generation
        'mystical-void': '#0a0a1a',
        // Sacred Number-Based Colors (Tesla 3-6-9)
        tesla: {
          three: '#3C3C3C',
          six: '#6C6C6C',
          nine: '#9C9C9C'
        },
        phi: {
          golden: '#D4AF37', // Golden color
          silver: '#C0C0C0', // Silver (representing divine proportion)
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        'vesica': '57.7%',
        'phi': '61.8%',
      },
      backdropBlur: {
        'xs': '2px',
      },
backgroundImage: {
  // Sacred SVG Backgrounds
  'sacred-geometry': "url('data:image/svg+xml,%3Csvg width=\"120\" height=\"120\" viewBox=\"0 0 120 120\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.03\"%3E%3Ccircle cx=\"60\" cy=\"60\" r=\"30\"/%3E%3Ccircle cx=\"30\" cy=\"60\" r=\"30\"/%3E%3Ccircle cx=\"90\" cy=\"60\" r=\"30\"/%3E%3Ccircle cx=\"45\" cy=\"30\" r=\"30\"/%3E%3Ccircle cx=\"75\" cy=\"30\" r=\"30\"/%3E%3Ccircle cx=\"45\" cy=\"90\" r=\"30\"/%3E%3Ccircle cx=\"75\" cy=\"90\" r=\"30\"/%3E%3C/g%3E%3C/svg%3E')",
  'metatron-cube': "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" stroke=\"%23ffffff\" stroke-opacity=\"0.03\" stroke-width=\"0.5\"%3E%3Ccircle cx=\"50\" cy=\"50\" r=\"40\"/%3E%3Ccircle cx=\"50\" cy=\"10\" r=\"4\"/%3E%3Ccircle cx=\"10\" cy=\"50\" r=\"4\"/%3E%3Ccircle cx=\"90\" cy=\"50\" r=\"4\"/%3E%3Ccircle cx=\"50\" cy=\"90\" r=\"4\"/%3E%3Ccircle cx=\"22\" cy=\"22\" r=\"4\"/%3E%3Ccircle cx=\"78\" cy=\"22\" r=\"4\"/%3E%3Ccircle cx=\"22\" cy=\"78\" r=\"4\"/%3E%3Ccircle cx=\"78\" cy=\"78\" r=\"4\"/%3E%3Cline x1=\"50\" y1=\"10\" x2=\"50\" y2=\"90\"/%3E%3Cline x1=\"10\" y1=\"50\" x2=\"90\" y2=\"50\"/%3E%3Cline x1=\"22\" y1=\"22\" x2=\"78\" y2=\"78\"/%3E%3Cline x1=\"78\" y1=\"22\" x2=\"22\" y2=\"78\"/%3E%3Cline x1=\"50\" y1=\"10\" x2=\"10\" y2=\"50\"/%3E%3Cline x1=\"10\" y1=\"50\" x2=\"50\" y2=\"90\"/%3E%3Cline x1=\"50\" y1=\"90\" x2=\"90\" y2=\"50\"/%3E%3Cline x1=\"90\" y1=\"50\" x2=\"50\" y2=\"10\"/%3E%3C/g%3E%3C/svg%3E')",
  'fibonacci-spiral': "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath fill=\"none\" stroke=\"%23ffffff\" stroke-opacity=\"0.03\" stroke-width=\"0.5\" d=\"M0,100 L0,0 L100,0 L100,100 L0,100 Z M0,62 L62,62 L62,0 M0,38 L38,38 L38,0 M38,38 L38,62 L62,62 M38,38 L0,38 C0,17 17,0 38,0\"/%3E%3Cpath fill=\"none\" stroke=\"%23ffffff\" stroke-opacity=\"0.03\" stroke-width=\"0.5\" d=\"M38,0 C59,0 76,17 76,38 C76,59 59,76 38,76 C17,76 0,59 0,38\"/%3E%3C/svg%3E')",
  'trinity-circles': "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg stroke=\"%23ffffff\" stroke-opacity=\"0.03\" stroke-width=\"0.5\" fill=\"none\"%3E%3Ccircle cx=\"33\" cy=\"33\" r=\"30\"/%3E%3Ccircle cx=\"67\" cy=\"33\" r=\"30\"/%3E%3Ccircle cx=\"50\" cy=\"67\" r=\"30\"/%3E%3C/g%3E%3C/svg%3E')",
  'glyph-texture': "url('data:image/svg+xml,%3Csvg width=\"200\" height=\"200\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" stroke=\"%23ffffff\" stroke-opacity=\"0.02\" stroke-width=\"0.5\"%3E%3Cpath d=\"M20,20 L60,20 L40,60 Z\"/%3E%3Cpath d=\"M140,140 L180,140 L160,180 Z\"/%3E%3Ccircle cx=\"50\" cy=\"150\" r=\"15\"/%3E%3Ccircle cx=\"150\" cy=\"50\" r=\"15\"/%3E%3Cpath d=\"M100,30 L130,60 L100,90 L70,60 Z\"/%3E%3C/g%3E%3C/svg%3E')",

  // Optional external assets (only if available)
  'glyph-diamond': "url('/assets/backgrounds/diamond-glyph.svg')",
  'sigil-veil': "url('/assets/backgrounds/veil-overlay.png')",

  // Gradient Backgrounds
  'gradient-void': 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)',
  'gradient-ethereal': 'linear-gradient(135deg, #9d4edd 0%, #7209b7 50%, #560bad 100%)',
  'gradient-tesla': 'linear-gradient(333deg, #3c3c3c, #6c6c6c, #9c9c9c)',
  'gradient-phi': 'linear-gradient(137.5deg, #d4af37, #c0c0c0)',
},

      animation: {
        'chakra-pulse': 'chakraPulse 3s infinite cubic-bezier(0.3, 0, 0.6, 1)',
        'chakra-shimmer': 'chakraShimmer 6s infinite cubic-bezier(0.3, 0, 0.3, 1)',
        'vortex-spin': 'vortexSpin 9s infinite linear',
        'hover-glow': 'hoverGlow 2s infinite alternate',
        'tesla-field': 'teslaField 9s infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'sacred-rotate': 'sacredRotate 20s linear infinite',
        'ethereal-drift': 'etherealDrift 15s ease-in-out infinite',
        'mystic-breathe': 'mysticBreathe 4s ease-in-out infinite',
      },
      keyframes: {
        chakraPulse: {
          '0%': { transform: 'scale(1)', opacity: 0.7 },
          '33.3%': { transform: 'scale(1.06)', opacity: 0.9 },
          '66.6%': { transform: 'scale(1.03)', opacity: 1 },
          '100%': { transform: 'scale(1)', opacity: 0.7 },
        },
        chakraShimmer: {
          '0%': { opacity: 0.6, filter: 'brightness(0.9)' },
          '33.3%': { opacity: 0.9, filter: 'brightness(1.1)' },
          '66.6%': { opacity: 1, filter: 'brightness(1.2)' },
          '100%': { opacity: 0.6, filter: 'brightness(0.9)' },
        },
        vortexSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '33.3%': { transform: 'rotate(120deg)' },
          '66.6%': { transform: 'rotate(240deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        hoverGlow: {
          '0%': { boxShadow: '0 0 5px rgba(255,255,255,0.2)' },
          '100%': { boxShadow: '0 0 15px rgba(255,255,255,0.4)' },
        },
        teslaField: {
          '0%, 100%': { opacity: 0.3 },
          '33%': { opacity: 0.6 },
          '66%': { opacity: 0.9 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.05)' },
        },
        sacredRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        etherealDrift: {
          '0%, 100%': { transform: 'translateX(0px) translateY(0px)' },
          '25%': { transform: 'translateX(10px) translateY(-5px)' },
          '50%': { transform: 'translateX(-5px) translateY(-10px)' },
          '75%': { transform: 'translateX(-10px) translateY(5px)' },
        },
        mysticBreathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(255, 255, 255, 0.2)',
        'glow-md': '0 0 20px rgba(255, 255, 255, 0.3)',
        'glow-lg': '0 0 30px rgba(255, 255, 255, 0.4)',
        'chakra-glow': '0 0 20px var(--chakra-glow-color, rgba(255, 255, 255, 0.3))',
        'tesla-3': '0 0 3px var(--chakra-color, rgba(255, 255, 255, 0.3))',
        'tesla-6': '0 0 6px var(--chakra-color, rgba(255, 255, 255, 0.3))',
        'tesla-9': '0 0 9px var(--chakra-color, rgba(255, 255, 255, 0.3))',
        'ethereal': '0 8px 32px rgba(157, 78, 221, 0.3)',
        'void': '0 8px 32px rgba(10, 10, 26, 0.8)',
        'mystical': '0 0 50px rgba(157, 78, 221, 0.2)',
        'rune-border': 'inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 20px rgba(157, 78, 221, 0.3)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      aspectRatio: {
        'golden': '1.618',
        'vesica': '1.732',
        'tesla': '0.333',
      },
      backgroundSize: {
        'pattern': '200px 200px',
      },
    },
  },
  plugins: [],
};