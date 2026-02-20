import { NumberInput } from '~/components/ui/number-input'
import { useFieldContext } from '~/lib/hooks/form-hook'

import { Field } from './field'
import type { FieldProps } from './field'

type TextFieldProps = React.ComponentProps<typeof NumberInput> &
	Omit<FieldProps, 'children' | 'error'>

export function TextField({ label, id, optional, className, ...props }: TextFieldProps) {
	const field = useFieldContext<number>()

	const errorMessage = (field.state.meta.errors as { message: string }[]).at(0)?.message

	return (
		<Field
			className={className}
			error={errorMessage}
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
