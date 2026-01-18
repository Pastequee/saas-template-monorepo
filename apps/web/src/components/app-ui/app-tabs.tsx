import type { LucideIcon } from 'lucide-react'
import { cn } from '~/lib/utils/cn'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'

export type AppTab<TValue extends string> = {
	icon?: LucideIcon
	label: string
	value: TValue
}

type AppTabsProps<TValue extends string> = {
	tabs: AppTab<TValue>[]
	value?: TValue
	defaultValue?: TValue
	onTabChange?: (value: TValue) => void
	className?: string
	readonly?: boolean
}

export const AppTabs = <TValue extends string>({
	tabs,
	value,
	className,
	onTabChange,
	defaultValue,
	readonly = false,
}: AppTabsProps<TValue>) => (
	<Tabs defaultValue={defaultValue} onValueChange={(v: TValue) => onTabChange?.(v)} value={value}>
		<TabsList className={className}>
			{tabs.map((tab) => (
				<TabsTrigger
					className={cn(readonly && 'pointer-events-none hover:text-inherit')}
					disabled={readonly}
					key={`${tab.value}-tab`}
					value={tab.value}
				>
					{tab.icon && <tab.icon className="size-4" />}
					{tab.label}
				</TabsTrigger>
			))}
		</TabsList>
	</Tabs>
)
