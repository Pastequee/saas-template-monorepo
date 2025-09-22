'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { trpc } from '~/router'
import { useAuth } from '../auth/auth-provider'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Loader } from '../ui/loader'

export const AddTodoForm = () => {
  const [newTodo, setNewTodo] = useState('')

  const { isAuthenticated } = useAuth()

  const queryClient = useQueryClient()
  const { isPending: isCreatingTodo, mutate: createTodoMutation } = useMutation(
    trpc.todo.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.todo.all.queryKey() })
      },
    })
  )

  const addTodo = () => {
    createTodoMutation(newTodo, {
      onSuccess: () => {
        setNewTodo('')
      },
    })
  }

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        addTodo()
      }}
    >
      <Input
        autoFocus
        disabled={!isAuthenticated}
        onChange={(e) => {
          setNewTodo(e.target.value)
        }}
        placeholder="Add a new todo"
        value={newTodo}
      />
      <Button
        disabled={!isAuthenticated || isCreatingTodo || newTodo.length === 0}
        type="submit"
      >
        Add
        {isCreatingTodo && <Loader />}
      </Button>
    </form>
  )
}
