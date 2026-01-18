import { createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
import { Pencil, Plus } from 'lucide-react'
import { AppTable, AppTableData } from '~/components/app-ui/table/app-table'
import {
	AppTableFooter,
	AppTablePagination,
	AppTableRowSelection,
} from '~/components/app-ui/table/app-table-footer'
import { AppTableHeaderActions } from '~/components/app-ui/table/app-table-header/app-table-header-actions'
import { AppTableHeaderColumnFilter } from '~/components/app-ui/table/app-table-header/app-table-header-column-filter'
import {
	AppTableHeaderFilter,
	AppTableHeaderFilters,
	AppTableHeaderSearch,
} from '~/components/app-ui/table/app-table-header/app-table-header-filters'
import {
	AppTableColumnHeader,
	getActionsColumn,
	getRowSelectionColumn,
} from '~/components/app-ui/table/app-table-header-helpers'
import { useAppTable } from '~/components/app-ui/table/use-app-table'
import {
	enumOptions,
	type Priority,
	priorityOptions,
	type Status,
	statusOptions,
} from '~/components/routes/table/types'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { AppTableHeader } from '../components/app-ui/table/app-table-header'

export const Route = createFileRoute('/table')({
	component: RouteComponent,
})

type Task = {
	id: string
	title: string
	type: string
	status: Status
	priority: Priority
}

const columnsHelpers = createColumnHelper<Task>()

const columns = [
	getRowSelectionColumn<Task>(),

	columnsHelpers.accessor('id', {
		header: ({ column }) => <AppTableColumnHeader column={column}>Task</AppTableColumnHeader>,
		enableHiding: false,
	}),

	columnsHelpers.accessor('title', {
		header: ({ column }) => <AppTableColumnHeader column={column}>Title</AppTableColumnHeader>,
		cell: ({ getValue, row }) => (
			<div className="flex gap-2">
				<Badge variant="outline">{row.getValue('type')}</Badge>
				<span className="max-w-[500px] truncate font-medium">{getValue()}</span>
			</div>
		),
	}),

	columnsHelpers.accessor('type', {
		header: ({ column }) => <AppTableColumnHeader column={column}>Type</AppTableColumnHeader>,
	}),

	columnsHelpers.accessor('status', {
		header: 'Status',
	}),

	columnsHelpers.accessor('priority', {
		header: 'Priority',
	}),

	getActionsColumn<Task>([{ icon: Pencil, label: 'Edit' }]),
]

const tasks: Task[] = [
	{
		id: 'TASK-8713',
		title: 'Create new product',
		type: 'Feature',
		status: 'pending',
		priority: 'low',
	},
	{
		id: 'TASK-8714',
		title: 'Fix bug in product',
		type: 'Bug',
		status: 'pending',
		priority: 'low',
	},
	{
		id: 'TASK-8715',
		title: 'Add new feature to product',
		type: 'Feature',
		status: 'in-progress',
		priority: 'medium',
	},
	{
		id: 'TASK-8716',
		title: 'Update product',
		type: 'Feature',
		status: 'completed',
		priority: 'high',
	},
	{
		id: 'TASK-8717',
		title: 'Refactor code',
		type: 'Feature',
		status: 'completed',
		priority: 'high',
	},
	{
		id: 'TASK-8713',
		title: 'Create new product',
		type: 'Feature',
		status: 'pending',
		priority: 'low',
	},
	{
		id: 'TASK-8714',
		title: 'Fix bug in product',
		type: 'Bug',
		status: 'pending',
		priority: 'low',
	},
	{
		id: 'TASK-8715',
		title: 'Add new feature to product',
		type: 'Feature',
		status: 'in-progress',
		priority: 'medium',
	},
	{
		id: 'TASK-8716',
		title: 'Update product',
		type: 'Feature',
		status: 'completed',
		priority: 'high',
	},
	{
		id: 'TASK-8717',
		title: 'Refactor code',
		type: 'Feature',
		status: 'completed',
		priority: 'high',
	},
	{
		id: 'TASK-8713',
		title: 'Create new product',
		type: 'Feature',
		status: 'pending',
		priority: 'low',
	},
	{
		id: 'TASK-8714',
		title: 'Fix bug in product',
		type: 'Bug',
		status: 'pending',
		priority: 'low',
	},
	{
		id: 'TASK-8715',
		title: 'Add new feature to product',
		type: 'Feature',
		status: 'in-progress',
		priority: 'medium',
	},
	{
		id: 'TASK-8716',
		title: 'Update product',
		type: 'Feature',
		status: 'completed',
		priority: 'high',
	},
	{
		id: 'TASK-8717',
		title: 'Refactor code',
		type: 'Feature',
		status: 'completed',
		priority: 'high',
	},
	{
		id: 'TASK-8713',
		title: 'Create new product',
		type: 'Feature',
		status: 'pending',
		priority: 'low',
	},
	{
		id: 'TASK-8714',
		title: 'Fix bug in product',
		type: 'Bug',
		status: 'pending',
		priority: 'low',
	},
	{
		id: 'TASK-8715',
		title: 'Add new feature to product',
		type: 'Feature',
		status: 'in-progress',
		priority: 'medium',
	},
	{
		id: 'TASK-8716',
		title: 'Update product',
		type: 'Feature',
		status: 'completed',
		priority: 'high',
	},
	{
		id: 'TASK-8717',
		title: 'Refactor code',
		type: 'Feature',
		status: 'completed',
		priority: 'high',
	},
]

function RouteComponent() {
	const table = useAppTable({ columns, data: tasks, rowSelection: true, paginate: true })

	return (
		<div className="p-6">
			<AppTable>
				<AppTableHeader>
					<AppTableHeaderFilters>
						<AppTableHeaderSearch column="id" placeholder="Search tasks..." table={table} />
						<AppTableHeaderFilter
							column={table.getColumn('status')}
							options={enumOptions(statusOptions)}
							title="Status"
						/>
						<AppTableHeaderFilter
							column={table.getColumn('priority')}
							options={enumOptions(priorityOptions)}
							title="Priority"
						/>
					</AppTableHeaderFilters>

					<AppTableHeaderActions>
						<AppTableHeaderColumnFilter table={table} />
						<Button>
							<Plus />
							Add task
						</Button>
					</AppTableHeaderActions>
				</AppTableHeader>

				<AppTableData table={table} />

				<AppTableFooter>
					<AppTableRowSelection table={table} />
					<AppTablePagination table={table} />
				</AppTableFooter>
			</AppTable>
		</div>
	)
}
