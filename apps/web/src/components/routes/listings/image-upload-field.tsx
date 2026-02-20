import { ImagePlus, Loader2, X } from 'lucide-react'

import { Button } from '~/components/ui/button'
import type { UploadingFile } from '~/lib/hooks/use-file-upload'
import { useFileUpload } from '~/lib/hooks/use-file-upload'

export function ImageUploadField({ onImageChange }: { onImageChange: (key: string) => void }) {
	const [state, actions] = useFileUpload({
		onFileUploaded: (file) => {
			if (file.assetKey) {
				onImageChange(file.assetKey)
			}
		},
	})

	const file = state.files.at(0)

	const handleRemove = () => {
		if (file) {
			actions.removeFile(file.id)
		}
		onImageChange('')
	}

	return (
		<div className="flex flex-col gap-2">
			<span className="font-medium text-sm">Image</span>
			{file ? (
				<FilePreview file={file} onRemove={handleRemove} />
			) : (
				<Button className="w-full" onClick={actions.openFileDialog} type="button" variant="outline">
					<ImagePlus className="size-4" />
					Ajouter une image
				</Button>
			)}
			<input {...actions.getInputProps()} hidden />
			{state.errors.length > 0 && <p className="text-destructive text-sm">{state.errors[0]}</p>}
		</div>
	)
}

function FilePreview({ file, onRemove }: { file: UploadingFile; onRemove: () => void }) {
	const isUploading = file.status === 'uploading' || file.status === 'processing'

	return (
		<div className="flex items-center gap-3 rounded-md border p-2">
			{file.preview && (
				<img
					alt="Preview"
					className="size-16 rounded object-cover"
					height={64}
					src={file.preview}
					width={64}
				/>
			)}
			<div className="flex flex-1 flex-col gap-1">
				<span className="truncate text-sm">{file.file.name}</span>
				{isUploading && (
					<div className="flex items-center gap-2 text-muted-foreground text-xs">
						<Loader2 className="size-3 animate-spin" />
						{file.status === 'processing' ? 'Traitement...' : `${file.progress}%`}
					</div>
				)}
				{file.status === 'complete' && (
					<span className="text-green-600 text-xs">Upload terminé</span>
				)}
				{file.status === 'error' && <span className="text-destructive text-xs">{file.error}</span>}
			</div>
			<Button
				className="size-8 shrink-0"
				onClick={onRemove}
				size="icon"
				type="button"
				variant="ghost"
			>
				<X className="size-4" />
			</Button>
		</div>
	)
}
