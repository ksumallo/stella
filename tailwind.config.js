module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-quicksand)'],
            },
            backgroundImage: {
                'blackboard': 'linear-gradient(to bottom, #70BD73, #2F7731)'
            },
            animation: {
                fadeIn: 'fadeIn 0.3s ease-in-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        }
    },
    plugins: []
}