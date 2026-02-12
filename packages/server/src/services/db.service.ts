import { dbInstance } from '@repo/db'
import Elysia from 'elysia'

export const dbService = new Elysia().decorate({ db: dbInstance })
