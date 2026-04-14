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
import { useRegisterForm } from '~/lib/forms/register-form'

export default function RegisterScreen() {
	const router = useRouter()
	const params = useLocalSearchParams<{ redirect?: string }>()
	const { form, formError } = useRegisterForm({
		onSuccess: () => router.replace(params.redirect || '/login'),
	})

	return (
		<View className="flex-1 items-center justify-center bg-background px-6">
			<Card className="w-full max-w-xl">
				<CardTitle>Creer un compte</CardTitle>
				<CardDescription>Creez un compte pour publier vos annonces.</CardDescription>
				<View className="mt-6 gap-4">
					{formError ? <InlineAlert message={formError} /> : null}

					<form.Field name="name">
						{(field) => (
							<TextField
								autoCapitalize="words"
								autoComplete="name"
								error={getFieldError(field.state.meta.errors)}
								label="Nom"
								onBlur={field.handleBlur}
								onChangeText={field.handleChange}
								placeholder="Votre nom"
								value={field.state.value}
							/>
						)}
					</form.Field>

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
								label="Creer un compte"
								onPress={form.handleSubmit}
							/>
						)}
					</form.Subscribe>

					<Text className="text-center text-muted-foreground">
						Deja un compte?{' '}
						<Link
							className="font-medium text-primary"
							href={
								params.redirect
									? { params: { redirect: params.redirect }, pathname: '/login' }
									: '/login'
							}
						>
							Se connecter
						</Link>
					</Text>
				</View>
			</Card>
		</View>
	)
}
