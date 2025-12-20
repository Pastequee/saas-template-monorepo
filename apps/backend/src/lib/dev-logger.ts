import Elysia from 'elysia'
import { isProduction } from 'elysia/error'
import pc from 'picocolors'
import type { Formatter } from 'picocolors/types'

export const devLogger = () => {
	if (isProduction) return new Elysia({ name: 'dev-logger' })

	return new Elysia({ name: 'dev-logger' })
		.onRequest(({ store }) => {
			// @ts-expect-error - store is not typed
			store.requestStartTime = process.hrtime.bigint()
		})
		.onAfterResponse(({ set, request, store }) => {
			// @ts-expect-error - store is not typed
			const duration = (process.hrtime.bigint() - store.requestStartTime) / BigInt(1000) // nano to micro
			const url = new URL(request.url)
			const statusCode = Number(set.status ?? 500)

			const sign = statusCode >= 400 ? pc.red('✗') : pc.green('✓')
			const components = [
				pc.dim(`[${new Date().toLocaleString()}]`),
				sign,
				pc.bold(formatMethod(request.method)),
				url.pathname,
				pc.bold(formatStatus(statusCode)),
				pc.dim(formatDuration(duration)),
			]

			// biome-ignore lint/suspicious/noConsole: thats the whole point of this logger
			console.log(components.join(' '))
		})
		.as('global')
}

function formatStatus(statusCode: string | number | undefined): string {
	if (statusCode === undefined) return '???'

	const status = Number(statusCode)

	if (status < 300) return pc.green(status)
	if (status < 400) return pc.yellow(status)
	return pc.red(status)
}

const UNITS = ['µs', 'ms', 's']
const DURATION_FORMATTER = Intl.NumberFormat(undefined, {
	maximumFractionDigits: 2,
})

function formatDuration(duration: bigint): string {
	let unitIndex = 0
	while (duration >= 1000n && unitIndex < UNITS.length - 1) {
		duration /= 1000n
		unitIndex++
	}

	return `${DURATION_FORMATTER.format(Number(duration))}${UNITS[unitIndex]}`
}

const METHOD_COLOR_LUT: Record<string, Formatter> = {
	GET: pc.green,
	POST: pc.blue,
	PUT: pc.yellow,
	DELETE: pc.red,
	PATCH: pc.magenta,
	OPTIONS: pc.cyan,
	HEAD: pc.gray,
}

function formatMethod(method: string): string {
	const colorer = METHOD_COLOR_LUT[method.toUpperCase()]

	if (colorer) {
		return colorer(method)
	}

	return method
}
