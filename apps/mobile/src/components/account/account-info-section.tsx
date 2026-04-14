import { Text, View } from 'react-native'

import { Card, CardDescription, CardTitle } from '../ui/card'

function InfoItem({ label, value }: { label: string; value: string }) {
	return (
		<View className="gap-1">
			<Text className="text-muted-foreground text-xs uppercase">{label}</Text>
			<Text className="text-base text-foreground">{value}</Text>
		</View>
	)
}

export function AccountInfoSection({
	email,
	listingsCount,
	name,
}: {
	email: string
	listingsCount: number
	name: string
}) {
	return (
		<Card>
			<CardTitle>Mon profil</CardTitle>
			<CardDescription>Informations personnelles</CardDescription>
			<View className="mt-5 gap-4">
				<InfoItem label="Nom" value={name} />
				<InfoItem label="Email" value={email} />
				<InfoItem label="Annonces" value={`${listingsCount} annonces`} />
			</View>
		</Card>
	)
}
