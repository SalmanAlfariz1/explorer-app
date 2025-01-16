/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import flowbitePlugin from 'flowbite/plugin';

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/flowbite/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [forms, flowbitePlugin],
};
