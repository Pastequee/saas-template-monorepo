import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './_generated/client'

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })
