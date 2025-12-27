import { env } from '@repo/env/backend'
import { Resend } from 'resend'

const resend = new Resend(env.RESEND_API_KEY)

type TemplateProps = {
	'reset-password': {
		URL: string
	}
}

type Template = keyof TemplateProps

export const mail = {
	send: async ({ to, subject, text }: { to: string | string[]; subject: string; text: string }) => {
		const res = await resend.emails.send({
			from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
			to,
			subject,
			text,
		})

		return res
	},

	sendTemplate: async <TTemplate extends Template>(
		template: Template,
		to: string,
		variables: TemplateProps[TTemplate]
	) => {
		const res = await resend.emails.send({
			from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
			to,
			template: {
				id: template,
				variables,
			},
		})

		return res
	},
}
