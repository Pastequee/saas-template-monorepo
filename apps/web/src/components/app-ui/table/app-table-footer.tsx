/** biome-ignore-all lint/suspicious/noExplicitAny: needed for type inference */
import type { Table } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { AppSelect } from '../app-select'

export function AppTableFooter({ children }: React.PropsWithChildren) {
	return <div className="flex items-center justify-between">{children}</div>
}

export function AppTableRowSelection({ table }: { table: Table<any> }) {
	return (
		<div className="ml-0.5 flex-1 text-muted-foreground text-sm">
			{table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length}{' '}
			row(s) selected.
		</div>
	)
}

const PAGE_SIZES = [10, 20, 25, 30, 40, 50] as const

export function AppTablePagination({ table }: { table: Table<any> }) {
	return (
		<div className="ml-auto flex items-center space-x-6 lg:space-x-8">
			<div className="flex items-center space-x-2">
				<p className="font-medium text-sm">Rows per page</p>
				<AppSelect
					items={PAGE_SIZES.map((pageSize) => ({
						label: `${pageSize}`,
						value: pageSize,
					}))}
					onValueChange={(value) => (value ? table.setPageSize(value) : undefined)}
					value={table.getState().pagination.pageSize}
				/>
			</div>

			<div className="flex w-[100px] items-center justify-center font-medium text-sm">
				Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
			</div>

			<div className="flex items-center space-x-2">
				<Button
					className="hidden size-8 lg:flex"
					disabled={!table.getCanPreviousPage()}
					onClick={() => table.setPageIndex(0)}
					size="icon"
					variant="outline"
				>
					<span className="sr-only">Go to first page</span>
					<ChevronsLeft />
				</Button>

				<Button
					className="size-8"
					disabled={!table.getCanPreviousPage()}
					onClick={() => table.previousPage()}
					size="icon"
					variant="outline"
				>
					<span className="sr-only">Go to previous page</span>
					<ChevronLeft />
				</Button>

				<Button
					className="size-8"
					disabled={!table.getCanNextPage()}
					onClick={() => table.nextPage()}
					size="icon"
					variant="outline"
				>
					<span className="sr-only">Go to next page</span>
					<ChevronRight />
				</Button>

				<Button
					className="hidden size-8 lg:flex"
					disabled={!table.getCanNextPage()}
					onClick={() => table.setPageIndex(table.getPageCount() - 1)}
					size="icon"
					variant="outline"
				>
					<span className="sr-only">Go to last page</span>
					<ChevronsRight />
				</Button>
			</div>
		</div>
	)
}
