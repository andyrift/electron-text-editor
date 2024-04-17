module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "app-primary": "#b030ff",
        "app-primary-darker": "#942bd6",
        "app-secondary": "#5b4469",
      },
      boxShadow: {
        'uni': '0px 0px 4px 1px rgba(0, 0, 0, 0.1)',
        'unilg': '0px 2px 8px 2px rgba(0, 0, 0, 0.1)',
        'unixl': '0px 4px 12px 4px rgba(0, 0, 0, 0.1)',
      }
    },
    fontFamily: {
      //Roboto: ["Roboto, sans-serif"],
    },
  },
  safelist: [
    {
      pattern: /bg-(red|green|blue|gray|yellow|orange|pink|purple|cyan)-300/,
    },
    'bg-transparent'
  ],
}