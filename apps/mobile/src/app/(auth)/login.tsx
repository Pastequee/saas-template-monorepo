import { Link, useLocalSearchParams, useRouter } from 'expo-router'
import { Text, View } from 'react-native'

import { Card, CardDescription, CardTitle } from '~/components/ui/card'
import {
	getFieldError,
	InlineAlert,
	PasswordField,
	SubmitButton,
	TextField,
} from '~/components/ui/fields'
import { useLoginForm } from '~/lib/forms/login-form'

export default function LoginScreen() {
	const router = useRouter()
	const params = useLocalSearchParams<{ redirect?: string }>()
	const { form, formError } = useLoginForm({
		onSuccess: () => router.replace(params.redirect || '/'),
	})

	return (
		<View className="flex-1 items-center justify-center bg-background px-6">
			<Card className="w-full max-w-xl">
				<CardTitle>Connexion</CardTitle>
				<CardDescription>Connectez-vous pour acceder a vos annonces.</CardDescription>
				<View className="mt-6 gap-4">
					{formError ? <InlineAlert message={formError} /> : null}

					<form.Field name="email">
						{(field) => (
							<TextField
								autoComplete="email"
								error={getFieldError(field.state.meta.errors)}
								label="Email"
								onBlur={field.handleBlur}
								onChangeText={field.handleChange}
								placeholder="votre@email.com"
								value={field.state.value}
							/>
						)}
					</form.Field>

					<form.Field name="password">
						{(field) => (
							<PasswordField
								error={getFieldError(field.state.meta.errors)}
								label="Mot de passe"
								onBlur={field.handleBlur}
								onChangeText={field.handleChange}
								placeholder="••••••••"
								value={field.state.value}
							/>
						)}
					</form.Field>

					<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
						{([canSubmit, isSubmitting]) => (
							<SubmitButton
								canSubmit={canSubmit}
								isSubmitting={isSubmitting}
								label="Se connecter"
								onPress={form.handleSubmit}
							/>
						)}
					</form.Subscribe>

					<Text className="text-center text-muted-foreground">
						Pas encore de compte?{' '}
						<Link
							className="font-medium text-primary"
							href={
								params.redirect
									? { params: { redirect: params.redirect }, pathname: '/register' }
									: '/register'
							}
						>
							Creer un compte
						</Link>
					</Text>
				</View>
			</Card>
		</View>
	)
}
