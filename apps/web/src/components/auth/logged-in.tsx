import { useAuth } from '~/lib/hooks/use-auth'

type LoggedInProps = {
	children: React.ReactNode
}

export const LoggedIn = ({ children }: LoggedInProps) => {
	const auth = useAuth()

	if (!auth) {
		return
	}

	return <>{children}</>
}
