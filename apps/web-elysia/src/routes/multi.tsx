import { createFileRoute } from '@tanstack/react-router'
import { Main } from '~/lib/multi-test/multi'

export const Route = createFileRoute('/multi')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Main />
}
