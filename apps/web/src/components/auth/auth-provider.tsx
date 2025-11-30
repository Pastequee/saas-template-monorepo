import type React from 'react'
import { createContext, useContext } from 'react'
import type { BetterAuthContext } from '~/lib/auth-client'

type AuthState = {
	isAuthenticated: boolean
	user?: BetterAuthContext['user']
	session?: BetterAuthContext['session']
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({
	children,
	auth,
}: {
	children: React.ReactNode
	auth: BetterAuthContext | null
}) {
	return (
		<AuthContext.Provider
			value={{
				isAuthenticated: !!auth,
				user: auth ? auth.user : undefined,
				session: auth ? auth.session : undefined,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)

	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}

	return context
}
