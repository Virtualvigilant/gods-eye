import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                surveillance: {
                    deepest: "#050810",
                    deep: "#0a0f1c",
                    elevated: "#111827",
                    surface: "#1e293b",
                    cyan: "#00f0ff",
                    magenta: "#ff006e",
                    amber: "#ffbe0b",
                    success: "#00ff88",
                    danger: "#ff0044",
                    warning: "#ffcc00",
                    teal: "#4a9eff",
                    blue: "#0066ff",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            fontFamily: {
                mono: ["JetBrains Mono", "Fira Code", "SF Mono", "monospace"],
                display: ["Rajdhani", "system-ui", "sans-serif"],
                body: ["Inter", "system-ui", "sans-serif"],
            },
            animation: {
                "scanline-drift": "scanline-drift 8s linear infinite",
                "pulse-ring": "pulse-ring 2s ease-out infinite",
                "radar-sweep": "radar-sweep 4s linear infinite",
                "glitch": "glitch 0.3s ease-in-out",
                "flicker": "flicker 3s linear infinite",
                "data-scroll": "data-scroll 20s linear infinite",
            },
            keyframes: {
                "scanline-drift": {
                    "0%": { transform: "translateY(0)" },
                    "100%": { transform: "translateY(4px)" },
                },
                "pulse-ring": {
                    "0%": { transform: "scale(1)", opacity: "0.8" },
                    "100%": { transform: "scale(2)", opacity: "0" },
                },
                "radar-sweep": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                },
                "glitch": {
                    "0%, 100%": { transform: "translate(0)" },
                    "20%": { transform: "translate(-2px, 2px)" },
                    "40%": { transform: "translate(-2px, -2px)" },
                    "60%": { transform: "translate(2px, 2px)" },
                    "80%": { transform: "translate(2px, -2px)" },
                },
                "flicker": {
                    "0%, 95%, 100%": { opacity: "1" },
                    "96%": { opacity: "0.4" },
                    "97%": { opacity: "1" },
                    "98%": { opacity: "0.2" },
                    "99%": { opacity: "1" },
                },
                "data-scroll": {
                    "0%": { transform: "translateY(0)" },
                    "100%": { transform: "translateY(-50%)" },
                },
            },
            boxShadow: {
                "glow-cyan": "0 0 5px rgba(0,240,255,0.5), 0 0 20px rgba(0,240,255,0.2), 0 0 40px rgba(0,240,255,0.1)",
                "glow-magenta": "0 0 5px rgba(255,0,110,0.5), 0 0 20px rgba(255,0,110,0.2)",
                "glow-amber": "0 0 5px rgba(255,190,11,0.5), 0 0 20px rgba(255,190,11,0.2)",
                "glow-danger": "0 0 5px rgba(255,0,68,0.5), 0 0 20px rgba(255,0,68,0.2)",
            },
        },
    },
    plugins: [],
};

export default config;