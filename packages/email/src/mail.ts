import { env } from '@repo/env/web'
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
		await resend.emails.send({
			from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
			to,
			subject,
			text,
		})
	},

	sendTemplate: async <TTemplate extends Template>(
		template: Template,
		to: string,
		variables: TemplateProps[TTemplate]
	) => {
		await resend.emails.send({
			from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
			to,
			template: {
				id: template,
				variables,
			},
		})
	},
}
