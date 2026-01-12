import { revalidateLogic } from '@tanstack/react-form'
import { Button } from '~/components/ui/button'
import { CardHeader } from '~/components/ui/card'
import { useAppForm } from '~/lib/hooks/form-hook'
import { type Steps, useFormStepper } from '~/lib/hooks/use-form-stepper'
import { Step1, step1Schema } from './step-1'
import { Step2, step2Schema } from './step-2'

const formSchema = step1Schema.and(step2Schema)

export const MultiStepForm = () => {
	const {
		currentValidator,
		currentStepNumber,
		stepCount,
		hasNextStep,
		hasPreviousStep,
		handleNextOrSubmit,
		handleBackOrCancel,
	} = useFormStepper([step1Schema, step2Schema])

	const form = useAppForm({
		defaultValues: {
			name: '',
			lastName: '',
			email: '',
			password: '',
		},
		validationLogic: revalidateLogic(),
		validators: {
			onDynamicAsync: currentValidator as unknown as typeof formSchema,
		},
		onSubmit: ({ value }) => {
			// biome-ignore lint/suspicious/noConsole: for demo purposes
			console.log('Submit', value)
		},
	})

	const steps: Steps<typeof stepCount> = {
		1: <Step1 fields={{ name: 'name', lastName: 'lastName' }} form={form} />,
		2: <Step2 fields={{ password: 'password', email: 'email' }} form={form} />,
	}

	return (
		<>
			<CardHeader>
				<h2 className="text-xl">Step: {currentStepNumber}</h2>
			</CardHeader>
			<div className="flex flex-col gap-2 p-4">
				<form.AppForm>
					{steps[currentStepNumber]}
					{hasPreviousStep && <Button onClick={handleBackOrCancel}>Go back</Button>}
					<form.SubmitButton
						label={hasNextStep ? 'Go Next' : 'Submit'}
						onClick={() => handleNextOrSubmit(form)}
					/>
				</form.AppForm>
			</div>
		</>
	)
}
