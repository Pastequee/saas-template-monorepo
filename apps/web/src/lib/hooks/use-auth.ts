import { useNavigate, useRouteContext } from '@tanstack/react-router'
import { authClient } from '../clients/auth-client'

export const useAuth = () => {
	const { auth, queryClient } = useRouteContext({ from: '__root__' })
	const navigate = useNavigate()

	const logout = async () => {
		await authClient.signOut()
		queryClient.clear()
		navigate({ to: '/login' })
	}

	if (!auth) return null

	return { ...auth, isAuthenticated: !!auth, logout }
}
