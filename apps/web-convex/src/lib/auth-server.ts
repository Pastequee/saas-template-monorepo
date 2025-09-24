import { setupFetchClient } from '@convex-dev/better-auth/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { createAuth } from '../../../../packages/backend-convex/convex/auth'

export const { fetchQuery, fetchMutation, fetchAction } =
  await setupFetchClient(createAuth, getCookie)
