/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./electron/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                maritime: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    500: '#0ea5e9',
                    800: '#075985',
                    900: '#0c4a6e',
                }
            }
        }
    },
    plugins: [],
}
