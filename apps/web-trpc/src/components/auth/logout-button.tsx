'use client'

import { useRouter } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { authClient } from '~/lib/auth-client'

export const LogoutButton = () => {
  const router = useRouter()

  const handleLogout = async () => {
    await authClient.signOut()
    router.navigate({ to: '/login', replace: true })
  }

  return <Button onClick={handleLogout}>Logout</Button>
}
