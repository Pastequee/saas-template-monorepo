// oxlint-disable typescript/no-explicit-any

import type { Treaty } from '@elysiajs/eden'
import { mutationOptions, queryOptions } from '@tanstack/react-query'
import type {
	UndefinedInitialDataOptions,
	UseMutationOptions,
	UseQueryOptions,
} from '@tanstack/react-query'

type TreatyResponse = Treaty.TreatyResponse<Record<number, any>>

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

type IsOptional<T> = undefined extends T ? true : false

type EdenQueryOptionsProps<
	TEdenQueryFn extends EdenQueryFn,
	TData = ExtractData<Awaited<ReturnType<TEdenQueryFn>>>,
	TError = ExtractError<Awaited<ReturnType<TEdenQueryFn>>>,
> = UndefinedInitialDataOptions<TData, TError, TData> & {
	edenQuery: TEdenQueryFn
} & (IsOptional<ExtractOptions<TEdenQueryFn>> extends true
		? { edenOptions?: ExtractOptions<TEdenQueryFn> }
		: { edenOptions: ExtractOptions<TEdenQueryFn> })

export function edenQueryOption<
	TEdenQueryFn extends EdenQueryFn,
	TData = ExtractData<Awaited<ReturnType<TEdenQueryFn>>>,
	TError = ExtractError<Awaited<ReturnType<TEdenQueryFn>>>,
>({
	edenQuery,
	edenOptions,
	...options
}: EdenQueryOptionsProps<TEdenQueryFn, TData, TError>): UseQueryOptions<TData, TError, TData> {
	return queryOptions({
		...options,
		queryFn: async () => {
			const response = await edenQuery(edenOptions)

			if (response.error) {
				// oxlint-disable-next-line typescript/only-throw-error
				throw response.error
			}

			// oxlint-disable-next-line typescript/no-unsafe-return
			return response.data
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
			const response = await edenMutation(body, edenOptions)

			if (response.error) {
				// oxlint-disable-next-line typescript/only-throw-error
				throw response.error
			}

			// oxlint-disable-next-line typescript/no-unsafe-return
			return response.data
		},
	})
}
