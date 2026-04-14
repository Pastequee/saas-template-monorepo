import { useMutation } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { ScrollView, Text, View } from 'react-native'

import { Button } from '~/components/ui/button'
import {
	getFieldError,
	InlineAlert,
	NumberField,
	SubmitButton,
	TextField,
} from '~/components/ui/fields'
import { useFlashMessage } from '~/components/ui/flash-message'
import { useListingForm } from '~/lib/forms/listing-form'
import { createListingOptions } from '~/lib/query/listings.mutations'
import { useImageUpload } from '~/lib/upload/use-image-upload'

export default function NewListingScreen() {
	const router = useRouter()
	const flash = useFlashMessage()
	const upload = useImageUpload()
	const createListing = useMutation(createListingOptions())
	const { form, formError } = useListingForm({
		onSubmit: async (value) => {
			await createListing.mutateAsync(value)
			flash.show({ message: 'Annonce creee.', type: 'success' })

			if (router.canGoBack()) {
				router.back()
				return
			}

			router.replace('/')
		},
	})

	const handlePickImage = async () => {
		const imageKey = await upload.pickImage()
		if (imageKey) {
			form.setFieldValue('imageKey', imageKey)
		}
	}

	const handleResetImage = () => {
		upload.reset()
		form.setFieldValue('imageKey', '')
	}

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="gap-6 px-5 pb-10 pt-6"
			keyboardShouldPersistTaps="handled"
		>
			<View className="flex-row items-center justify-between gap-4">
				<Text className="font-semibold text-3xl text-foreground">Nouvelle annonce</Text>
				<Button onPress={() => router.back()} variant="ghost">
					Fermer
				</Button>
			</View>

			<View className="gap-4 rounded-[28px] border border-border bg-card p-5">
				{formError ? <InlineAlert message={formError} /> : null}
				{upload.state.error ? <InlineAlert message={upload.state.error} /> : null}

				<form.Field name="title">
					{(field) => (
						<TextField
							error={getFieldError(field.state.meta.errors)}
							label="Titre"
							onBlur={field.handleBlur}
							onChangeText={field.handleChange}
							placeholder="Ex: Velo de ville"
							value={field.state.value}
						/>
					)}
				</form.Field>

				<form.Field name="description">
					{(field) => (
						<TextField
							autoCapitalize="sentences"
							error={getFieldError(field.state.meta.errors)}
							label="Description"
							onBlur={field.handleBlur}
							onChangeText={field.handleChange}
							placeholder="Decrivez votre annonce"
							value={field.state.value}
						/>
					)}
				</form.Field>

				<form.Field name="price">
					{(field) => (
						<NumberField
							error={getFieldError(field.state.meta.errors)}
							label="Prix"
							onBlur={field.handleBlur}
							onChangeValue={field.handleChange}
							placeholder="50"
							value={field.state.value}
						/>
					)}
				</form.Field>

				<form.Field name="imageKey">
					{(field) => (
						<View className="gap-3">
							<Text className="font-medium text-foreground text-sm">Image</Text>

							{upload.state.previewUri ? (
								<View className="gap-3 overflow-hidden rounded-[24px] border border-border bg-muted p-3">
									<Image
										contentFit="cover"
										source={{ uri: upload.state.previewUri }}
										style={{ aspectRatio: 4 / 3, width: '100%', borderRadius: 18 }}
									/>
									<Text className="text-muted-foreground text-sm">
										{upload.isUploading
											? 'Upload en cours...'
											: upload.state.status === 'complete'
												? 'Upload termine'
												: 'Image selectionnee'}
									</Text>
									<Button onPress={handleResetImage} variant="outline">
										Retirer l'image
									</Button>
								</View>
							) : (
								<Button onPress={handlePickImage} variant="outline">
									Choisir une image
								</Button>
							)}

							{getFieldError(field.state.meta.errors) ? (
								<Text className="text-destructive text-sm">
									{getFieldError(field.state.meta.errors)}
								</Text>
							) : null}
						</View>
					)}
				</form.Field>

				<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
					{([canSubmit, isSubmitting]) => (
						<SubmitButton
							canSubmit={canSubmit && !upload.isUploading && Boolean(upload.state.imageKey)}
							isSubmitting={isSubmitting || createListing.isPending || upload.isUploading}
							label="Publier l'annonce"
							onPress={form.handleSubmit}
						/>
					)}
				</form.Subscribe>
			</View>
		</ScrollView>
	)
}
