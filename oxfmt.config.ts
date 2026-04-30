// oxlint-disable sort-keys
import { defineConfig } from 'oxfmt'
import ultracite from 'ultracite/oxfmt'

export default defineConfig({
	extends: [ultracite],

	printWidth: 100,
	tabWidth: 2,
	useTabs: true,
	semi: false,
	singleQuote: true,
	quoteProps: 'as-needed',
	jsxSingleQuote: false,
	trailingComma: 'es5',
	bracketSpacing: true,
	bracketSameLine: false,
	arrowParens: 'always',
	endOfLine: 'lf',

	sortTailwindcss: true,
	sortImports: {
		ignoreCase: true,
		newlinesBetween: true,
		order: 'asc',
	},
	sortPackageJson: true,

	ignorePatterns: ['apps/web/src/routeTree.gen.ts'],
})
