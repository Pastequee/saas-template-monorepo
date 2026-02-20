import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { LogOut, Mail, Package, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { ListingList } from '~/components/routes/listings/listing-list'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { useAuth } from '~/lib/hooks/use-auth'
import { getMyListingsOptions } from '~/lib/queries/listings.queries'

export const Route = createFileRoute('/_authenticated/account')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="flex w-full max-w-5xl justify-center gap-8 pt-8">
			<AccountInfos />
			<MyListings />
		</div>
	)
}

function AccountInfos() {
	const auth = useAuth()
	const { data: listings = [] } = useQuery(getMyListingsOptions())

	if (!auth) {
		return null
	}

	return (
		<Card className="h-fit min-w-2xs">
			<CardHeader>
				<CardTitle>Mon profil</CardTitle>
				<CardDescription>Informations personnelles</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<AccountInfoItem icon={User} label="Nom" value={auth.user.name ?? ''} />
				<AccountInfoItem icon={Mail} label="Email" value={auth.user.email ?? ''} />
				<AccountInfoItem icon={Package} label="Annonces" value={`${listings.length} annonces`} />
				<Button className="w-full" onClick={auth.logout} variant="destructive">
					<LogOut />
					Déconnexion
				</Button>
			</CardContent>
		</Card>
	)
}

function AccountInfoItem({
	label,
	value,
	icon: Icon,
}: {
	label: string
	value: string
	icon: LucideIcon
}) {
	return (
		<div className="flex gap-2">
			<Icon className="mt-0.5 size-4 text-muted-foreground" />
			<div className="flex flex-col">
				<span className="font-light text-muted-foreground text-xs">{label}</span>
				<span>{value}</span>
			</div>
		</div>
	)
}

function MyListings() {
	const { data: listings = [] } = useQuery(getMyListingsOptions())

	const hasListings = listings.length > 0

	return (
		<Card className="h-fit flex-1">
			<CardHeader>
				<CardTitle>Mes annonces</CardTitle>
				<CardDescription>Gérez vos annonces</CardDescription>
			</CardHeader>
			<CardContent>
				{hasListings ? <ListingList listings={listings} /> : <NoListings />}
			</CardContent>
		</Card>
	)
}

function NoListings() {
	return (
		<div className="flex flex-col items-center justify-center gap-4">
			<p>Commencez par créer votre première annonce</p>
			<Button>Créer une annonce</Button>
		</div>
	)
}
