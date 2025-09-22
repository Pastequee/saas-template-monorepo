import { todoStatus, todos } from '@repo/db/schemas'
import { TRPCError, type TRPCRouterRecord } from '@trpc/server'
import { and, desc, eq } from 'drizzle-orm'
import z from 'zod'
import { protectedProcedure } from '../trpc'

export const todoRouter = {
  all: protectedProcedure.query(({ ctx }) =>
    ctx.db.query.todos.findMany({
      where: eq(todos.userId, ctx.session.user.id),
      orderBy: desc(todos.createdAt),
    })
  ),

  create: protectedProcedure
    .input(z.string().min(1).max(255))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(todos).values({
        content: input,
        userId: ctx.session.user.id,
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1).max(255),
        content: z.string().min(1).max(255).optional(),
        status: z.enum(todoStatus.enumValues).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const todo = await ctx.db.query.todos.findFirst({
        where: and(
          eq(todos.id, input.id),
          eq(todos.userId, ctx.session.user.id)
        ),
      })

      if (!todo) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      await ctx.db
        .update(todos)
        .set({
          content: input.content,
          status: input.status,
        })
        .where(eq(todos.id, input.id))
    }),

  delete: protectedProcedure
    .input(z.string().min(1).max(255))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(todos)
        .where(and(eq(todos.id, input), eq(todos.userId, ctx.session.user.id)))
    }),
} satisfies TRPCRouterRecord
