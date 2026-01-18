/** biome-ignore-all lint/suspicious/noExplicitAny: needed for type inference */
import type { Column, Table } from '@tanstack/react-table'
import { Check, PlusCircle, Search } from 'lucide-react'
import type * as React from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '~/components/ui/command'
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Separator } from '~/components/ui/separator'
import { cn } from '~/lib/utils/cn'

export function AppTableHeaderFilters({ children }: React.PropsWithChildren) {
	return <div className="flex items-center gap-2">{children}</div>
}

type AppTableHeaderSearchProps = {
	/**
	 * The table object from useTable to display the header for.
	 */
	table: Table<any>
	/**
	 * The placeholder to display in the search input.
	 */
	placeholder?: string
	/**
	 * The column to search in.
	 */
	column: string
}

export function AppTableHeaderSearch({ table, column, placeholder }: AppTableHeaderSearchProps) {
	const searchStringColumn = column.toString()

	return (
		<InputGroup className="max-w-sm">
			<InputGroupAddon>
				<Search />
			</InputGroupAddon>

			<InputGroupInput
				onChange={(event) =>
					table.getColumn(searchStringColumn)?.setFilterValue(event.target.value)
				}
				placeholder={placeholder ?? 'Rechercher...'}
				value={(table.getColumn(searchStringColumn)?.getFilterValue() as string) ?? ''}
			/>
		</InputGroup>
	)
}

type AppTableHeaderFiltersProps<TData, TValue> = {
	column?: Column<TData, TValue>
	title?: string
	options: {
		label: string
		value: string
		icon?: React.ComponentType<{ className?: string }>
	}[]
}

export function AppTableHeaderFilter<TData, TValue>({
	column,
	title,
	options,
}: AppTableHeaderFiltersProps<TData, TValue>) {
	const facets = column?.getFacetedUniqueValues()
	const selectedValues = new Set(column?.getFilterValue() as string[])

	return (
		<Popover>
			<PopoverTrigger render={<Button className="h-8 border-dashed" size="sm" variant="outline" />}>
				<PlusCircle />
				{title}
				{selectedValues?.size > 0 && (
					<>
						<Separator className="mx-2 h-full" orientation="vertical" />
						<Badge className="rounded-sm px-1 font-normal lg:hidden" variant="secondary">
							{selectedValues.size}
						</Badge>
						<div className="hidden gap-1 lg:flex">
							{selectedValues.size > 2 ? (
								<Badge className="rounded-sm px-1 font-normal" variant="secondary">
									{selectedValues.size} selected
								</Badge>
							) : (
								options
									.filter((option) => selectedValues.has(option.value))
									.map((option) => (
										<Badge
											className="rounded-sm px-1 font-normal"
											key={option.value}
											variant="secondary"
										>
											{option.label}
										</Badge>
									))
							)}
						</div>
					</>
				)}
			</PopoverTrigger>
			<PopoverContent align="start" className="w-[200px] p-0">
				<Command>
					<CommandInput placeholder={title} />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{options.map((option) => {
								const isSelected = selectedValues.has(option.value)
								return (
									<CommandItem
										key={option.value}
										onSelect={() => {
											if (isSelected) {
												selectedValues.delete(option.value)
											} else {
												selectedValues.add(option.value)
											}
											const filterValues = Array.from(selectedValues)
											column?.setFilterValue(filterValues.length ? filterValues : undefined)
										}}
									>
										<div
											className={cn(
												'flex size-4 items-center justify-center rounded-[4px] border',
												isSelected
													? 'border-primary bg-primary text-primary-foreground'
													: 'border-input [&_svg]:invisible'
											)}
										>
											<Check className="size-3.5 text-primary-foreground" />
										</div>
										{option.icon && <option.icon className="size-4 text-muted-foreground" />}
										<span>{option.label}</span>
										{facets?.get(option.value) && (
											<span className="ml-auto flex size-4 items-center justify-center font-mono text-muted-foreground text-xs">
												{facets.get(option.value)}
											</span>
										)}
									</CommandItem>
								)
							})}
						</CommandGroup>
						{selectedValues.size > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										className="justify-center text-center"
										onSelect={() => column?.setFilterValue(undefined)}
									>
										Clear filters
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
