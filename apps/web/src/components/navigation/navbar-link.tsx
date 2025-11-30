import { type LinkProps, useLocation } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { LinkButton } from '../ui/link-button'

type NavbarLinkProps = LinkProps & {
	children: React.ReactNode
	className?: string
}

export const NavbarLink = ({ children, ...props }: NavbarLinkProps) => {
	const pathname = useLocation({
		select: (location) => location.pathname,
	})

	if (pathname === props.to) return null

	return (
		<LinkButton {...props}>
			{children}
			<ArrowRight />
		</LinkButton>
	)
}
