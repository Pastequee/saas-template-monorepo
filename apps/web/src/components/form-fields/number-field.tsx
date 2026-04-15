import { NumberInput } from '~/components/ui/number-input'
import { useFieldContext } from '~/lib/hooks/form-hook'

import { Field } from './field'
import type { FieldProps } from './field'
import { getErrorMessage } from './get-error-message'

type NumberFieldProps = React.ComponentProps<typeof NumberInput> &
	Omit<FieldProps, 'children' | 'error'>

export function NumberField({ label, id, optional, className, ...props }: NumberFieldProps) {
	const field = useFieldContext<number>()

	const errorMessage = getErrorMessage(field.state.meta.errors)

	return (
		<Field
			className={className}
			error={errorMessage ?? undefined}
			id={id}
			label={label}
			optional={optional}
			required={props.required}
		>
			<NumberInput
				{...props}
				aria-invalid={errorMessage !== undefined}
				id={field.name}
				name={field.name}
				onBlur={field.handleBlur}
				onValueChange={(v) => {
					if (v === null) {
						return
					}
					field.handleChange(v)
				}}
				value={field.state.value}
			/>
		</Field>
	)
}
