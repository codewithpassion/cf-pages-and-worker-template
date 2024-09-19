import { Hono, } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { jwt, sign } from 'hono/jwt'
import { HonoAppType, User } from './types'
import { admin } from './admin'
import { UsersRepo } from './repo/Users'
import { createMiddleware } from 'hono/factory'
import { totp } from 'otplib'
import { EmailSender } from './email/sender'
import auth from './auth'

const app = new Hono<HonoAppType>()

totp.options = { digits: 6, step: 60 * 5 }

const requiredEnvVars = [
  'JWT_SECRET',
  'OTP_SECRET',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
];

const envVerificationMiddleware = createMiddleware(async (c, next) => {
  for (const varName of requiredEnvVars) {
    if (!c.env[varName]) {
      throw new Error(`${varName} is required`);
    }
  }
  await next();
});

const jwtMiddleware = createMiddleware(async (c, next) => {
  return jwt({
    secret: c.env.JWT_SECRET,
  })(c, async () => {
    console.log("jwtPayload", c.var.jwtPayload)
    if (c.var.jwtPayload?.type !== 'access') {
      console.log("User tried to access with the wrong token")
      throw new HTTPException(401, { message: 'Unauthorized' })
    }
    await next()
  })
});


const secretsMiddleware = createMiddleware(async (c, next) => {
  c.set('jwtSecret', c.env.JWT_SECRET);
  c.set('otpSecret', c.env.OTP_SECRET);
  await next();
})

const emailSenderMiddleware = createMiddleware(async (c, next) => {
  c.set('emailSender', new EmailSender({
    apiKey: c.env.RESEND_API_KEY,
    from: c.env.RESEND_FROM_EMAIL,
    to: c.env.RESEND_TO_EMAIL,
  }))
  await next();
})

app.use(secretsMiddleware)
app.use(emailSenderMiddleware)
app.use(envVerificationMiddleware)

app.route("/admin", admin)
app.route("/auth", auth)

app.get("/secured", jwtMiddleware, async (c) => {
  console.log("payload", c.var.jwtPayload);
  return c.json({ message: "Secured endpoint" });
})

export default app
