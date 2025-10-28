import { useAuth } from './auth-provider'

type LoggedInProps = {
  children: React.ReactNode
}

export const LoggedIn = ({ children }: LoggedInProps) => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return
  }

  return <>{children}</>
}
