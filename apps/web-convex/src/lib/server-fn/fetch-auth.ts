/** biome-ignore-all lint/suspicious/noTsIgnore: needed for import */

import {
  fetchSession,
  getCookieName,
} from '@convex-dev/better-auth/react-start'
import { createServerFn } from '@tanstack/react-start'
import { getCookie, getRequest } from '@tanstack/react-start/server'

// Get auth information for SSR using available cookies
export const fetchAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const { createAuth } = await import(
    // @ts-ignore
    '../../../../../packages/backend-convex/convex/auth'
  )
  const { session } = await fetchSession(getRequest())

  const sessionCookieName = getCookieName(createAuth)

  const token = getCookie(sessionCookieName)

  return {
    auth: session,
    token,
  }
})
