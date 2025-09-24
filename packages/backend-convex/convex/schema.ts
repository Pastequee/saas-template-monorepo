import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const todoStatus = v.union(v.literal('pending'), v.literal('completed'))

export default defineSchema({
  users: defineTable({
    email: v.string(),
  }),

  todos: defineTable({
    content: v.string(),
    status: todoStatus,
    userId: v.id('users'),
  }).index('userId', ['userId']),
})
