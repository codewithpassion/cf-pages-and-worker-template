import { Hono } from 'hono'
import { HonoAppType } from './types'
import { admin } from './admin'

const app = new Hono<HonoAppType>()
app.route("/admin", admin)

export default app
