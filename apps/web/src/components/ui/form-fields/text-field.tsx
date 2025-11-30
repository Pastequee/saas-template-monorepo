import { useFieldContext } from '~/lib/hooks/form-hook'
import { InputLabel } from '../input-label'

type TextFieldProps = React.ComponentProps<typeof InputLabel>

export function TextField({ label, ...props }: TextFieldProps) {
	const field = useFieldContext<string>()

	const errorMessage = field.state.meta.isDirty
		? (field.state.meta.errors as { message: string }[]).at(0)?.message
		: undefined

	return (
		<InputLabel
			{...props}
			error={errorMessage}
			id={field.name}
			label={label}
			name={field.name}
			onBlur={field.handleBlur}
			onChange={(e) => {
				field.handleChange(e.target.value)
			}}
			value={field.state.value}
		/>
	)
}
