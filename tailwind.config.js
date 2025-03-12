/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./lib/**/*.{js,ts,jsx,tsx}",
        "./dist/**/*.js"
    ],
    theme: {
        extend: {},
    },
    plugins: [
        require('tailwind-merge'),
    ],
}