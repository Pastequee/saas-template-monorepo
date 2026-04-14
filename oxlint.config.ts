import { defineConfig } from 'oxlint'
import core from 'ultracite/oxlint/core'
import react from 'ultracite/oxlint/react'
import remix from 'ultracite/oxlint/remix'

export default defineConfig({
	extends: [core, remix, react],
	overrides: [
		{
			files: ['packages/db/**/schemas/**/*.ts'],
			rules: {
				'eslint/sort-keys': 'off',
			},
		},
	],
	rules: {
		'eslint/func-style': 'off',
		'eslint/max-statements': 'off',
		'eslint/no-use-before-define': ['error', { functions: false }],
		'import/no-cycle': 'off',
		'import/no-relative-parent-imports': 'off',
		'jest/require-hook': 'off',
		'no-inline-comments': 'off',
		'react-perf/jsx-no-new-function-as-prop': 'off',
		'react/jsx-handler-names': 'off',
		'react/no-children-prop': 'off',
		'typescript/consistent-type-definitions': ['error', 'type'],
	},
})
