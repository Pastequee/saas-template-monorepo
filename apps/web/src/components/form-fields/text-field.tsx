import { Input } from '~/components/ui/input'
import { useFieldContext } from '~/lib/hooks/form-hook'

import { Field } from './field'
import type { FieldProps } from './field'
import { getErrorMessage } from './get-error-message'

type TextFieldProps = React.ComponentProps<typeof Input> & Omit<FieldProps, 'children' | 'error'>

export function TextField({ label, id, optional, className, ...props }: TextFieldProps) {
	const field = useFieldContext<string>()

	// oxlint-disable-next-line typescript/no-unsafe-type-assertion
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
			<Input
				{...props}
				aria-invalid={errorMessage !== undefined}
				id={field.name}
				name={field.name}
				onBlur={field.handleBlur}
				onChange={(e) => {
					field.handleChange(e.target.value)
				}}
				value={field.state.value}
			/>
		</Field>
	)
}
