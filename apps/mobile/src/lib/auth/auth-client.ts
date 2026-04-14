import { expoClient } from '@better-auth/expo/client'
import { createAuthClient } from 'better-auth/react'
import constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'

import { env } from '~/lib/env'

export const authClient = createAuthClient({
	baseURL: env.EXPO_PUBLIC_SERVER_URL,
	plugins: [
		expoClient({
			scheme: constants.expoConfig?.scheme as string,
			storage: SecureStore,
			storagePrefix: constants.expoConfig?.scheme as string,
		}),
	],
})

export type AuthSession = typeof authClient.$Infer.Session
