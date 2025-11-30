import { z } from 'zod'
import { withFieldGroup } from '~/lib/hooks/form-hook'

export const step2Schema = z.object({
	password: z.string().min(8),
	email: z.email(),
})

export const Step2 = withFieldGroup({
	defaultValues: {
		email: '',
		password: '',
	},
	render: ({ group }) => (
		<div className="flex flex-col gap-4">
			<group.AppField name="email">
				{(field) => <field.TextField label="Email" name="email" />}
			</group.AppField>
			<group.AppField name="password">
				{(field) => <field.TextField label="Password" name="password" />}
			</group.AppField>
		</div>
	),
})
