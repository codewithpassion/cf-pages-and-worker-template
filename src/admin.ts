import { Hono } from 'hono'
import { HonoAppType, User, Project } from './types'
import { Users } from './repo/Users'
import { Projects } from './repo/Projects'

const admin = new Hono<HonoAppType>()

// User CRUD operations
admin.post('/users', async (c) => {
  const user: User = await c.req.json()
  const users = new Users(c.env.HEIMDALL_BUCKET)
  await users.create(user)
  return c.json({ message: 'User created', user }, 201)
})

admin.get('/users/:email', async (c) => {
  const email = c.req.param('email')
  const users = new Users(c.env.HEIMDALL_BUCKET)
  const user = await users.read(email)
  if (!user) return c.json({ message: 'User not found' }, 404)
  return c.json({ message: 'User retrieved', user })
})

admin.put('/users/:email', async (c) => {
  const email = c.req.param('email')
  const updatedUser: User = await c.req.json()
  const users = new Users(c.env.HEIMDALL_BUCKET)
  await users.update(updatedUser)
  return c.json({ message: 'User updated', email, updatedUser })
})

admin.delete('/users/:email', async (c) => {
  const email = c.req.param('email')
  const users = new Users(c.env.HEIMDALL_BUCKET)
  await users.delete(email)
  return c.json({ message: 'User deleted', email })
})

// Project CRUD operations
admin.post('/projects', async (c) => {
  const project: Project = await c.req.json()
  const projects = new Projects(c.env.HEIMDALL_BUCKET)
  await projects.create(project)
  return c.json({ message: 'Project created', project }, 201)
})

admin.get('/projects/:name', async (c) => {
  const name = c.req.param('name')
  const projects = new Projects(c.env.HEIMDALL_BUCKET)
  const project = await projects.read(name)
  if (!project) return c.json({ message: 'Project not found' }, 404)
  return c.json({ message: 'Project retrieved', project })
})

admin.put('/projects/:name', async (c) => {
  const name = c.req.param('name')
  const updatedProject: Project = await c.req.json()
  const projects = new Projects(c.env.HEIMDALL_BUCKET)
  await projects.update(updatedProject)
  return c.json({ message: 'Project updated', name, updatedProject })
})

admin.delete('/projects/:name', async (c) => {
  const name = c.req.param('name')
  const projects = new Projects(c.env.HEIMDALL_BUCKET)
  await projects.delete(name)
  return c.json({ message: 'Project deleted', name })
})

export { admin }
