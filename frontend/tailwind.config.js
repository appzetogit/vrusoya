/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                brand: ["'Baloo 2'", "cursive"],
            },
            colors: {
                primary: '#39B54A',    // Natural Green
                secondary: '#3BA4CC',  // Dairy Blue
                background: '#F8FCFF', // Milk White
                textPrimary: '#2C2C2C',// Dark Charcoal
                accent: '#8EDB8F',     // Fresh Leaf
                footerBg: '#2C2C2C', // Map footerBg to Dark Charcoal to override previous brown/footer color
            }
        },
    },
    plugins: [],
}
