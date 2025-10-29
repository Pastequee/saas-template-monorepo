import { app } from '@repo/backend-elysia'
import { createFileRoute } from '@tanstack/react-router'

const handle = ({ request }: { request: Request }) => app.fetch(request)

export const Route = createFileRoute('/api/$')({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
      DELETE: handle,
      PATCH: handle,
      OPTIONS: handle,
      HEAD: handle,
    },
  },
})
