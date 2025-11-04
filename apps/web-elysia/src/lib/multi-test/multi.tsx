import type { AnyFormApi } from '@tanstack/react-form'
import { useAppForm, withFieldGroup } from '../hooks/form-hook'

type FormGroupFunction = () => React.ReactNode

type Step<
  TForm extends AnyFormApi,
  TDefaultValues extends Record<string, any>,
> = {
  component: React.ComponentType<{ form: TForm }>
  fields: Record<string, string>
  defaultValues: TDefaultValues
}

const useFormStepper = <
  TForm extends AnyFormApi,
  TDefaultValues extends Record<string, any>,
>(
  form: TForm,
  steps: Step<TForm, TDefaultValues>[]
) => steps

export const MultiStepForm = () => {
  const steps = useFormStepper({} as typeof form, [
    {
      component: Step1,
      fields: { name: 'name', lastName: 'lastName' },
    },
  ])

  const form = useAppForm({
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      password: '',
    },
    onSubmit: ({ value }) => {
      console.log(value)
    },
  })

  return (
    <div>
      <Step1 fields={{ name: 'name', lastName: 'lastName' }} form={form} />
      <Step2 fields={{ password: 'password', email: 'email' }} form={form} />
    </div>
  )
}

const Step1 = withFieldGroup({
  defaultValues: {
    name: '',
    lastName: '',
  },
  render: ({ group }) => (
    <>
      <group.AppField name="name">
        {(field) => <field.TextField label="Name" name="name" />}
      </group.AppField>
      <group.AppField name="name">
        {(field) => <field.TextField label="Last Name" name="lastName" />}
      </group.AppField>
    </>
  ),
})

const Step2 = withFieldGroup({
  defaultValues: {
    email: '',
    password: '',
  },
  render: ({ group }) => (
    <>
      <group.AppField name="email">
        {(field) => <field.TextField label="Email" name="email" />}
      </group.AppField>
      <group.AppField name="password">
        {(field) => <field.TextField label="Password" name="password" />}
      </group.AppField>
    </>
  ),
})
