/** biome-ignore-all lint/style/noNonNullAssertion: need to find an alternative */

import {
  type AuthFunctions,
  createClient,
  type GenericCtx,
} from '@convex-dev/better-auth'
import { convex } from '@convex-dev/better-auth/plugins'
import { betterAuth } from 'better-auth'
import { asyncMap, withoutSystemFields } from 'convex-helpers'
import { components, internal } from './_generated/api'
import type { DataModel } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'

const siteUrl = process.env.SITE_URL!
const betterAuthSecret = process.env.BETTER_AUTH_SECRET!

const authFunctions: AuthFunctions = internal.auth

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth, {
  authFunctions,
  triggers: {
    user: {
      onCreate: async (ctx, authUser) => {
        await ctx.db.insert('users', {
          email: authUser.email,
          authId: authUser._id,
        })
      },
      onUpdate: async (ctx, authUser, prevAuthUser) => {
        if (authUser.email === prevAuthUser.email) return
        const user = await ctx.db
          .query('users')
          .withIndex('authId', (q) => q.eq('authId', authUser._id))
          .unique()
        if (!user) return
        await ctx.db.patch(user._id, { email: authUser.email })
      },
      onDelete: async (ctx, authUser) => {
        const user = await ctx.db
          .query('users')
          .withIndex('authId', (q) => q.eq('authId', authUser._id))
          .unique()
        if (!user) return
        // Cleanup everything regarding the user here
        const todos = await ctx.db
          .query('todos')
          .withIndex('userId', (q) => q.eq('userId', user._id))
          .collect()
        await asyncMap(todos, async (todo) => {
          await ctx.db.delete(todo._id)
        })
        await ctx.db.delete(user._id)
      },
    },
  },
})

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false }
) => {
  return betterAuth({
    // disable logging when createAuth is called just to generate options.
    // this is not required, but there's a lot of noise in logs without it.
    secret: betterAuthSecret,
    logger: {
      disabled: optionsOnly,
    },
    trustedOrigins: [siteUrl],
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),

    // Configure simple, non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      autoSignIn: false,
      requireEmailVerification: false,
    },

    plugins: [
      // The Convex plugin is required for Convex compatibility
      convex(),
    ],
  })
}

export const safeGetUser = async (ctx: QueryCtx) => {
  const authUser = await authComponent.safeGetAuthUser(ctx)
  if (!authUser) return null

  const user = await ctx.db
    .query('users')
    .withIndex('authId', (q) => q.eq('authId', authUser._id))
    .unique()
  if (!user) return null

  return { ...user, ...withoutSystemFields(authUser) }
}

export const getUser = async (ctx: QueryCtx) => {
  const user = await safeGetUser(ctx)

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi()
