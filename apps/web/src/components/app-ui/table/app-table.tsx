/** biome-ignore-all lint/suspicious/noExplicitAny: needed for type inference */
import { flexRender, type Table as TableType } from '@tanstack/react-table'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'

type DataTableProps<TData> = {
	table: TableType<TData>
}

export const AppTable = ({ children }: React.PropsWithChildren) => (
	<div className="flex flex-col gap-4 rounded-xl border bg-background p-4">{children}</div>
)

export const AppTableData = <TData,>({ table }: DataTableProps<TData>) => (
	<div className="overflow-hidden rounded-lg border">
		<Table>
			<TableHeader>
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow key={headerGroup.id}>
						{headerGroup.headers.map((header) => (
							<TableHead key={header.id}>
								{header.isPlaceholder
									? null
									: flexRender(header.column.columnDef.header, header.getContext())}
							</TableHead>
						))}
					</TableRow>
				))}
			</TableHeader>
			<TableBody>
				{table.getRowModel().rows?.length ? (
					table.getRowModel().rows.map((row) => (
						<TableRow data-state={row.getIsSelected() && 'selected'} key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<TableCell key={cell.id}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell className="h-24 text-center" colSpan={table.getAllColumns().length}>
							Aucun résultat.
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	</div>
)
