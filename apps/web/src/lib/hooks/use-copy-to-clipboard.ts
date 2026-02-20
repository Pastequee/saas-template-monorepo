import { useState } from 'react'

export function useCopyToClipboard({
	timeout = 2000,
	onCopy,
}: {
	timeout?: number
	onCopy?: () => void
} = {}) {
	const [isCopied, setIsCopied] = useState(false)

	const copyToClipboard = (value: string) => {
		if (typeof window === 'undefined' || !navigator.clipboard.writeText) {
			return
		}

		if (!value) {
			return
		}

		navigator.clipboard
			.writeText(value)
			// oxlint-disable-next-line promise/prefer-await-to-then
			.then(() => {
				setIsCopied(true)

				if (onCopy) {
					onCopy()
				}

				if (timeout !== 0) {
					setTimeout(() => {
						setIsCopied(false)
					}, timeout)
				}
			})
			// oxlint-disable-next-line promise/prefer-await-to-then
			.catch(console.error)
	}

	return { copyToClipboard, isCopied }
}
