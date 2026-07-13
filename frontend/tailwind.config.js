/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0B0F",
        surface: "#12141C",
        surface2: "#181B26",
        line: "#242737",
        ink: "#E8E9ED",
        muted: "#8B8FA3",
        signal: "#7C6FF0", // electric indigo — primary
        synapse: "#22D3EE", // cyan — secondary / active node
        pulse: "#F5A623", // amber — warnings / running state
        good: "#3DDC97", // success
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        node: "0 0 0 1px rgba(124,111,240,0.25), 0 0 24px rgba(124,111,240,0.15)",
      },
      animation: {
        firing: "firing 1.4s ease-in-out infinite",
      },
      keyframes: {
        firing: {
          "0%, 100%": { opacity: 0.5, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.08)" },
        },
      },
    },
  },
  plugins: [],
};
