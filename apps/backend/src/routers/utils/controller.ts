import Elysia from 'elysia'

export const utilsRouter = new Elysia({ name: 'utils', tags: ['Utils'] })
  .get('/', () => 'Backend API')
  .get('/health', () => ({
    status: 'healthy' as const,
    timestamp: new Date().toISOString(),
  }))
