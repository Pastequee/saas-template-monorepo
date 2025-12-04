import { Resend } from 'resend'
import { env } from './env'

const resend = new Resend(env.RESEND_API_KEY)

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
}
