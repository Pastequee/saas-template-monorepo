import type { AnyFormApi } from '@tanstack/react-form'
import { useState } from 'react'
import type { ZodObject } from 'zod'

type UseFormStepperOptions = {
	onCancel?: () => void
}

export function useFormStepper<TSchemaArray extends readonly [ZodObject, ...ZodObject[]]>(
	schemas: TSchemaArray,
	options?: UseFormStepperOptions
) {
	const stepCount = schemas.length
	type Len = LengthUnion<TSchemaArray['length']>
	const [currentStepNumber, setCurrentStepNumber] = useState<Len>(1 as Len) // Start from 1

	const hasPreviousStep = currentStepNumber > 1
	const hasNextStep = currentStepNumber < stepCount

	const goToNextStep = () => {
		setCurrentStepNumber((prev) => Math.min(prev + 1, stepCount) as Len)
	}

	const goToPrevStep = () => {
		setCurrentStepNumber((prev) => Math.max(prev - 1, 1) as Len)
	}

	const currentValidator = schemas[currentStepNumber - 1] // Convert to 0-based for array access

	if (!currentValidator) {
		throw new Error('Step validator not found, should not happen')
	}

	const triggerFormGroupValidation = async (form: AnyFormApi) => {
		const result = await currentValidator.safeParse(form.state.values)
		if (!result.success) {
			await form.handleSubmit({ step: String(currentStepNumber) })
		}

		return result
	}

	const handleNextOrSubmit = async (form: AnyFormApi) => {
		const result = await triggerFormGroupValidation(form)
		if (!result.success) return

		if (hasNextStep) {
			goToNextStep()
		} else {
			form.handleSubmit()
		}
	}

	const handleBackOrCancel = () => {
		if (hasPreviousStep) {
			goToPrevStep()
		} else {
			options?.onCancel?.()
		}
	}

	return {
		stepCount: stepCount as TSchemaArray['length'],
		hasNextStep,
		hasPreviousStep,
		currentValidator: currentValidator as TSchemaArray[number],
		currentStepNumber,
		handleNextOrSubmit,
		handleBackOrCancel,
	}
}

export type Steps<TStepCount extends number> = Record<LengthUnion<TStepCount>, React.ReactNode>

type LengthUnion<N extends number> = Exclude<LengthUnionHelper<N>, 0>

type LengthUnionHelper<N extends number, A extends number[] = []> = A['length'] extends N
	? A[number] | N
	: LengthUnionHelper<N, [...A, A['length']]>
