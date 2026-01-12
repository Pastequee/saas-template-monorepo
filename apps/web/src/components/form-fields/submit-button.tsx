import { useFormContext } from '~/lib/hooks/form-hook'

import { Button, type ButtonProps } from '../ui/button'
import { Loader } from '../ui/loader'

export type SubmitButtonProps = ButtonProps & {
	label: string
}

export const SubmitButton = ({ disabled, label, ...props }: SubmitButtonProps) => {
	const form = useFormContext()

	return (
		<form.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit, state.isPristine]}>
			{([isSubmitting]) => (
				<Button disabled={disabled || isSubmitting} {...props} nativeButton={true} type="submit">
					{label}
					{isSubmitting && <Loader className="ml-2" />}
				</Button>
			)}
		</form.Subscribe>
	)
}
