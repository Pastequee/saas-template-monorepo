/** biome-ignore-all lint/suspicious/noExplicitAny: dont bother */
/** biome-ignore-all lint/performance/noAccumulatingSpread: dont bother*/
/** biome-ignore-all lint/complexity/noBannedTypes: dont bother */

import { useState } from 'react'

export type Step<TValues extends object> = {
  type: 'form'
  form: TValues
}

type ExtractValues<TForm extends Step<any>[] = []> = TForm extends [
  infer First extends Step<object>,
  ...infer Other extends Step<object>[],
]
  ? First['form'] & ExtractValues<Other>
  : {}

type StepSchema<TStep extends Step<object>, TPreviousValues> = {
  values: () => TStep['form']
  render: (args: {
    previousValues: TPreviousValues
    values: TStep['form']
    onBack: () => void
    onNext: (values: TStep['form']) => void
  }) => React.ReactNode
}

type FormSchema<
  TForm extends Step<object>[],
  TPreviousValues = {},
> = TForm extends [
  infer First extends Step<object>,
  ...infer Other extends Step<object>[],
]
  ? [
      StepSchema<First, TPreviousValues>,
      ...FormSchema<Other, TPreviousValues & First['form']>,
    ]
  : []

const createMultiForm = <TForm extends Step<any>[]>(
  formSchema: FormSchema<TForm>
) => {
  const MultiFormComponent = (props: {
    onSubmit: (values: ExtractValues<TForm>) => void
  }) => {
    const [stepIndex, setStepIndex] = useState<number>(0)
    const [values, setValues] = useState<ExtractValues<TForm>>(
      flattenRecords(formSchema.map((schema) => schema.values))
    )

    const handleBack = () => {
      if (stepIndex === 0) {
        return
      }

      setStepIndex(stepIndex - 1)
    }

    const handleNext = (nextValues: ExtractValues<TForm>) => {
      setValues((prev) => ({ ...prev, ...nextValues }))
      if (stepIndex === formSchema.length - 1) {
        props.onSubmit({ ...values, ...nextValues })
      } else {
        setStepIndex(stepIndex + 1)
      }
    }

    const step = formSchema.at(stepIndex)
    if (!step) {
      throw new Error('Step not found')
    }

    const StepComponent = step.render({
      previousValues: values,
      onBack: handleBack,
      onNext: handleNext,
      values,
    })

    return <>{StepComponent}</>
  }

  return {
    MultiFormComponent,
  }
}

type Test = [Step<{ a: string }>, Step<{ b: string }>, Step<{ c: string }>]

export const Main = () => {
  const { MultiFormComponent } = createMultiForm<Test>([
    {
      values: () => ({ a: 'test' }),
      render: ({ onNext }) => (
        <div>
          <h1>Step 1</h1>
          <button onClick={() => onNext({ a: 'test' })} type="button">
            Next
          </button>
        </div>
      ),
    },
    {
      values: () => ({ b: 'test' }),
      render: ({ previousValues, onNext, onBack }) => (
        <div>
          <h1>Step 2</h1>
          Previous values: {JSON.stringify(previousValues)}
          <button onClick={onBack} type="button">
            Back
          </button>
          <button onClick={() => onNext({ b: 'test' })} type="button">
            Next
          </button>
        </div>
      ),
    },
    {
      values: () => ({ c: 'test' }),
      render: ({ previousValues, onNext, onBack }) => (
        <div>
          <h1>Step 3</h1>
          Previous values: {JSON.stringify(previousValues)}
          <button onClick={onBack} type="button">
            Back
          </button>
          <button onClick={() => onNext({ c: 'test' })} type="button">
            Submit
          </button>
        </div>
      ),
    },
  ])

  return (
    <MultiFormComponent
      onSubmit={(values) => {
        // biome-ignore lint/suspicious/noConsole: leave me alone
        console.log(values)
      }}
    />
  )
}

function flattenRecords<T extends object[]>(records: [...T]) {
  return Object.assign({}, ...records)
}
