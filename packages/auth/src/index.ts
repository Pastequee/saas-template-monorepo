import { db } from '@repo/db-prisma'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { openAPI } from 'better-auth/plugins'
import { randomUUIDv7 } from 'bun'
import { env } from './env'

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true },
  trustedOrigins: [env.FRONTEND_URL],
  advanced: {
    database: {
      generateId: () => randomUUIDv7(),
    },
  },
  experimental: {
    joins: true,
  },
  plugins: [openAPI()],
})

export type Auth = typeof auth

export default auth
