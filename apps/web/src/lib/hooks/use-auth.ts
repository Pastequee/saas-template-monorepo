import { useRouteContext } from '@tanstack/react-router'

export const useAuth = () => {
	const { auth } = useRouteContext({ from: '__root__' })

	return auth
}
