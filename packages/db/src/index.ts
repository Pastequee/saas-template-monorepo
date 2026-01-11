import { env } from '@repo/env/server'
import { drizzle } from 'drizzle-orm/node-postgres'
import { relations } from './relations'
import * as schema from './schemas'

export const db = drizzle(env.DATABASE_URL, { relations, schema, casing: 'snake_case' })
