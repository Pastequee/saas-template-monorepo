import { useAuth } from '~/lib/hooks/use-auth'

type LoggedOutProps = {
	children: React.ReactNode
}

export const LoggedOut = ({ children }: LoggedOutProps) => {
	const auth = useAuth()

	if (auth) {
		return
	}

	return <>{children}</>
}
