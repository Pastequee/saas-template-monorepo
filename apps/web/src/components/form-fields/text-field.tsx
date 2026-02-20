import { Input } from '~/components/ui/input'
import { useFieldContext } from '~/lib/hooks/form-hook'

import { Field } from './field'
import type { FieldProps } from './field'

type TextFieldProps = React.ComponentProps<typeof Input> & Omit<FieldProps, 'children' | 'error'>

export function TextField({ label, id, optional, className, ...props }: TextFieldProps) {
	const field = useFieldContext<string>()

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
