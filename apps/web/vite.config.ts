import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		devtools({
			consolePiping: { enabled: false },
			enhancedLogs: { enabled: false },
		}),
		tanstackStart(),
		tailwindcss(),
		nitro({ preset: 'bun' }),
		react(),
	],
	resolve: {
		tsconfigPaths: true,
	},
})
