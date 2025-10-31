import Elysia from 'elysia'

export const utilsRouter = new Elysia({ name: 'utils' })
  .get('/', () => 'Backend API')
  .get('/health', () => ({
    status: 'healthy' as const,
    timestamp: new Date().toISOString(),
  }))
