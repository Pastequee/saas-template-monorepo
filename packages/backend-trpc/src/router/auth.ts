import type { TRPCRouterRecord } from '@trpc/server'

import { publicProcedure } from '../trpc'

export const authRouter = {
  getSession: publicProcedure.query(({ ctx }) => ctx.session),
  getUsers: publicProcedure.query(({ ctx }) => ctx.prisma.todo.findMany()),
} satisfies TRPCRouterRecord
