import { z } from 'zod'
import { withFieldGroup } from '~/lib/hooks/form-hook'

export const step1Schema = z.object({
	name: z.string().min(4),
	lastName: z.string().min(6),
})

export const Step1 = withFieldGroup({
	defaultValues: {
		name: '',
		lastName: '',
	},
	render: ({ group }) => (
		<div className="flex flex-col gap-4">
			<group.AppField name="name">{(field) => <field.TextField label="Name" />}</group.AppField>
			<group.AppField name="lastName">
				{(field) => <field.TextField label="Last Name" />}
			</group.AppField>
		</div>
	),
})
