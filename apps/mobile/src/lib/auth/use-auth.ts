import { useRouter } from 'expo-router'

import { queryClient } from '~/lib/query/query-client'

import { authClient } from './auth-client'

export const useAuth = () => {
	const router = useRouter()
	const session = authClient.useSession()

	const logout = async () => {
		await authClient.signOut()
		queryClient.clear()
		router.replace('/login')
	}

	return {
		error: session.error,
		isAuthenticated: Boolean(session.data),
		isPending: session.isPending,
		logout,
		session: session.data?.session ?? null,
		user: session.data?.user ?? null,
	}
}
