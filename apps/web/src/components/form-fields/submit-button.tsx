import { Button } from '~/components/ui/button'
import { Spinner } from '~/components/ui/spinner'
import { useFormContext } from '~/lib/hooks/form-hook'

export const SubmitButton = ({
	disabled,
	children,
	...props
}: React.ComponentProps<typeof Button>) => {
	const form = useFormContext()

	return (
		// @ts-expect-error - tsgo problem
		<form.Subscribe selector={(state) => [state.isSubmitting]}>
			{(state) => (
				<Button disabled={disabled || state.isSubmitting} {...props} nativeButton type="submit">
					{children}
					{state.isSubmitting && <Spinner className="ml-2" />}
				</Button>
			)}
		</form.Subscribe>
	)
}
