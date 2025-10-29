/** biome-ignore-all lint/suspicious/noExplicitAny: skip for now */

import { type Treaty, treaty } from '@elysiajs/eden'
import type { App } from '@repo/backend-elysia'
import {
  mutationOptions,
  type QueryKey,
  queryOptions,
  type UndefinedInitialDataOptions,
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import { env } from './env'

export const apiClient = treaty<App>(env.VITE_SERVER_URL)

export type ApiClient = typeof apiClient

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

export function useEdenQuery<
  TEdenQueryFn extends EdenQueryFn,
  TData = ExtractData<Awaited<ReturnType<TEdenQueryFn>>>,
  TError = ExtractError<Awaited<ReturnType<TEdenQueryFn>>>,
>({
  edenQuery,
  edenOptions,
  ...options
}: Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryFn'> & {
  edenQuery: TEdenQueryFn
  edenOptions?: ExtractOptions<TEdenQueryFn>
}) {
  return useQuery({
    queryFn: async () => {
      const { data, error } = await edenQuery({}, edenOptions)
      if (error) throw error
      return data
    },
    ...options,
  })
}

export function edenQueryOption<
  TEdenQueryFn extends EdenQueryFn,
  TData = ExtractData<Awaited<ReturnType<TEdenQueryFn>>>,
  TError = ExtractError<Awaited<ReturnType<TEdenQueryFn>>>,
>({
  edenQuery,
  edenOptions,
  ...options
}: Omit<
  UndefinedInitialDataOptions<TData, TError, TData, QueryKey>,
  'queryFn'
> & {
  edenQuery: TEdenQueryFn
  edenOptions?: ExtractOptions<TEdenQueryFn>
}) {
  return { ...queryOptions(options), edenOptions, edenQuery }
}

export function useEdenMutation<
  TEdenQueryFn extends EdenQueryFn,
  TData = NonNullable<ExtractData<Awaited<ReturnType<TEdenQueryFn>>>>,
  TError = ExtractError<Awaited<ReturnType<TEdenQueryFn>>>,
  TOnMutateResult = unknown,
>({
  edenMutation,
  edenOptions,
  ...options
}: Omit<
  UseMutationOptions<
    TData,
    TError,
    Parameters<TEdenQueryFn>[0],
    TOnMutateResult
  >,
  'mutationFn'
> & {
  edenMutation: TEdenQueryFn
  edenOptions?: ExtractOptions<TEdenQueryFn>
}) {
  return useMutation({
    mutationFn: async (body: Parameters<TEdenQueryFn>[0]) => {
      const { data, error } = await edenMutation(body, edenOptions)
      if (error) throw error
      return data
    },
    ...options,
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
  UseMutationOptions<
    TData,
    TError,
    Parameters<TEdenQueryFn>[0],
    TOnMutateResult
  >,
  'mutationFn'
> & {
  edenMutation: TEdenQueryFn
  edenOptions?: ExtractOptions<TEdenQueryFn>
}) {
  return { ...mutationOptions(options), edenOptions, edenMutation }
}
