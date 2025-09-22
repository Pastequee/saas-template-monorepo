/** biome-ignore-all lint/performance/noBarrelFile: its needed here */

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

import type { AppRouter } from './root'

/**
 * Inference helpers for input types
 * @example
 * type TodoUpdateInput = RouterInputs['todo']['update']
 *      ^? { id: string, content: string, status: 'pending' | 'completed' }
 */
type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helpers for output types
 * @example
 * type AllTodosOutput = RouterOutputs['todo']['all']
 *      ^? Todo[]
 */
type RouterOutputs = inferRouterOutputs<AppRouter>

export { type AppRouter, appRouter } from './root'
export { createTRPCContext } from './trpc'
export type { RouterInputs, RouterOutputs }
