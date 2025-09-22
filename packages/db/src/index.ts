/** biome-ignore-all lint/performance/noNamespaceImport: not a problem here */

import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from './env'
import * as tables from './schemas'

export const db = drizzlePg({
  client: new Pool({ connectionString: env.DATABASE_URL }),
  schema: tables,
})
