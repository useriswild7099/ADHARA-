/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        surface: "#121215",
        "surface-card": "rgba(18, 18, 21, 0.85)",
        border: "#27272a",
        "border-muted": "rgba(255, 255, 255, 0.08)",
        foreground: "#fafafa",
        muted: "#18181b",
        "muted-foreground": "#a1a1aa",
        primary: {
          DEFAULT: "#00d4ff",
          dark: "#0284c7",
          foreground: "#09090b"
        },
        accent: {
          DEFAULT: "#f59e0b",
          foreground: "#09090b"
        },
        success: {
          DEFAULT: "#10b981",
          foreground: "#09090b"
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#fafafa"
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["Geist Mono", "Fira Code", "Courier New", "monospace"]
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px"
      },
      animation: {
        "radar-sweep": "sweepRadar 4s linear infinite",
        "azimuth-spin": "rotateDial 240s linear infinite",
        "pulse-dot": "pulseDot 1.5s infinite"
      },
      keyframes: {
        sweepRadar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        rotateDial: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        pulseDot: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.3, transform: "scale(0.8)" }
        }
      }
    }
  },
  plugins: []
}
