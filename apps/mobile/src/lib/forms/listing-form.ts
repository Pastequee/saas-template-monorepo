import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { z } from 'zod'

import { DEFAULT_ERROR_MESSAGE } from '~/lib/constants'

export const listingSchema = z.object({
	description: z.string().trim().min(1, 'Description requise'),
	imageKey: z.string().min(1, 'Image requise'),
	price: z.coerce.number().int().min(0, 'Prix invalide'),
	title: z.string().trim().min(1, 'Titre requis'),
})

export const useListingForm = ({
	onSubmit,
}: {
	onSubmit: (value: z.infer<typeof listingSchema>) => Promise<void>
}) => {
	const [formError, setFormError] = useState<string>()

	const form = useForm({
		defaultValues: {
			description: '',
			imageKey: '',
			price: 0,
			title: '',
		},
		onSubmit: async ({ value }) => {
			setFormError(undefined)

			try {
				await onSubmit(value)
			} catch (error) {
				setFormError(error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE)
			}
		},
		validators: {
			onChange: listingSchema,
			onSubmit: listingSchema,
		},
	})

	return { form, formError, setFormError }
}
