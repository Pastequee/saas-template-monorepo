import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useReducer } from 'react'

import { Input } from '~/components/ui/input'
import { cn } from '~/lib/utils/cn'

type PasswordInputProps = React.ComponentProps<typeof Input> & {
	containerClassName?: string
}

export const PasswordInput = ({
	className,
	containerClassName,
	autoComplete,
	...props
}: PasswordInputProps) => {
	const [isVisible, toggleIsVisible] = useReducer((prev) => !prev, false)

	return (
		<div className={cn(containerClassName, 'relative')}>
			<Input
				{...props}
				autoComplete={autoComplete ?? 'new-password'}
				className={cn(className, 'pr-8')}
				type={isVisible ? 'text' : 'password'}
			/>
			<button
				aria-controls="password"
				aria-label={isVisible ? 'Hide password' : 'Show password'}
				aria-pressed={isVisible}
				className="absolute inset-y-0 end-0 flex aspect-square h-full items-center justify-center"
				onClick={toggleIsVisible}
				type="button"
			>
				{isVisible ? (
					<EyeOffIcon aria-hidden="true" size={16} />
				) : (
					<EyeIcon aria-hidden="true" size={16} />
				)}
			</button>
		</div>
	)
}
