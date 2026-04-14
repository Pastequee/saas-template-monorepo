import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

import type { Listing } from '~/lib/api/client'

export function ListingCard({ listing }: { listing: Listing }) {
	const router = useRouter()

	return (
		<Pressable
			className="overflow-hidden rounded-[24px] border border-border bg-card active:opacity-90"
			onPress={() => router.push(`/listing/${listing.id}`)}
		>
			{listing.image ? (
				<Image
					contentFit="cover"
					source={{ uri: listing.image }}
					style={{ aspectRatio: 4 / 3, width: '100%' }}
				/>
			) : (
				<View className="aspect-[4/3] items-center justify-center bg-muted">
					<Text className="text-muted-foreground">Aucune image</Text>
				</View>
			)}
			<View className="gap-2 p-4">
				<Text className="font-semibold text-foreground text-lg">{listing.title}</Text>
				<Text className="font-medium text-primary text-base">{listing.price} EUR</Text>
			</View>
		</Pressable>
	)
}
