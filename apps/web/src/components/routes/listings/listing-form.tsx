import { listingInsertSchema } from '@repo/db/types'
import { formOptions } from '@tanstack/react-form'
import z from 'zod'
import { ImageUploadField } from '~/components/image-upload-field'
import { withForm } from '~/lib/hooks/form-hook'

export const listingFormOptions = formOptions({
	defaultValues: {
		title: '',
		description: '',
		price: 0,
		imageKey: '',
	},
	validators: { onSubmit: listingInsertSchema.extend({ imageKey: z.string().min(1) }) },
})

export const ListingForm = withForm({
	...listingFormOptions,
	render: ({ form }) => (
		<>
			<form.AppField name="title">{(field) => <field.TextField label="Title" />}</form.AppField>
			<form.AppField name="description">
				{(field) => <field.TextField label="Description" />}
			</form.AppField>
			<form.AppField name="price">{(field) => <field.TextField label="Price" />}</form.AppField>
			<ImageUploadField onImageChange={(key) => form.setFieldValue('imageKey', key)} />
		</>
	),
})
