import { env } from '@repo/env/web'

import googleIcon from '~/assets/google.svg'
import { Button } from '~/components/ui/button'
import { authClient } from '~/lib/clients/auth-client'
import { DEFAULT_ERROR_MESSAGE } from '~/lib/utils/constants'

type GoogleSignInButtonProps = {
	onError: (error: string) => void
}

export const GoogleSignInButton = ({ onError }: GoogleSignInButtonProps) => {
	const handleSocialSignIn = async ({ provider }: { provider: 'google' }) => {
		const { error } = await authClient.signIn.social({
			callbackURL: env.VITE_FRONTEND_URL,
			provider,
		})

		if (error) {
			onError(error.message ?? DEFAULT_ERROR_MESSAGE)
		}
	}

	return (
		<Button
			className="w-full"
			onClick={() => handleSocialSignIn({ provider: 'google' })}
			variant="outline"
		>
			<img alt="Google" className="size-4" height={16} src={googleIcon} width={16} />
			Continuer avec Google
		</Button>
	)
}
