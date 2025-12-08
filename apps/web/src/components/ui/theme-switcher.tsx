import { type LucideIcon, Monitor, Moon, Sun } from 'lucide-react'
import { motion } from 'motion/react'
import { type Theme, useTheme } from '~/lib/clients/theme-client'
import { cn } from '~/lib/utils/cn'

const themes: {
	key: Theme
	icon: LucideIcon
	label: string
}[] = [
	{ key: 'system', icon: Monitor, label: 'System theme' },
	{ key: 'light', icon: Sun, label: 'Light theme' },
	{ key: 'dark', icon: Moon, label: 'Dark theme' },
]

export type ThemeSwitcherProps = {
	className?: string
	iconSize?: number
}

export const ThemeSwitcher = ({ className, iconSize = 16 }: ThemeSwitcherProps) => {
	const { theme, setTheme } = useTheme()

	return (
		<div
			className={cn(
				'relative isolate flex rounded-full bg-background p-1 ring-1 ring-border',
				className
			)}
		>
			{themes.map(({ key, icon: Icon, label }) => {
				const isActive = theme === key
				return (
					<button
						aria-label={label}
						className="relative rounded-full p-1.5"
						key={key}
						onClick={() => setTheme(key)}
						type="button"
					>
						{isActive && (
							<motion.div
								className="absolute inset-0 rounded-full bg-secondary"
								layoutId="activeTheme"
								transition={{ type: 'spring', duration: 0.5 }}
							/>
						)}
						<Icon
							className={cn(
								'relative z-10',
								isActive ? 'text-foreground' : 'text-muted-foreground'
							)}
							size={iconSize}
						/>
					</button>
				)
			})}
		</div>
	)
}
