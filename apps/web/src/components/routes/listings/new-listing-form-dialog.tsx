import type { DialogRootActions } from '@base-ui/react'
import { useMutation } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useRef } from 'react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog'
import { useAppForm } from '~/lib/hooks/form-hook'
import { createListingOptions } from '~/lib/mutations/listings.mutations'

import { ListingForm, listingFormOptions } from './listing-form'

export const NewListingFormDialog = () => {
	const dialogRef = useRef<DialogRootActions>(null)

	return (
		<Dialog actionsRef={dialogRef}>
			<DialogTrigger render={Button}>
				<Plus /> Déposer une annonce
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Créer une annonce</DialogTitle>
				</DialogHeader>

				<NewListingForm onClose={() => dialogRef.current?.close()} />
			</DialogContent>
		</Dialog>
	)
}

function NewListingForm({ onClose }: { onClose: () => void }) {
	const { mutate: createListing } = useMutation(createListingOptions())

	const form = useAppForm({
		...listingFormOptions,
		onSubmit: ({ value }) => {
			createListing(value, {
				onError: (error) => {
					toast.error(error.value.message ?? 'Failed to create listing')
				},
				onSuccess: () => {
					toast.success('Annonce créée avec succès')
					onClose()
				},
			})
		},
	})

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={(e) => {
				e.preventDefault()
				form.handleSubmit()
			}}
		>
			<ListingForm form={form} />

			<div className="mt-4 flex gap-2">
				<DialogClose className="flex-1" render={<Button variant="outline" />}>
					Annuler
				</DialogClose>
				<form.AppForm>
					<form.SubmitButton className="flex-1">Créer l&apos;annonce</form.SubmitButton>
				</form.AppForm>
			</div>
		</form>
	)
}
