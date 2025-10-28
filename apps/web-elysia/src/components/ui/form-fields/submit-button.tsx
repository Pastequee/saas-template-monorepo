import { useFormContext } from '~/lib/hooks/form-hook'

import { Button } from '../button'
import { Loader } from '../loader'

interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  label: string
  defaultDisabled?: boolean
}

export const SubmitButton = ({
  disabled,
  label,
  defaultDisabled = true,
  ...props
}: SubmitButtonProps) => {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={(state) => [
        state.isSubmitting,
        state.canSubmit,
        state.isPristine,
      ]}
    >
      {([isSubmitting, canSubmit, isPristine]) => (
        <Button
          disabled={
            !canSubmit ||
            isSubmitting ||
            disabled ||
            (isPristine && defaultDisabled)
          }
          type="submit"
          {...props}
        >
          {label}
          {isSubmitting && <Loader className="ml-2" />}
        </Button>
      )}
    </form.Subscribe>
  )
}
