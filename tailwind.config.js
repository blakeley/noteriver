import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				gray: colors.neutral,
				primary: {
					50: '#ecf7ff',
					100: '#c3e7ff',
					200: '#97d6ff',
					300: '#64c4ff',
					400: '#36b1f5',
					500: '#009ee2',
					600: '#0081ba',
					700: '#005c86',
					800: '#003854',
					900: '#001b2b'
				}
			},
			textShadow: {
				sm: '0 1px 2px rgba(0,0,0,0.25)',
				DEFAULT: '0 2px 4px rgba(0,0,0,0.25)',
				md: '0 0 2px rgba(0,0,0,0.5)',
				lg: '0 8px 16px rgba(0,0,0,0.25)'
			}
		}
	},
	plugins: []
};
