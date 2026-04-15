import { Button } from '~/components/ui/button'
import { useAuth } from '~/lib/hooks/use-auth'

export const LogoutButton = () => {
	const auth = useAuth()

	return <Button onClick={() => void auth?.logout()}>Logout</Button>
}
