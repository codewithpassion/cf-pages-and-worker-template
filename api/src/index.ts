import { Hono, } from 'hono'
import { cors } from 'hono/cors';
import { HonoAppType } from './types'
import { admin } from './admin'
import { createMiddleware } from 'hono/factory'
import { totp } from 'otplib'
import auth from './auth'
import { emailSenderMiddleware, jwtMiddleware, secretsMiddleware } from './middleware'

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


app.use(secretsMiddleware)
app.use(emailSenderMiddleware)
app.use(envVerificationMiddleware)
app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: "*", //[c.env.CORS_ORIGIN, c.env.API_ENV === 'local' ? 'http://localhost:5173' : ''],
    allowMethods: ['POST', 'OPTIONS'],
    credentials: false,
  });
  return corsMiddleware(c, next);
});

app.route("/admin", admin)
app.route("/auth", auth)


app.get("/open", async (c) => {
  return c.json({ message: "Hello World" });
});

app.get("/secured", jwtMiddleware, async (c) => {
  console.log("payload", c.var.jwtPayload);
  return c.json({ message: "Secured endpoint" });
})

export default app
