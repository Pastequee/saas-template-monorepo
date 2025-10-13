import { TodoStatus } from '@repo/db-prisma'
import { TRPCError, type TRPCRouterRecord } from '@trpc/server'
import z from 'zod'
import { protectedProcedure } from '../trpc'

export const todoRouter = {
  all: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.todo.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  ),

  create: protectedProcedure
    .input(z.string().min(1).max(255))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.todo.create({
        data: {
          content: input,
          userId: ctx.session.user.id,
        },
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1).max(255),
        content: z.string().min(1).max(255).optional(),
        status: z.enum(TodoStatus).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const todo = await ctx.prisma.todo.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      })

      if (!todo) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      await ctx.prisma.todo.update({
        where: {
          id: input.id,
        },
        data: {
          content: input.content,
          status: input.status,
        },
      })
    }),

  delete: protectedProcedure
    .input(z.string().min(1).max(255))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.todo.delete({
        where: {
          id: input,
          userId: ctx.session.user.id,
        },
      })
    }),
} satisfies TRPCRouterRecord
