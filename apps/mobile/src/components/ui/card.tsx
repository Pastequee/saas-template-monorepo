import type { ReactNode } from 'react'
import { Text, View } from 'react-native'

export function Card({
	children,
	className = '',
}: {
	children: ReactNode
	className?: string
}) {
	return (
		<View className={`rounded-[24px] border border-border bg-card p-5 shadow-sm ${className}`}>
			{children}
		</View>
	)
}

export function CardTitle({ children }: { children: ReactNode }) {
	return <Text className="font-semibold text-2xl text-foreground">{children}</Text>
}

export function CardDescription({ children }: { children: ReactNode }) {
	return <Text className="mt-2 text-muted-foreground text-sm">{children}</Text>
}
