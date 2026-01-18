import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

export type AppSelectProps<TValue extends string | number> = {
	id?: string
	items: { label: React.ReactNode; value: TValue }[]
	className?: string
	onValueChange?: (value: TValue | null) => void
	value?: TValue
	defaultValue?: TValue
	ariaInvalid?: boolean
	placeholder?: string
}

export function AppSelect<TValue extends string | number>({
	id,
	items,
	className,
	value,
	onValueChange,
	defaultValue,
	ariaInvalid,
	placeholder,
}: AppSelectProps<TValue>) {
	const allItems = placeholder ? [{ label: placeholder, value: null }, ...items] : items

	return (
		<Select
			defaultValue={defaultValue}
			id={id}
			items={allItems}
			onValueChange={onValueChange}
			value={value}
		>
			<SelectTrigger aria-invalid={ariaInvalid} className={className}>
				<SelectValue />
			</SelectTrigger>

			<SelectContent alignItemWithTrigger={false}>
				{allItems.map((item) => (
					<SelectItem key={item.value} value={item.value}>
						{item.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
