import Elysia from 'elysia'

export const utilsRouter = new Elysia()
  .get('/', () => 'Backend API')
  .get('/e', () => {
    throw new Error('Unexpected problem occured')
  })
  .get('/health', () => ({
    status: 'healthy' as const,
    timestamp: new Date().toISOString(),
  }))
