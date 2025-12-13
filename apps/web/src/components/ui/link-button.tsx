import { Link, type LinkProps } from '@tanstack/react-router'
import { Button } from './button'

type LinkButtonProps = React.ComponentProps<typeof Button> & Pick<LinkProps, 'to'>

export const LinkButton = ({ children, to, ...props }: LinkButtonProps) => (
	<Link to={to}>
		<Button {...props}>{children}</Button>
	</Link>
)
