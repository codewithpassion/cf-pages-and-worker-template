import { Hono } from 'hono'
import { HonoAppType, User, Project } from './types'
import { Users } from './repo/Users'
import { Projects } from './repo/Projects'

const admin = new Hono<HonoAppType>()

// Create repositories
const createRepositories = (c: HonoAppType['Context']) => ({
  users: new Users(c.env.HEIMDALL_BUCKET),
  projects: new Projects(c.env.HEIMDALL_BUCKET)
})

// User CRUD operations
admin.post('/users', async (c) => {
  const user: User = await c.req.json()
  const { users } = createRepositories(c)
  await users.create(user)
  return c.json({ message: 'User created', user }, 201)
})

admin.get('/users/:email', async (c) => {
  const email = c.req.param('email')
  const { users } = createRepositories(c)
  const user = await users.read(email)
  if (!user) return c.json({ message: 'User not found' }, 404)
  return c.json({ message: 'User retrieved', user })
})

admin.put('/users/:email', async (c) => {
  const email = c.req.param('email')
  const updatedUser: User = await c.req.json()
  const { users } = createRepositories(c)
  await users.update(updatedUser)
  return c.json({ message: 'User updated', user: updatedUser })
})

admin.delete('/users/:email', async (c) => {
  const email = c.req.param('email')
  const { users } = createRepositories(c)
  await users.delete(email)
  return c.json({ message: 'User deleted', email })
})

// Project CRUD operations
admin.post('/projects', async (c) => {
  const project: Project = await c.req.json()
  const { projects } = createRepositories(c)
  await projects.create(project)
  return c.json({ message: 'Project created', project }, 201)
})

admin.get('/projects/:name', async (c) => {
  const name = c.req.param('name')
  const { projects } = createRepositories(c)
  const project = await projects.read(name)
  if (!project) return c.json({ message: 'Project not found' }, 404)
  return c.json({ message: 'Project retrieved', project })
})

admin.put('/projects/:name', async (c) => {
  const name = c.req.param('name')
  const updatedProject: Project = await c.req.json()
  const { projects } = createRepositories(c)
  await projects.update(updatedProject)
  return c.json({ message: 'Project updated', project: updatedProject })
})

admin.delete('/projects/:name', async (c) => {
  const name = c.req.param('name')
  const { projects } = createRepositories(c)
  await projects.delete(name)
  return c.json({ message: 'Project deleted', name })
})

export { admin }
