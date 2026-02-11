# Frontend Patterns

## File Organization

```
src/
  components/
    feature/          # Feature-specific components
      component.tsx
    ui/               # Reusable UI primitives
  lib/
    hooks/            # Custom React hooks
    mutations/        # TanStack Query mutations options
    queries/          # TanStack Query queries options
  routes/             # TanStack Start file-based routes
```

## Data Fetching (Eden + TanStack Query)

Use the Eden client (from `~/lib/server-fn/eden`) with query/mutation option factories:

```typescript
// queries/todos.queries.ts
import { edenQueryOption } from '~/lib/utils/eden-query'
import { eden } from '~/lib/server-fn/eden'
import { keys } from './keys'

export const todoListOptions = () =>
  edenQueryOption({
    edenQuery: eden().todos.get,
    queryKey: keys.todos.list(),
  })

// mutations/todos.mutations.ts
import { edenMutationOption } from '~/lib/utils/eden-query'

export const createTodoOptions = () =>
  edenMutationOption({
    edenMutation: eden().todos.post,
    meta: { invalidate: [keys.todos.list()] },
  })
```

```typescript
// Component usage
import { useQuery, useMutation } from '@tanstack/react-query'

const { data, isLoading } = useQuery(todoListOptions())
const mutation = useMutation(createTodoOptions())
```

**Note:** The Eden client uses `createIsomorphicFn` from TanStack Start, which allows server-side calls to bypass HTTP overhead when running in the same process.

## Query Keys

Centralize query keys in `lib/queries/keys.ts`:

```typescript
export const keys = {
  todos: {
    all: ['todos'] as const,
    list: () => [...keys.todos.all, 'list'] as const,
    item: (id: string) => [...keys.todos.all, 'item', id] as const,
  },
}
```

## Component Guidelines

- Keep components small and focused
- Extract reusable logic into custom hooks
- Use early returns for loading/error states
- Prefer composition over prop drilling

```typescript
export const TodoList = () => {
  const { data: todos, isLoading, isSuccess } = useQuery(todoListOptions())

  if (isLoading) return <Loader />
  if (!isSuccess || todos.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)}
    </div>
  )
}
```

## Form Guidelines (TanStack Form + Zod)

Use `useAppForm` from `~/lib/hooks/form-hook` (not raw TanStack Form):

```typescript
const formSchema = z.object({
  email: z.string().nonempty('Email is required'),
  password: z.string().min(8),
})

const form = useAppForm({
  defaultValues: { email: '', password: '' },
  validators: { onChange: formSchema, onMount: formSchema, onSubmit: formSchema },
  onSubmit: async ({ value }) => { /* handle submit */ },
})

return (
  <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
    <form.AppField name="email">
      {(field) => <field.TextField label="Email" type="email" />}
    </form.AppField>

    <form.AppForm>
      <form.SubmitButton label="Submit" />
    </form.AppForm>
  </form>
)
```

**Key patterns:**
- Field components use `useFieldContext()` — see `components/form-fields/text-field.tsx`
- Form components use `useFormContext()` — see `components/form-fields/submit-button.tsx`
- Register new components in `lib/hooks/form-hook.ts` under `fieldComponents` or `formComponents`
- Use `withFieldGroup()` for reusable form sections
- Use `withForm()` to wrap forms with additional functionality
