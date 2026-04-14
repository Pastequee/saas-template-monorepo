import type { ComponentProps, ReactNode } from 'react'
import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

import { Button } from './button'

const resolveError = (error: unknown) => {
	if (!error) {
		return undefined
	}

	if (typeof error === 'string') {
		return error
	}

	if (typeof error === 'object' && error !== null && 'message' in error) {
		return typeof error.message === 'string' ? error.message : undefined
	}

	return undefined
}

export const getFieldError = (errors: unknown[]) =>
	errors.map(resolveError).find((error) => Boolean(error))

function FieldShell({
	children,
	error,
	label,
}: {
	children: ReactNode
	error?: string
	label: string
}) {
	return (
		<View className="gap-2">
			<Text className="font-medium text-foreground text-sm">{label}</Text>
			{children}
			{error ? <Text className="text-destructive text-sm">{error}</Text> : null}
		</View>
	)
}

export function InlineAlert({
	message,
	variant = 'destructive',
}: {
	message: string
	variant?: 'destructive' | 'warning'
}) {
	const styles =
		variant === 'warning'
			? 'border-warning/30 bg-warning/10 text-warning-foreground'
			: 'border-destructive/20 bg-destructive/10 text-destructive'

	return (
		<View className={`rounded-2xl border px-4 py-3 ${styles}`}>
			<Text className="font-medium">{message}</Text>
		</View>
	)
}

export function TextField({
	autoCapitalize = 'none',
	autoComplete,
	error,
	keyboardType,
	label,
	onBlur,
	onChangeText,
	placeholder,
	value,
}: {
	autoCapitalize?: 'characters' | 'none' | 'sentences' | 'words'
	autoComplete?: ComponentProps<typeof TextInput>['autoComplete']
	error?: string
	keyboardType?: ComponentProps<typeof TextInput>['keyboardType']
	label: string
	onBlur?: () => void
	onChangeText: (value: string) => void
	placeholder?: string
	value: string
}) {
	return (
		<FieldShell error={error} label={label}>
			<TextInput
				autoCapitalize={autoCapitalize}
				autoComplete={autoComplete}
				className="min-h-12 rounded-2xl border border-input bg-card px-4 py-3 text-base text-foreground"
				keyboardType={keyboardType}
				onBlur={onBlur}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor="#94a3b8"
				value={value}
			/>
		</FieldShell>
	)
}

export function PasswordField({
	error,
	label,
	onBlur,
	onChangeText,
	placeholder,
	value,
}: {
	error?: string
	label: string
	onBlur?: () => void
	onChangeText: (value: string) => void
	placeholder?: string
	value: string
}) {
	const [isVisible, setIsVisible] = useState(false)

	return (
		<FieldShell error={error} label={label}>
			<View className="flex-row items-center rounded-2xl border border-input bg-card px-4">
				<TextInput
					autoCapitalize="none"
					autoComplete="password"
					className="min-h-12 flex-1 py-3 text-base text-foreground"
					onBlur={onBlur}
					onChangeText={onChangeText}
					placeholder={placeholder}
					placeholderTextColor="#94a3b8"
					secureTextEntry={!isVisible}
					value={value}
				/>
				<Pressable className="px-1 py-2" onPress={() => setIsVisible((value) => !value)}>
					<Text className="font-medium text-primary text-sm">
						{isVisible ? 'Masquer' : 'Afficher'}
					</Text>
				</Pressable>
			</View>
		</FieldShell>
	)
}

export function NumberField({
	error,
	label,
	onBlur,
	onChangeValue,
	placeholder,
	value,
}: {
	error?: string
	label: string
	onBlur?: () => void
	onChangeValue: (value: number) => void
	placeholder?: string
	value: number
}) {
	return (
		<TextField
			error={error}
			keyboardType="numeric"
			label={label}
			onBlur={onBlur}
			onChangeText={(nextValue) => onChangeValue(Number(nextValue.replace(/[^0-9]/g, '') || 0))}
			placeholder={placeholder}
			value={value ? String(value) : ''}
		/>
	)
}

export function SubmitButton({
	canSubmit,
	isSubmitting,
	label,
	onPress,
}: {
	canSubmit: boolean
	isSubmitting: boolean
	label: string
	onPress: () => void
}) {
	return (
		<Button disabled={!canSubmit} fullWidth loading={isSubmitting} onPress={onPress}>
			{label}
		</Button>
	)
}
