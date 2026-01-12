import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, Ban, KeyRound, MoreHorizontal, Shield, UserCheck, Users } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Input } from '~/components/ui/input'
import { Loader } from '~/components/ui/loader'
import { adminUsersOptions, type UserWithRole } from '~/lib/queries/admin.queries'
import { keys } from '~/lib/queries/keys'
import { BanUserDialog } from './dialogs/ban-user-dialog'
import { ChangePasswordDialog } from './dialogs/change-password-dialog'
import { ChangeRoleDialog } from './dialogs/change-role-dialog'
import { ImpersonateConfirmDialog } from './dialogs/impersonate-confirm-dialog'

const columns: ColumnDef<UserWithRole>[] = [
	{
		accessorKey: 'name',
		header: ({ column }) => (
			<Button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} variant="ghost">
				Name
				<ArrowUpDown className="ml-2 size-4" />
			</Button>
		),
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				{row.original.image ? (
					<img
						alt={row.original.name}
						className="size-8 rounded-full"
						height={32}
						src={row.original.image}
						width={32}
					/>
				) : (
					<div className="flex size-8 items-center justify-center rounded-full bg-muted">
						<Users className="size-4" />
					</div>
				)}
				<span className="font-medium">{row.original.name}</span>
			</div>
		),
	},
	{
		accessorKey: 'email',
		header: ({ column }) => (
			<Button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} variant="ghost">
				Email
				<ArrowUpDown className="ml-2 size-4" />
			</Button>
		),
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<span>{row.original.email}</span>
				{row.original.emailVerified && (
					<Badge className="text-xs" variant="outline">
						Verified
					</Badge>
				)}
			</div>
		),
	},
	{
		accessorKey: 'role',
		header: 'Role',
		cell: ({ row }) => {
			const role = row.original.role
			return <Badge variant={role === 'admin' ? 'default' : 'secondary'}>{role}</Badge>
		},
	},
	{
		accessorKey: 'banned',
		header: 'Status',
		cell: ({ row }) => {
			const isBanned = row.original.banned
			return (
				<Badge variant={isBanned ? 'destructive' : 'outline'}>
					{isBanned ? 'Banned' : 'Active'}
				</Badge>
			)
		},
	},
	{
		accessorKey: 'createdAt',
		header: ({ column }) => (
			<Button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} variant="ghost">
				Created
				<ArrowUpDown className="ml-2 size-4" />
			</Button>
		),
		cell: ({ row }) => {
			const date = new Date(row.original.createdAt)
			return <span className="text-muted-foreground text-sm">{date.toLocaleDateString()}</span>
		},
	},
	{
		id: 'actions',
		header: 'Actions',
		cell: ({ row }) => <UserActions user={row.original} />,
	},
]

// Actions dropdown for each user row
function UserActions({ user }: { user: UserWithRole }) {
	const queryClient = useQueryClient()

	// Dialog states
	const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
	const [roleDialogOpen, setRoleDialogOpen] = useState(false)
	const [banDialogOpen, setBanDialogOpen] = useState(false)
	const [impersonateDialogOpen, setImpersonateDialogOpen] = useState(false)

	// Callback to invalidate users query after action
	const onActionComplete = () => {
		queryClient.invalidateQueries({ queryKey: keys.admin.users.list() })
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<Button className="size-8 p-0" variant="ghost">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuSeparator />

					{/* Change Password */}
					<DropdownMenuItem onSelect={() => setPasswordDialogOpen(true)}>
						<KeyRound className="mr-2 size-4" />
						Change Password
					</DropdownMenuItem>

					{/* Change Role */}
					<DropdownMenuItem onSelect={() => setRoleDialogOpen(true)}>
						<Shield className="mr-2 size-4" />
						Change Role
					</DropdownMenuItem>

					{/* Ban/Unban */}
					<DropdownMenuItem onSelect={() => setBanDialogOpen(true)}>
						{user.banned ? (
							<>
								<UserCheck className="mr-2 size-4" />
								Unblock User
							</>
						) : (
							<>
								<Ban className="mr-2 size-4" />
								Block User
							</>
						)}
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					{/* Impersonate */}
					<DropdownMenuItem onSelect={() => setImpersonateDialogOpen(true)}>
						<Users className="mr-2 size-4" />
						Impersonate
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Dialogs */}
			<ChangePasswordDialog
				onOpenChange={setPasswordDialogOpen}
				onSuccess={onActionComplete}
				open={passwordDialogOpen}
				user={user}
			/>

			<ChangeRoleDialog
				onOpenChange={setRoleDialogOpen}
				onSuccess={onActionComplete}
				open={roleDialogOpen}
				user={user}
			/>

			<BanUserDialog
				onOpenChange={setBanDialogOpen}
				onSuccess={onActionComplete}
				open={banDialogOpen}
				user={user}
			/>

			<ImpersonateConfirmDialog
				onOpenChange={setImpersonateDialogOpen}
				open={impersonateDialogOpen}
				user={user}
			/>
		</>
	)
}

// Main users table component
export function UsersTable() {
	const { data: users, isLoading, isError, error } = useQuery(adminUsersOptions())
	const [sorting, setSorting] = useState<SortingState>([])
	const [globalFilter, setGlobalFilter] = useState('')

	const table = useReactTable({
		data: users ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		state: {
			sorting,
			globalFilter,
		},
	})

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader />
			</div>
		)
	}

	if (isError) {
		return (
			<div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
				Failed to load users: {error.message}
			</div>
		)
	}

	return (
		<div className="space-y-4">
			{/* Search input */}
			<div className="flex items-center gap-4">
				<Input
					className="max-w-sm"
					onChange={(e) => setGlobalFilter(e.target.value)}
					placeholder="Search users..."
					value={globalFilter}
				/>
				<span className="text-muted-foreground text-sm">
					{table.getFilteredRowModel().rows.length} user(s)
				</span>
			</div>

			{/* Table */}
			<div className="rounded-md border">
				<table className="w-full">
					<thead className="border-b bg-muted/50">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										className="px-4 py-3 text-left font-medium text-muted-foreground text-sm"
										key={header.id}
									>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<tr className="border-b last:border-0 hover:bg-muted/50" key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<td className="px-4 py-3" key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</td>
									))}
								</tr>
							))
						) : (
							<tr>
								<td
									className="px-4 py-8 text-center text-muted-foreground"
									colSpan={columns.length}
								>
									No users found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}
