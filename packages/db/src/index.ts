import { drizzle } from 'drizzle-orm/node-postgres'
import { env } from './env'
import * as schema from './schemas'

export const db = drizzle({
  connection: { connectionString: env.DATABASE_URL },
  schema,
})
