import { Label } from '~/components/ui/label'
import { cn } from '~/lib/utils/cn'

export type FieldProps = {
	id?: string
	label: string
	required?: boolean
	optional?: boolean
	children: React.ReactNode
	error?: string
	className?: string
}

export const Field = ({
	id,
	label,
	children,
	error,
	required,
	optional,
	className,
}: FieldProps) => (
	<div className={cn('flex flex-col gap-1', className)}>
		<Label className="text-base" htmlFor={id}>
			{label}
			{required && <span className="text-destructive">*</span>}
			{optional && <span className="text-muted-foreground text-xs">(facultatif)</span>}
		</Label>
		{children}
		{error && <em className="text-destructive text-xs opacity-70">{error}</em>}
	</div>
)
