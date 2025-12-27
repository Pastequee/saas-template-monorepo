/** biome-ignore-all lint/suspicious/noExplicitAny: needed for complex types */

import { type Treaty, treaty } from '@elysiajs/eden'
import type { App } from '@repo/backend'
import { env } from '@repo/env/web'
import {
	isServer,
	mutationOptions,
	type QueryKey,
	queryOptions,
	type UndefinedInitialDataOptions,
	type UseMutationOptions,
} from '@tanstack/react-query'

type TreatyResponse = Treaty.TreatyResponse<Record<number, any>>

export const eden = treaty<App>(env.VITE_BACKEND_URL, {
	fetch: {
		credentials: 'include',
	},
	// On the server, since we're making API calls on behalf of the client,
	// we need to forward the headers from the client request to the backend
	onRequest: async () => {
		if (!isServer) return

		const { getRequestHeaders } = await import('@tanstack/react-start/server')
		const headers = getRequestHeaders()
		return { headers }
	},
})

type EdenQueryFn =
	| ((body?: any, options?: any) => Promise<TreatyResponse>)
	| ((options?: any) => Promise<TreatyResponse>)

type ExtractData<T> = T extends { data: infer D; error: null } ? D : never
type ExtractError<T> = T extends { error: infer E; data: null } ? E : never

type CountParameters<TFn extends EdenQueryFn> = Parameters<TFn>['length']

type ExtractOptions<TEdenQueryFn extends EdenQueryFn> =
	CountParameters<TEdenQueryFn> extends 0 | 1
		? Parameters<TEdenQueryFn>[0]
		: Parameters<TEdenQueryFn>[1]

export function edenQueryOption<
	TEdenQueryFn extends EdenQueryFn,
	TData = ExtractData<Awaited<ReturnType<TEdenQueryFn>>>,
	TError = ExtractError<Awaited<ReturnType<TEdenQueryFn>>>,
>({
	edenQuery,
	edenOptions,
	...options
}: Omit<UndefinedInitialDataOptions<TData, TError, TData, QueryKey>, 'queryFn'> & {
	edenQuery: TEdenQueryFn
	edenOptions?: ExtractOptions<TEdenQueryFn>
}) {
	return queryOptions({
		...options,
		queryFn: async () => {
			const { data, error } = await edenQuery(edenOptions)
			if (error) throw error
			return data
		},
	})
}

export function edenMutationOption<
	TEdenQueryFn extends EdenQueryFn,
	TData = ExtractData<Awaited<ReturnType<TEdenQueryFn>>>,
	TError = ExtractError<Awaited<ReturnType<TEdenQueryFn>>>,
	TOnMutateResult = unknown,
>({
	edenMutation,
	edenOptions,
	...options
}: Omit<
	UseMutationOptions<TData, TError, Parameters<TEdenQueryFn>[0], TOnMutateResult>,
	'mutationFn'
> & {
	edenMutation: TEdenQueryFn
	edenOptions?: ExtractOptions<TEdenQueryFn>
}) {
	return mutationOptions({
		...options,
		mutationFn: async (body: Parameters<TEdenQueryFn>[0]) => {
			const { data, error } = await edenMutation(body, edenOptions)
			if (error) throw error
			return data
		},
	})
}
