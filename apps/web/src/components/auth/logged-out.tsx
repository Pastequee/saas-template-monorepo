import { useAuth } from './auth-provider'

type LoggedOutProps = {
	children: React.ReactNode
}

export const LoggedOut = ({ children }: LoggedOutProps) => {
	const { isAuthenticated } = useAuth()

	if (isAuthenticated) {
		return
	}

	return <>{children}</>
}
