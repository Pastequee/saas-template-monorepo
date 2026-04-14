import { Text, View } from 'react-native'

import { Button } from './button'

export function LoadingState({ label = 'Chargement...' }: { label?: string }) {
	return (
		<View className="items-center justify-center rounded-[24px] border border-dashed border-border bg-card px-6 py-10">
			<Text className="text-base text-muted-foreground">{label}</Text>
		</View>
	)
}

export function EmptyState({
	actionLabel,
	description,
	onActionPress,
	title,
}: {
	actionLabel?: string
	description: string
	onActionPress?: () => void
	title: string
}) {
	return (
		<View className="items-center rounded-[24px] border border-dashed border-border bg-card px-6 py-10">
			<Text className="text-center font-semibold text-foreground text-lg">{title}</Text>
			<Text className="mt-2 text-center text-muted-foreground">{description}</Text>
			{actionLabel && onActionPress ? (
				<Button className="mt-5" onPress={onActionPress} variant="outline">
					{actionLabel}
				</Button>
			) : null}
		</View>
	)
}
