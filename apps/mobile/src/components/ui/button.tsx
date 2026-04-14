import type { ReactNode } from 'react'
import { ActivityIndicator, Pressable, Text } from 'react-native'

type ButtonVariant = 'default' | 'destructive' | 'ghost' | 'outline'

const containerVariants: Record<ButtonVariant, string> = {
	default: 'bg-primary border-primary',
	destructive: 'bg-destructive border-destructive',
	ghost: 'bg-transparent border-transparent',
	outline: 'bg-card border-border',
}

const textVariants: Record<ButtonVariant, string> = {
	default: 'text-primary-foreground',
	destructive: 'text-destructive-foreground',
	ghost: 'text-foreground',
	outline: 'text-foreground',
}

export function Button({
	children,
	className = '',
	disabled,
	fullWidth = false,
	loading = false,
	onPress,
	variant = 'default',
}: {
	children: ReactNode
	className?: string
	disabled?: boolean
	fullWidth?: boolean
	loading?: boolean
	onPress?: () => void
	variant?: ButtonVariant
}) {
	const isDisabled = disabled || loading

	return (
		<Pressable
			accessibilityRole="button"
			className={`min-h-11 flex-row items-center justify-center gap-2 rounded-2xl border px-4 py-3 active:opacity-80 ${
				containerVariants[variant]
			} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : ''} ${className}`}
			disabled={isDisabled}
			onPress={onPress}
		>
			{loading ? (
				<ActivityIndicator
					color={variant === 'default' || variant === 'destructive' ? '#ffffff' : '#1f2937'}
				/>
			) : null}
			{typeof children === 'string' ? (
				<Text className={`font-semibold text-base ${textVariants[variant]}`}>{children}</Text>
			) : (
				children
			)}
		</Pressable>
	)
}
