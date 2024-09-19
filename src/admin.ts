import { Hono } from 'hono'
import { HonoAppType, User, Project } from './types'
import { UserRepository } from './repo/UserRepository'
import { ProjectRepository } from './repo/ProjectRepository'

const admin = new Hono<HonoAppType>()

// User CRUD operations
admin.post('/users', async (c) => {
  const user: User = await c.req.json()
  const userRepo = new UserRepository(c.env)
  await userRepo.create(user)
  return c.json({ message: 'User created', user }, 201)
})

admin.get('/users/:email', async (c) => {
  const email = c.req.param('email')
  const userRepo = new UserRepository(c.env)
  const user = await userRepo.read(`user:${email}`)
  if (!user) return c.json({ message: 'User not found' }, 404)
  return c.json({ message: 'User retrieved', user })
})

admin.put('/users/:email', async (c) => {
  const email = c.req.param('email')
  const updatedUser: User = await c.req.json()
  const userRepo = new UserRepository(c.env)
  await userRepo.update(updatedUser)
  return c.json({ message: 'User updated', email, updatedUser })
})

admin.delete('/users/:email', async (c) => {
  const email = c.req.param('email')
  const userRepo = new UserRepository(c.env)
  await userRepo.delete(`user:${email}`)
  return c.json({ message: 'User deleted', email })
})

// Project CRUD operations
admin.post('/projects', async (c) => {
  const project: Project = await c.req.json()
  const projectRepo = new ProjectRepository(c.env)
  await projectRepo.create(project)
  return c.json({ message: 'Project created', project }, 201)
})

admin.get('/projects/:name', async (c) => {
  const name = c.req.param('name')
  const projectRepo = new ProjectRepository(c.env)
  const project = await projectRepo.read(`project:${name}`)
  if (!project) return c.json({ message: 'Project not found' }, 404)
  return c.json({ message: 'Project retrieved', project })
})

admin.put('/projects/:name', async (c) => {
  const name = c.req.param('name')
  const updatedProject: Project = await c.req.json()
  const projectRepo = new ProjectRepository(c.env)
  await projectRepo.update(updatedProject)
  return c.json({ message: 'Project updated', name, updatedProject })
})

admin.delete('/projects/:name', async (c) => {
  const name = c.req.param('name')
  const projectRepo = new ProjectRepository(c.env)
  await projectRepo.delete(`project:${name}`)
  return c.json({ message: 'Project deleted', name })
})

export { admin }
