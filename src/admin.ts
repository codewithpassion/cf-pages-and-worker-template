import { Hono } from 'hono'
import { HonoAppType, User, Project } from './types'

const admin = new Hono<HonoAppType>()

// User CRUD operations
admin.post('/users', async (c) => {
  const user: User = await c.req.json()
  // TODO: Implement user creation logic
  return c.json({ message: 'User created', user }, 201)
})

admin.get('/users/:email', (c) => {
  const email = c.req.param('email')
  // TODO: Implement user retrieval logic
  return c.json({ message: 'User retrieved', email })
})

admin.put('/users/:email', async (c) => {
  const email = c.req.param('email')
  const updatedUser: User = await c.req.json()
  // TODO: Implement user update logic
  return c.json({ message: 'User updated', email, updatedUser })
})

admin.delete('/users/:email', (c) => {
  const email = c.req.param('email')
  // TODO: Implement user deletion logic
  return c.json({ message: 'User deleted', email })
})

// Project CRUD operations
admin.post('/projects', async (c) => {
  const project: Project = await c.req.json()
  // TODO: Implement project creation logic
  return c.json({ message: 'Project created', project }, 201)
})

admin.get('/projects/:name', (c) => {
  const name = c.req.param('name')
  // TODO: Implement project retrieval logic
  return c.json({ message: 'Project retrieved', name })
})

admin.put('/projects/:name', async (c) => {
  const name = c.req.param('name')
  const updatedProject: Project = await c.req.json()
  // TODO: Implement project update logic
  return c.json({ message: 'Project updated', name, updatedProject })
})

admin.delete('/projects/:name', (c) => {
  const name = c.req.param('name')
  // TODO: Implement project deletion logic
  return c.json({ message: 'Project deleted', name })
})

export { admin }
