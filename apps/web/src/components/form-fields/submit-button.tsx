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
		<form.Subscribe selector={(state) => [state.isSubmitting]}>
			{([isSubmitting]) => (
				<Button disabled={disabled || isSubmitting} {...props} nativeButton type="submit">
					{children}
					{isSubmitting && <Spinner className="ml-2" />}
				</Button>
			)}
		</form.Subscribe>
	)
}
