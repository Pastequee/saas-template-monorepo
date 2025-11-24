import { db } from '@repo/db-prisma'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { openAPI } from 'better-auth/plugins'
import { env } from './env'

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: 'postgresql', usePlural: true }),
  emailAndPassword: { enabled: true },
  trustedOrigins: [env.FRONTEND_URL],
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
  experimental: {
    joins: true,
  },
  plugins: [openAPI()],
})

export type Auth = typeof auth

export default auth
