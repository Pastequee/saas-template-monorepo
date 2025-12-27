import { env } from '@repo/env/backend'
import { drizzle } from 'drizzle-orm/node-postgres'
import { relations } from './relations'
import * as schema from './schemas'

export const db = drizzle(env.DATABASE_URL, { relations, schema, casing: 'snake_case' })
