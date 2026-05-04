import type { Listing } from '@repo/db/types'
import { Link } from '@tanstack/react-router'

export function ListingCard({ listing }: { listing: Listing }) {
	return (
		<div className="flex flex-col overflow-hidden rounded-lg border">
			<Link className="" params={{ id: listing.id }} to="/listing/$id">
				{listing.image && (
					<img
						alt={listing.title}
						className="aspect-4/3 w-full"
						height={100}
						src={listing.image}
						width={100}
					/>
				)}
			</Link>
			<div className="flex flex-col gap-2 p-4">
				<h3 className="font-semibold">{listing.title}</h3>
				<span className="text-primary">{listing.price} €</span>
			</div>
		</div>
	)
}
