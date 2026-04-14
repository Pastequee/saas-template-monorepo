import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from 'react'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type FlashMessage = {
	message: string
	type: 'error' | 'success'
}

const FlashMessageContext = createContext<{
	show: (message: FlashMessage) => void
} | null>(null)

export function FlashMessageProvider({ children }: { children: ReactNode }) {
	const insets = useSafeAreaInsets()
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const [message, setMessage] = useState<FlashMessage | null>(null)

	useEffect(
		() => () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		},
		[]
	)

	const value = useMemo(
		() => ({
			show: (nextMessage: FlashMessage) => {
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current)
				}

				setMessage(nextMessage)
				timeoutRef.current = setTimeout(() => {
					setMessage(null)
				}, 3000)
			},
		}),
		[]
	)

	const styles =
		message?.type === 'success'
			? 'border-success/20 bg-success/10 text-success-foreground'
			: 'border-destructive/20 bg-destructive/10 text-destructive'

	return (
		<FlashMessageContext.Provider value={value}>
			{children}
			{message ? (
				<View
					className={`absolute left-4 right-4 rounded-2xl border px-4 py-3 ${styles}`}
					pointerEvents="none"
					style={{ top: insets.top + 12 }}
				>
					<Text className="font-medium">{message.message}</Text>
				</View>
			) : null}
		</FlashMessageContext.Provider>
	)
}

export const useFlashMessage = () => {
	const context = useContext(FlashMessageContext)

	if (!context) {
		throw new Error('useFlashMessage must be used inside FlashMessageProvider')
	}

	return context
}
