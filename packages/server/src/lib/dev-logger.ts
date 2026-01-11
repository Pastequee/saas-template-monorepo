import Elysia from 'elysia'
import { isProduction } from 'elysia/error'
import pc from 'picocolors'
import type { Formatter } from 'picocolors/types'

export const devLogger = () => {
	if (isProduction) return new Elysia({ name: 'dev-logger' })

	return new Elysia({ name: 'dev-logger' })
		.derive(() => ({ requestStartTime: process.hrtime.bigint() }))
		.onAfterResponse(({ set, request, path, responseValue, requestStartTime }) => {
			const duration = (process.hrtime.bigint() - requestStartTime) / BigInt(1000) // nano to micro
			const responseStatus = extractStatusIfExists(responseValue)
			const statusCode = responseStatus ?? set.status ?? '???'

			const components = [
				pc.dim(`[${new Date().toLocaleString()}]`),
				formatSign(statusCode),
				pc.bold(formatMethod(request.method)),
				path,
				pc.bold(formatStatus(statusCode)),
				pc.dim(formatDuration(duration)),
			]

			// biome-ignore lint/suspicious/noConsole: thats the whole point of this logger
			console.log(components.join(' '))
		})
		.as('global')
}

function formatStatus(statusCode: string | number): string {
	const status = Number(statusCode)

	if (Number.isNaN(status)) return pc.red(status)

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

function extractStatusIfExists(response: unknown) {
	if (
		typeof response === 'object' &&
		response &&
		'status' in response &&
		typeof response.status === 'number'
	) {
		return response.status
	}

	return null
}

function formatSign(status: number | string) {
	const statusCode = Number(status)

	// If the status code is not a number there is some kind of error
	if (Number.isNaN(statusCode)) return pc.red('✗')

	// Special sign for Not found
	if (statusCode === 404) return pc.red('?')

	// Special sign for Unauthorized and Forbidden
	if (statusCode === 401 || statusCode === 403) return pc.red('🔒')

	// All 2XX status codes are marked as good
	if (statusCode < 300) return pc.green('✓')

	// All 3XX status codes are marked as weird
	if (statusCode < 400) return pc.yellow('~')

	// All other status codes 4XX and 5XX are marked as errors
	return pc.red('✗')
}
