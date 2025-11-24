import { Link, type LinkProps } from '@tanstack/react-router'
import { Button } from './button'

type LinkButtonProps = React.ComponentProps<typeof Button> & Pick<LinkProps, 'to'>

export const LinkButton = ({ children, to, ...props }: LinkButtonProps) => (
  <Button {...props} asChild>
    <Link to={to}>{children}</Link>
  </Button>
)
