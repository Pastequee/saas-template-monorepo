import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  schema: './src/schemas',
  dialect: 'postgresql',
  // biome-ignore lint/style/noNonNullAssertion:  its fine here
  dbCredentials: { url: process.env.DATABASE_URL! },
})
