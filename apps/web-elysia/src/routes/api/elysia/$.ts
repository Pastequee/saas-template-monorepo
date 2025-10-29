import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/elysia/$')({
  server: {
    handlers: {
      GET: () => new Response('Ok', { status: 200 }),
    },
  },
})
