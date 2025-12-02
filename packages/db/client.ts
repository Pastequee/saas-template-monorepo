import { PrismaPg } from '@prisma/adapter-pg'
import { env } from './env.js'
import { PrismaClient } from './generated/prisma/client.js'

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })
export const prisma = new PrismaClient({ adapter })

export const db = prisma
