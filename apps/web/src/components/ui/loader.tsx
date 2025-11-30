import { Loader2 } from 'lucide-react'

import { cn } from '~/lib/utils/cn'

export const Loader = ({ className, ...props }: React.ComponentProps<typeof Loader2>) => (
	<div className="flex items-center justify-center">
		<Loader2 className={cn('animate-spin', className)} {...props} />
	</div>
)
