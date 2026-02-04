/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Verified Premium Palette
                gold: {
                    DEFAULT: '#C5A059', // Classic Gold
                    light: '#E5C579',   // Highlight
                    dark: '#9E7E3C',    // Shadow
                    rich: '#B08D4B',    // Metallic feel
                },
                coffee: {
                    DEFAULT: '#2C1E14', // Deep Yemeni Coffee
                    light: '#3E2D22',
                    dark: '#1A110B',
                },
                cream: {
                    DEFAULT: '#F9F7F5', // Sand/Limestone
                    soft: '#F5F5F0',
                },
                // Functional Semantic Colors
                primary: {
                    DEFAULT: '#2C1E14', // Primary text/bg depends on context, usually Coffee
                    foreground: '#F9F7F5',
                },
                secondary: {
                    DEFAULT: '#F9F7F5',
                    foreground: '#2C1E14',
                },
                accent: {
                    DEFAULT: '#C5A059',
                    foreground: '#FFFFFF',
                },
                border: {
                    light: '#E5E7EB',
                    subtle: 'rgba(197, 160, 89, 0.2)', // Subtle Gold Border
                }
            },
            fontFamily: {
                sans: ['Outfit', 'system-ui', 'sans-serif'], // Modern Premium
                serif: ['Playfair Display', 'Georgia', 'serif'], // Heritage
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(44, 30, 20, 0.05)', // Warm shadow
                'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
                'elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                'glow': '0 0 20px rgba(197, 160, 89, 0.15)', // Gold Glow
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out forwards',
                'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'slow-zoom': 'slowZoom 10s linear infinite alternate',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slowZoom: {
                    '0%': { transform: 'scale(1)' },
                    '100%': { transform: 'scale(1.05)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
