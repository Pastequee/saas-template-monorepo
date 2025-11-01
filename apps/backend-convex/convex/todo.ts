import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getUser } from './auth'
import { todoStatus } from './schema'

export const getTodos = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx)

    return await ctx.db
      .query('todos')
      .withIndex('userId', (q) => q.eq('userId', user._id))
      .collect()
  },
})

export const createTodo = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx)

    await ctx.db.insert('todos', {
      ...args,
      userId: user._id,
      status: 'pending',
    })
  },
})

export const updateTodo = mutation({
  args: {
    id: v.id('todos'),
    content: v.optional(v.string()),
    status: v.optional(todoStatus),
  },
  handler: async (ctx, { id, ...args }) => {
    const user = await getUser(ctx)

    const todo = await ctx.db.get(id)

    if (todo?.userId !== user._id) {
      throw new Error('Forbidden')
    }

    await ctx.db.patch(id, { ...args })
  },
})

export const deleteTodo = mutation({
  args: {
    id: v.id('todos'),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx)

    const todo = await ctx.db.get(args.id)

    if (todo?.userId !== user._id) {
      throw new Error('Forbidden')
    }

    await ctx.db.delete(args.id)
  },
})
