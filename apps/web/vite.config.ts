import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
	plugins: [
		tsConfigPaths({ projects: ['./tsconfig.json'] }),
		tanstackStart(),
		nitro({ preset: 'bun', output: { dir: 'dist' } }),
		tailwindcss(),
		react(),
	],
})
