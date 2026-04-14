import { Text, View } from 'react-native'

import { APP_NAME } from '~/lib/constants'

import { Button } from '../ui/button'

export function AppShellHeader({
	actionLabel,
	onActionPress,
	subtitle,
	title,
}: {
	actionLabel?: string
	onActionPress?: () => void
	subtitle?: string
	title?: string
}) {
	return (
		<View className="flex-row items-center gap-4">
			<View className="flex-1">
				<Text className="font-semibold text-2xl text-primary">{APP_NAME}</Text>
				<Text className="mt-1 text-muted-foreground">
					{title ?? 'Vos annonces, en version mobile native.'}
				</Text>
				{subtitle ? <Text className="mt-1 text-muted-foreground text-sm">{subtitle}</Text> : null}
			</View>
			{actionLabel && onActionPress ? (
				<Button onPress={onActionPress} variant="outline">
					{actionLabel}
				</Button>
			) : null}
		</View>
	)
}
