import { drizzle } from 'drizzle-orm/node-postgres'
import { env } from './env'
import { relations } from './relations'
import * as schema from './schemas'

export const db = drizzle(env.DATABASE_URL, { relations, schema, casing: 'snake_case' })
