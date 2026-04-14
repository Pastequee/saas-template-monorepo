import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ScrollView, Text, View } from 'react-native'

import { Button } from '~/components/ui/button'
import { InlineAlert } from '~/components/ui/fields'
import { LoadingState } from '~/components/ui/states'
import { getOneListingOptions } from '~/lib/query/listings.queries'

const formatDate = (value: string) =>
	new Date(value).toLocaleDateString('fr-FR', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
	})

export default function ListingDetailScreen() {
	const router = useRouter()
	const params = useLocalSearchParams<{ id: string }>()
	const { data: listing, error, isError, isLoading } = useQuery(getOneListingOptions(params.id))

	return (
		<ScrollView className="flex-1 bg-background" contentContainerClassName="gap-6 px-5 pb-10 pt-6">
			<Button onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} variant="ghost">
				Retour aux annonces
			</Button>

			{isLoading ? <LoadingState /> : null}
			{isError ? <InlineAlert message={error.message} /> : null}

			{listing ? (
				<View className="overflow-hidden rounded-[28px] border border-border bg-card">
					{listing.image ? (
						<Image
							contentFit="cover"
							source={{ uri: listing.image }}
							style={{ aspectRatio: 1, width: '100%' }}
						/>
					) : (
						<View className="aspect-square items-center justify-center bg-muted">
							<Text className="text-muted-foreground">Aucune image</Text>
						</View>
					)}

					<View className="gap-5 p-5">
						<View className="gap-2">
							<Text className="font-semibold text-3xl text-foreground">{listing.title}</Text>
							<Text className="font-medium text-2xl text-primary">{listing.price} EUR</Text>
						</View>

						<View className="gap-2">
							<Text className="font-semibold text-foreground text-lg">Description</Text>
							<Text className="text-base text-muted-foreground">{listing.description}</Text>
						</View>

						<View className="gap-2 rounded-[20px] bg-muted p-4">
							<Text className="text-muted-foreground">Vendeur: {listing.user?.name ?? 'Inconnu'}</Text>
							<Text className="text-muted-foreground">
								Publie le {formatDate(listing.createdAt)}
							</Text>
						</View>
					</View>
				</View>
			) : null}
		</ScrollView>
	)
}
