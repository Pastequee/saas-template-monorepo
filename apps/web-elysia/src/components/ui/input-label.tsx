import { Input } from './input'
import { Label } from './label'

type InputLabelProps<T extends typeof Input> = React.ComponentProps<
  typeof Input
> & {
  error?: string
  input?: T
  label: string
  optional?: boolean
} & (
    | { optional?: never; required?: true }
    | { optional?: true; required?: never }
  )

export const InputLabel = <T extends typeof Input>({
  'aria-invalid': ariaInvalid,
  error,
  input: CustomInput,
  label,
  optional,
  required,
  ...props
}: InputLabelProps<T>) => {
  const InputComponent = CustomInput ?? Input

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={props.id}>
        {label}
        {required && <span className="text-destructive">*</span>}
        {optional && (
          <span className="text-muted-foreground text-xs">(optional)</span>
        )}
      </Label>
      <InputComponent aria-invalid={!!error || ariaInvalid} {...props} />
      {error && (
        <em className="text-destructive text-xs opacity-70">{error}</em>
      )}
    </div>
  )
}
