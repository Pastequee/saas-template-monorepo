import type { Listing } from '@repo/db/types'
import { coercePositiveInt } from '@repo/utils'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useCanGoBack, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { z } from 'zod'

import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { getOneListingOptions } from '~/lib/queries/listings.queries'

export const Route = createFileRoute('/_authenticated/listing/$id')({
	component: RouteComponent,
	params: z.object({ id: positiveIntParam('listing id') }),
})

function RouteComponent() {
	const router = useRouter()
	const canGoBack = useCanGoBack()
	const { id } = Route.useParams()

	const { data: listing } = useQuery(getOneListingOptions(id))

	const handleGoBack = () => {
		if (canGoBack) {
			router.history.back()
		} else {
			void router.navigate({ to: '/' })
		}
	}

	return (
		<div className="flex max-w-5xl flex-col gap-6 pt-8">
			<Button className="w-fit" onClick={handleGoBack} variant="ghost">
				<ArrowLeft />
				Retour aux annonces
			</Button>

			{listing && <ListingDetails listing={listing} />}
		</div>
	)
}

function ListingDetails({ listing }: { listing: Listing }) {
	return (
		<div className="grid w-full grid-cols-5 overflow-hidden rounded-lg border">
			<img
				alt={listing.title}
				className="col-span-2 aspect-square"
				height={1000}
				src={listing.image ?? ''}
				width={1000}
			/>
			<div className="col-span-3 flex flex-col gap-6 p-6">
				<div className="flex flex-col gap-2">
					<h3 className="font-semibold">{listing.title}</h3>
					<span className="text-primary">{listing.price} €</span>
				</div>

				<div>
					<h4 className="font-semibold">Description</h4>
					<p className="text-muted-foreground mt-2 font-light">{listing.description}</p>
				</div>

				<Separator />

				<div className="text-muted-foreground font-light *:flex *:items-center *:gap-1">
					<p>
						<User className="size-4" /> Vendeur: {listing.user?.name ?? 'Inconnu'}
					</p>
					<p className="mt-2">
						<Calendar className="size-4" />
						Publié le{' '}
						{listing.createdAt.toLocaleDateString('fr-FR', {
							day: '2-digit',
							month: 'long',
							year: 'numeric',
						})}
					</p>
				</div>

				<Button className="mt-auto">Contacter le vendeur</Button>
			</div>
		</div>
	)
}

function positiveIntParam(label: string) {
	return z.string().transform((value, ctx) => {
		try {
			return coercePositiveInt(value, label)
		} catch (error) {
			ctx.addIssue({
				code: 'custom',
				message: error instanceof Error ? error.message : `Invalid ${label}: ${value}`,
			})
			return z.NEVER
		}
	})
}
